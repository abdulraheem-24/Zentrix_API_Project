from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from catalog.models import Category, Product
from cart.models import Cart, CartItem
from .models import Order, OrderItem


User = get_user_model()



class OrderTests(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.user = User.objects.create_user(
            username="orderuser",
            email="orderuser@gmail.com",
            password="StrongPassword123!"
        )

        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(
             name="Electronics",
            is_active=True
        )

        self.product = Product.objects.create(
            category=self.category,
            name="Wireless Mouse",
            brand="Logitech",
            price=Decimal("1000.00"),
            discount=Decimal("10.00"),
            stock=10,
            is_active=True
        )

        self.cart = Cart.objects.create(
            user=self.user
        )

        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )


    def test_order_creation_success(self):

        response = self.client.post(
            "/api/orders/",
            {
                "customer_name": "Test Customer",
                "customer_email": "orderuser@gmail.com",
                "customer_phone": "9876543210",
                "shipping_address": "123 Main Street",
                "shipping_district": "Palakkad",
                "shipping_city": "Pattambi",
                "shipping_state": "Kerala",
                "shipping_postal_code": "679303",
                "shipping_country": "India",
                "payment_method": "cod",
                "save_address": False,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        order = Order.objects.get(
            user=self.user
        )

        self.assertEqual(order.status, Order.Status.PROCESSING)

        self.assertEqual(order.payment_status, Order.PaymentStatus.PENDING)

        self.assertEqual(order.subtotal, Decimal("1800.00"))

        self.assertEqual(order.total_amount, Decimal("1800.00"))

        self.assertEqual(order.items.count(), 1)

        order_item = order.items.first()

        self.assertEqual(order_item.quantity, 2)

        self.assertEqual(order_item.unit_price, Decimal("900.00"))

        self.product.refresh_from_db()

        self.assertEqual(self.product.stock, 8)

        self.assertEqual(self.cart.items.count(), 0)




    def test_order_cancellation_restores_stock(self):

        response = self.client.post(
            "/api/orders/",
            {
                "customer_name": "Test Customer",
                "customer_email": "orderuser@gmail.com",
                "customer_phone": "9876543210",
                "shipping_address": "123 Main Street",
                "shipping_district": "Palakkad",
                "shipping_city": "Pattambi",
                "shipping_state": "Kerala",
                "shipping_postal_code": "679303",
                "shipping_country": "India",
                "payment_method": "cod",
                "save_address": False,
            },
            format="json"
        )


        self.assertEqual(response.status_code, 201)

        order = Order.objects.get(user=self.user)

        self.product.refresh_from_db()

        self.assertEqual(self.product.stock, 8)

        cancel_response = self.client.post(
            f"/api/orders/{order.id}/cancel/"
        )

        self.assertEqual(cancel_response.status_code, 200)

        order.refresh_from_db()
        self.product.refresh_from_db()

        self.assertEqual(
            order.status,
            Order.Status.CANCELLED
        )

        self.assertEqual(self.product.stock, 10)




    def test_customer_cannot_access_another_users_order(self):

        response = self.client.post(
            "/api/orders/",
            {
                "customer_name": "Test Customer",
                "customer_email": "orderuser@gmail.com",
                "customer_phone": "9876543210",
                "shipping_address": "123 Main Street",
                "shipping_district": "Palakkad",
                "shipping_city": "Pattambi",
                "shipping_state": "Kerala",
                "shipping_postal_code": "679303",
                "shipping_country": "India",
                "payment_method": "cod",
                "save_address": False,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)


        order = Order.objects.get(user=self.user)

        another_user = User.objects.create_user(
            username="anotheruser",
            email="another@gmail.com",
            password="StrongPassword123!"
        )

        self.client.force_authenticate(user=another_user)

        response = self.client.get(
            f"/api/orders/{order.id}/"
        )

        self.assertEqual(response.status_code, 404)









class OrderAPIPermissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testcustomer",
            email="customer@example.com",
            password="TestPassword123!",
        )

    def test_orders_require_authentication(self):
        response = self.client.get("/api/orders/")

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )
