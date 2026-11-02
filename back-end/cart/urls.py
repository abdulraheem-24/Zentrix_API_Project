from django.urls import path
from .views import (
    CartView,
    CartItemAddView,
    CartItemDetailView,
    CartClearView
)



urlpatterns = [
    path("cart/", CartView.as_view(), name="cart-detail"),
    path("cart/items/", CartItemAddView.as_view(), name="cart-item-add"),
    path("cart/items/<int:item_id>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("cart/clear/", CartClearView.as_view(), name="cart-clear"),
]