from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):


    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
        ]
        read_only_fields = fields




class ProductListSerializer(serializers.ModelSerializer):

    category = serializers.SlugRelatedField(
        slug_field = 'name',
        read_only = True,
    )

    subCategory = serializers.CharField(
        source = "sub_category",
        read_only = True,
    )



    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "category",
            "subCategory",
            "price",
            "discount",
            "rating",
            "reviews",
            "stock",
            "featured",
            "image",
        ]
        read_only_fields = fields


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description",
            "specs",
            "created_at",
            "updated_at",
        ]







class AdminProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True)
    )

    subCategory = serializers.CharField(
        source="sub_category",
        required=False,
        allow_blank=True,
    )

    # slug = serializers.SlugField(
    #     required=False,
    #     allow_blank=False,
    # )

    price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0,
    )

    discount = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=100,
        required=False,
        default=0,
    )

    stock = serializers.IntegerField(
        min_value=0,
        required=False,
        default=0,
    )

    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        read_only=True,
    )

    reviews = serializers.IntegerField(read_only=True)


    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "category",
            "subCategory",
            "price",
            "discount",
            "rating",
            "reviews",
            "stock",
            "featured",
            "is_hero",
            "image",
            "description",
            "specs",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "rating",
            "reviews",
            "created_at",
            "updated_at",
        ]