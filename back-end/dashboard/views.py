from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsZentrixAdmin
from catalog.models import Product
from orders.models import Order
from .serializers import DashboardSerializer



User = get_user_model()


class AdminDashboardView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsZentrixAdmin,
    ]

    def get(self, request):

        total_orders = Order.objects.count()

        total_products = Product.objects.filter(
            is_active=True,
        ).count()

        total_users = User.objects.filter(
            role="customer",
        ).count()


        revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID,
        ).exclude(
            status=Order.Status.CANCELLED,
        ).aggregate(
            total=Sum("total_amount"),
        )

        total_revenue = revenue["total"] or Decimal("0.00")


        recent_orders = (
            Order.objects
            .annotate(
                items_count=Count("items"),
            ).order_by("-created_at")[:5]
        )


        dashboard_data = {
            "total_orders": total_orders,
            "total_products" : total_products,
            "total_users": total_users,
            "total_revenue": total_revenue,
            "recent_orders": recent_orders,
        }

        serializer = DashboardSerializer(
            dashboard_data,
        )

        return Response(serializer.data)
    