from rest_framework import serializers



class RecentOrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_number = serializers.UUIDField()
    customer_name = serializers.CharField()
    items_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    total_amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )
    status = serializers.CharField()




class DashboardSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_users = serializers.IntegerField()

    total_revenue = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
    )

    recent_orders = RecentOrderSerializer(many=True)
    