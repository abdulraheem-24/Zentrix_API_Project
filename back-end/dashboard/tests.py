from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from catalog.models import Category, Product
from orders.models import Order


User = get_user_model()



class DashboardTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        
        self.admin = User.objects.create_user(
            username="testadmin",
            email="testadmin@gmail.com",
            password="testadmin123",
            role="admin",
            is_staff=True
        )

        
        self.customer = User.objects.create_user(
            username="testcustomer",
            email="testcustomer@gmail.com",
            password="testcustomer123",
            role="customer"
        )

        
        self.category = Category.objects.create(
            name="Electronics",
            is_active=True
        )

        
        self.active_product = Product.objects.create(
            category=self.category,
            name="Wireless Mouse",
            brand="Logitech",
            price=Decimal("1000.00"),
            discount=Decimal("10.00"),
            stock=10,
            is_active=True
        )

         
        self.inactive_product = Product.objects.create(
            category=self.category,
            name="Wireless Headset",
            brand="Sony",
            price=Decimal("1000.00"),
            discount=Decimal("10.00"),
            stock=20,
            is_active=False
        )

        
        self.paid_order = Order.objects.create(
            user=self.customer,
            customer_name="Test Customer",
            customer_email="testcustomer@gmail.com",
            customer_phone="9876543210",
            shipping_address="123 Main Street",
            shipping_district="Palakkad",
            shipping_city="Pattambi",
            shipping_state="Kerala",
            shipping_postal_code="679303",
            shipping_country="India",
            payment_method="cod",
            payment_status=Order.PaymentStatus.PAID,
            subtotal=Decimal("1800.00"),
            total_amount=Decimal("1800.00"),
        )

         
        self.client.force_authenticate(user=self.admin)



    def test_admin_can_access_dashboard(self):

        response = self.client.get(
            "/api/admin/dashboard/",
        )


        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["total_orders"],
            1
        )

        self.assertEqual(
            response.data["total_products"],
            1
        )

        self.assertEqual(
            response.data["total_users"],
            1
        )

        self.assertEqual(
            response.data["total_revenue"],
            "1800.00"
        )

        self.assertEqual(
            len(response.data["recent_orders"]),
            1
        )

        self.assertEqual(
            response.data["recent_orders"][0]["id"],
            self.paid_order.id
        )







    def test_customer_cannot_access_dashboard(self):


        self.client.force_authenticate(user=self.customer)

        response = self.client.get("/api/admin/dashboard/")

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


