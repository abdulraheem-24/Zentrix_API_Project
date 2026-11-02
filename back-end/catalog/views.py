from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsZentrixAdmin
from .models import Category, Product
from .serializers import (
    CategorySerializer, 
    ProductListSerializer, 
    ProductDetailSerializer,
    AdminProductSerializer,
)
from .pagination import ProductPagination
from .filters import ProductFilter, FlexibleOrderingFilter
from rest_framework.decorators import action



class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    queryset = Category.objects.filter(is_active=True).order_by("name")


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    queryset = (
        Product.objects.filter(
            is_active=True,
            category__is_active=True,
        )
        .select_related("category")
        .order_by("id")
    )


    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        FlexibleOrderingFilter,
    ]

    filterset_class = ProductFilter


    ordering_fields = [
        "id",
        "name",
        "price",
        "rating",
        "reviews",
        "created_at",
    ]

    search_fields = [
        "name",
        "brand",
        "description",
        "category__name",
    ]
    

    ordering = ["id"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer

        return ProductListSerializer


    @action(
        detail=False,
        methods=["get"],
        url_path="hero",
    )
    def hero_products(self, request):

        products = self.get_queryset().filter(
            is_hero=True
        ).order_by("id")

        serializer = ProductListSerializer(
            products,
            many=True,
            context=self.get_serializer_context(),
        )

        return Response(serializer.data)




class AdminProductViewsSet(viewsets.ModelViewSet):
    serializer_class = AdminProductSerializer
    permission_classes = [IsZentrixAdmin]


    queryset = (
        Product.objects
        .select_related("category")
        .all()
        .order_by("-created_at")
    )


    def destroy(self, request, *args, **kwargs):
       product = self.get_object()

       product.is_active = False
       product.save(update_fields=["is_active", "updated_at"])

       return Response(
           {"message": "Product deactivated successfully."},
           status=status.HTTP_200_OK,
       )





    

    





# from rest_framework.decorators import action
# from rest_framework.response import Response


# @action(detail=False, methods=["get"], url_path="hero")
# def hero_products(self, request):
#     names = [
#         "ASUS Vivobook S16",
#         "Nothing Headphone (1)",
#         "iPhone 17 Pro Max",
#     ]

#     products = self.get_queryset().filter(name__in=names)

#     serializer = ProductListSerializer(
#         products,
#         many=True,
#         context={"request": request},
#     )

#     return Response(serializer.data)