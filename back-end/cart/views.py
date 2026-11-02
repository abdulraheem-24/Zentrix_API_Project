from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from catalog.models import Product
from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    CartItemAddSerializer,
)




def get_user_cart(user):
    cart,_ = Cart.objects.get_or_create(user=user)
    return cart


def get_cart_queryset():
    return Cart.objects.prefetch_related("items__product")



class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart = get_user_cart(request.user)

        cart = get_object_or_404(
            get_cart_queryset(),
            pk=cart.pk,
            user=request.user,
        )

        return Response(CartSerializer(cart).data)


class CartItemAddView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request):
        serializer = CartItemAddSerializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]


        with transaction.atomic():
            product = get_object_or_404(
                Product.objects.select_for_update(),
                pk=product_id,
                is_active=True,
                category__is_active=True,
            )


            cart = get_user_cart(request.user)

            item = (
                CartItem.objects.select_for_update()
                .filter(cart=cart, product=product)
                .first()
            )

            new_quantity = quantity

            if item:
                new_quantity += item.quantity

            if product.stock < new_quantity:
                raise ValidationError({
                    "quantity": (
                        f"Only {product.stock} units are currently in stock."
                    )
                })

            if item:
                item.quantity = new_quantity
                item.save(update_fields=["quantity", "updated_at"])
            else:
                CartItem.objects.create(
                    cart=cart,
                    product=product,
                    quantity=quantity,
                )


        cart = get_object_or_404(
            get_cart_queryset(),
            pk=cart.pk,
            user=request.user,
        )

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )




class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]


    def patch(self, request, item_id):
        quantity = request.data.get("quantity")

        if (
            isinstance(quantity, bool) 
            or not isinstance(quantity, int)
            or quantity < 1
        ):
            raise ValidationError({
                "quantity": "Enter a positive integer."
            })

        with transaction.atomic():
            item = get_object_or_404(
                CartItem.objects.select_for_update()
                .select_related("product", "cart"),
                pk=item_id,
                cart__user=request.user,
            )

            product = Product.objects.select_for_update().get(
                pk=item.product_id,
            )    

            if not product.is_active or not product.category.is_active:
                raise ValidationError(
                    "This product is no longer available."
                )


            if quantity > product.stock:
                raise ValidationError({
                    "quantity": f"Only {product.stock} units are currently in stock."
                })

            item.quantity = quantity
            item.save(update_fields=["quantity", "updated_at"])

            cart_id = item.cart_id

        cart = get_object_or_404(
            get_cart_queryset(),
            pk=cart_id,
            user=request.user,
        )

        return Response(CartSerializer(cart).data)


    def delete(self, request, item_id):
        item = get_object_or_404(
            CartItem.objects.filter(
                cart__user=request.user
            ),
            pk=item_id,
        )

        cart_id = item.cart_id
        item.delete()


        cart = get_object_or_404(
            get_cart_queryset(),
            pk=cart_id,
            user=request.user,
        )

        return Response(CartSerializer(cart).data)


class CartClearView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_user_cart(request.user)
        cart.items.all().delete()

        return Response(
            CartSerializer(
                get_object_or_404(
                    get_cart_queryset(),
                    pk=cart.pk,
                    user=request.user,
                )
            ).data
        )


