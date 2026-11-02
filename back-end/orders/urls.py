from rest_framework.routers import DefaultRouter
from .views import (
    AddressViewSet,
    OrderViewSet,
    AdminOrderViewSet,
)



router = DefaultRouter()


router.register(
    "addresses",
    AddressViewSet,
    basename="address",
)

router.register(
    "orders",
    OrderViewSet,
    basename="order",
)

router.register(
    "admin/orders",
    AdminOrderViewSet,
    basename="admin-orders",
)


urlpatterns = router.urls
