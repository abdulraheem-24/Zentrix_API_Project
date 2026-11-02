from rest_framework import serializers
from .models import Address, Order, OrderItem



class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
             "id",
            "full_name",
            "phone",
            "address_line",
            "district",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]



class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=150)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20)

    shipping_address = serializers.CharField(max_length=255)
    shipping_district = serializers.CharField(max_length=100)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=10)
    shipping_country = serializers.CharField(max_length=100, default="India")

    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
    )

    save_address = serializers.BooleanField(default=False)




class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_brand",
            "product_image",
            "unit_price",
            "quantity",
            "line_total",
        ]
        read_only_fields = fields




class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)


    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "customer_email",
            "customer_phone",
            "shipping_address",
            "shipping_district",
            "shipping_city",
            "shipping_state",
            "shipping_postal_code",
            "shipping_country",
            "items",
            "status",
            "payment_method",
            "payment_status",
            "subtotal",
            "shipping_charge",
            "discount_amount",
            "total_amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields





class AdminOrderSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(
        choices=Order.Status.choices,
    )

    class Meta:
        model = Order
        fields = ["status"]


    def validate_status(self, value):
        allowed_transitions = {
            Order.Status.PROCESSING: [
                Order.Status.PACKED,
            ],
            Order.Status.PACKED: [
                Order.Status.SHIPPED,
            ],
            Order.Status.SHIPPED: [
                Order.Status.DELIVERED,
            ],
            Order.Status.DELIVERED: [],
            Order.Status.CANCELLED: [],
        }

        current_status = self.instance.status

        if value not in allowed_transitions[current_status]:
            raise serializers.ValidationError(
                f"Cannot change order from "
                f"{current_status} to {value}."
            )

        return value




    def update(self, instance, validated_data):
        new_status = validated_data.get(
            "status",
            instance.status
        )

        instance.status = new_status

        if new_status == Order.Status.DELIVERED:
            instance.payment_status = Order.PaymentStatus.PAID

        instance.save()

        return instance

    