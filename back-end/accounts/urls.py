from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

router = DefaultRouter()

router.register(
    "admin/users",
    views.AdminUserViewSet,
    basename="admin-users",
)



urlpatterns = [
    path('register/', views.RegisterUserView.as_view(), name="register"),
    path('login/', TokenObtainPairView.as_view(), name="login"),
    path('token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.CurrentUserView.as_view(), name="current-user"),

    path("", include(router.urls)),
]
