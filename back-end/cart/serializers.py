from decimal import Decimal
from rest_framework import serializers
from catalog.models import Product
from .models import Cart, CartItem



class CartItemAddSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, default=1,)


    def validate_product_id(self, value):
        product = Product.objects.filter(
            pk=value,
            is_active=True,
            category__is_active=True,
        ).first()


        if product is None:
            raise serializers.ValidationError(
                "This product is unavailable."
            )

        return value


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(
        source="product.id",
        read_only=True,
    )

    name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    slug = serializers.CharField(
        source="product.slug",
        read_only=True,
    )

    brand = serializers.CharField(
        source="product.brand",
        read_only=True,
    )

    image = serializers.CharField(
        source="product.image",
        read_only=True,
    )
    
    price = serializers.DecimalField(
        source="product.price",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    discount = serializers.DecimalField(
        source="product.discount",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    unit_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    line_total = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )


    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_id",
            "name",
            "slug",
            "brand",
            "image",
            "price",
            "discount",
            "quantity",
            "unit_price",
            "line_total",
        ]
        read_only_fields = fields





class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_quantity = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_quantity",
            "subtotal",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_total_quantity(self, cart):
        return sum(
            item.quantity for item in cart.items.all()
        )

    def get_subtotal(self, cart):
        return sum(
            (item.line_total for item in cart.items.all()),
            Decimal("0.00"),
        )

