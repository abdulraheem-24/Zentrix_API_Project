from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from accounts.permissions import IsZentrixAdmin
from catalog.models import Product
from cart.models import Cart, CartItem
from .models import Address, Order, OrderItem
from .serializers import (
    AddressSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    AdminOrderSerializer,
)



SHIPPING_CHARGE = Decimal("0.00")


def money(value):
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )



class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        return Address.objects.filter(
            user=self.request.user,
        ).order_by("-is_default", "-created_at")


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = [
        "get", "post", "head", "options",
    ]



    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-created_at")
        )


    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        shipping_fields = [
            "shipping_address",
            "shipping_district",
            "shipping_city",
            "shipping_state",
            "shipping_postal_code",
            "shipping_country",
        ]

        
        with transaction.atomic():
            cart = get_object_or_404(
                Cart.objects.select_for_update(),
                user=request.user,
            )

            cart_items = list(
                CartItem.objects
                .filter(cart=cart)
                .select_related("product", "product__category")
                .order_by("product_id")
            )


            if not cart_items:
                raise ValidationError({
                    "cart": "Your cart is empry."
                })

            product_ids = sorted({
                item.product_id for item in cart_items
            })

            locked_products = {
                product.pk: product
                for product in Product.objects
                .select_for_update()
                .filter(pk__in=product_ids)
                .order_by("pk")
            }

            subtotal = Decimal("0.00")
            prepared_items = []

            for item in cart_items:
                product = locked_products.get(item.product_id)

                if (
                    product is None
                    or not product.is_active
                    or not product.category.is_active
                ):
                    raise ValidationError({
                        "cart": (
                            f"{item.product.name} is unavialable."
                        )
                    })

                if item.quantity > product.stock:
                    raise ValidationError({
                        "stock": (
                            f"insufficient stock for {product.name}."
                        )
                    })

                unit_price = money(product.discounted_price)
                line_total = money(unit_price * item.quantity)
                subtotal += line_total

                prepared_items.append({
                    "product": product,
                    "name": product.name,
                    "brand": product.brand,
                    "image": product.image,
                    "unit_price": unit_price,
                    "quantity": item.quantity,
                    "line_total": line_total,
                })

            subtotal = money(subtotal)
            shipping_charge = SHIPPING_CHARGE
            discount_amount = Decimal("0.00")
            total_amount = money(
                subtotal + shipping_charge - discount_amount
            )

            address = None

            if data["save_address"]:
                address = Address.objects.create(
                    user=request.user,
                    full_name=data["customer_name"],
                    phone=data["customer_phone"],
                    address_line=data["shipping_address"],
                    district=data["shipping_district"],
                    city=data["shipping_city"],
                    state=data["shipping_state"],
                    postal_code=data["shipping_postal_code"],
                    country=data["shipping_country"],
                )


            order = Order.objects.create(
                user=request.user,
                address=address,
                customer_name=data["customer_name"],
                customer_email=data["customer_email"],
                customer_phone=data["customer_phone"],
                **{
                    field: data[field]
                    for field in shipping_fields
                },
                payment_method=data["payment_method"],
                payment_status=Order.PaymentStatus.PENDING,
                status=Order.Status.PROCESSING,
                subtotal=subtotal,
                shipping_charge=shipping_charge,
                discount_amount=discount_amount,
                total_amount=total_amount,
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product=item["product"],
                    product_name=item["name"],
                    product_brand=item["brand"],
                    product_image=item["image"],
                    unit_price=item["unit_price"],
                    quantity=item["quantity"],
                    line_total=item["line_total"],
                )
                for item in prepared_items
            ])

            for item in prepared_items:
                Product.objects.filter(
                    pk=item["product"].pk,
                    stock__gte=item["quantity"],
                ).update(
                    stock=F("stock") - item["quantity"]
                )


            cart.items.all().delete()



        order = self.get_queryset().get(pk=order.pk)

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )       


    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        with transaction.atomic():
            order = get_object_or_404(
                Order.objects.select_for_update(),
                pk=pk,
                user=request.user,
            )

            if order.status != Order.Status.PROCESSING:
                raise ValidationError({
                    "status": (
                        "Only processing orders can be cancelled."
                    )
                })

            if order.payment_status in [
                Order.PaymentStatus.PAID,
                Order.PaymentStatus.REFUNDED,
            ]:
                raise ValidationError({
                    "payment_status": (
                        "Paid orders require the appropriate "
                        "refund workflow before cancellation."
                    )
                })


            items = list(
                order.items.select_related("product")
            )

            for item in items:
                if item.product_id is not None:
                    Product.objects.filter(
                        pk=item.product_id,
                    ).update(
                        stock=F("stock") + item.quantity
                    )

            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])


        return Response(OrderSerializer(order).data)

        






class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsZentrixAdmin]


    queryset = (
        Order.objects
        .select_related("user")
        .prefetch_related("items")
        .order_by("-created_at")
    )


    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # filterset_fields = [
    #     "status",
    #     "payment_status",
    #     "payment_method"
    # ]

    search_fields = [
        "customer_name",
        "customer_email",
        "created_at",
    ]


    # ordering_fields = [
    #     "created_at",
    #     "total_amount",
    #     "status",
    # ]

    ordering = ["-created_at"]


    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        order = self.get_object()


        serializer = AdminOrderSerializer(
            order,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )




    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        with transaction.atomic():
            order = (
                self.get_queryset()
                .select_for_update()
                .get(pk=self.get_object().pk)
            )

            if order.status not in [
                Order.Status.PROCESSING,
                Order.Status.PACKED
            ]:
                raise ValidationError({
                    "status": (
                        "Only processing or packed orders "
                        "can be cancelled."
                    )
                })

            if order.payment_status not in [
                Order.PaymentStatus.PENDING,
                Order.PaymentStatus.FAILED,
            ]:
                raise ValidationError({
                    "payment_status": (
                        "This order cannot be cancelled through "
                        "this endpoint because payment handling "
                        "is required."
                    )
                })

            items = list(
                order.items.select_related("product")
            )

            for item in items:
                if item.product_id:
                    Product.objects.filter(
                        pk=item.product_id
                    ).update(
                        stock=F("stock") + item.quantity
                    )

            order.status = Order.Status.CANCELLED
            order.save(
                update_fields=["status", "updated_at"]
            )


        order.refresh_from_db()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )












    # filter_backends = [
    #     DjangoFilterBackend,
    #     filters.SearchFilter,
    #     filters.OrderingFilter,
    # ]

    # filterset_fields = [
    #     "status",
    #     "payment_status",
    #     "payment_method",
    # ]

    # search_fields = [
    #     "customer_name",
    #     "customer_email",
    # ]

    # ordering_fields = [
    #     "created_at",
    #     "total_amount",
    #     "status",
    # ]

    # ordering = ["-create_at"]






# from django.db import transaction
# from django.shortcuts import get_object_or_404

# from .models import Address


# @transaction.atomic
# def set_default_address(user, address_id):
#     # Lock this user's row to coordinate default-address changes.
#     type(user).objects.select_for_update().get(pk=user.pk)

#     # Ensure the address belongs to the authenticated user.
#     address = get_object_or_404(
#         Address.objects.select_for_update(),
#         pk=address_id,
#         user=user,
#     )

#     # Remove the default status from all the user's addresses.
#     Address.objects.filter(user=user).update(
#         is_default=False,
#     )

#     # Make the selected address the default.
#     address.is_default = True
#     address.save(update_fields=["is_default", "updated_at"])

#     return address