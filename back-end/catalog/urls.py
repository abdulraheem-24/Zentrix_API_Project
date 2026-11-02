from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, 
    ProductViewSet,
    AdminProductViewsSet,
)



router = DefaultRouter()


router.register(
    "categories",
    CategoryViewSet,
    basename="category",
)


router.register(
    "products",
    ProductViewSet,
    basename="product",
)


router.register(
    "admin/products",
    AdminProductViewsSet,
    basename="admin-product",
)



urlpatterns = router.urls