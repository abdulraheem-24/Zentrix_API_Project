from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from catalog.models import Category, Product
from .models import Cart, CartItem


User = get_user_model()



class CartTests(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.user = User.objects.create_user(
            username="cartuser",
            email="cartuser@gmail.com",
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




    def test_add_product_to_cart_success(self):

        response = self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product.id,
                "quantity": 2
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        cart_item = CartItem.objects.get(
            product=self.product
        )

        self.assertEqual(cart_item.quantity, 2)

        self.assertEqual(response.data["total_quantity"], 2)

        self.assertEqual(
            Decimal(response.data["subtotal"]),
            Decimal("1800.00")
        )



    def test_add_unavailable_product_or_exceed_stock(self):

        self.product.is_active = False
        self.product.save()

        unavailable_response = self.client.post(
            "/api/cart/items/",
            {
                "product_id": self.product.id,
                "quantity": 1
            },
            format="json"
        )

        self.assertEqual(unavailable_response.status_code, 400)

        self.product.is_active = True
        self.product.stock = 2
        self.product.save()


        stock_response = self.client.post(
             "/api/cart/items/",
            {
                "product_id": self.product.id,
                "quantity": 3
            },
            format="json"
        )

        self.assertEqual(stock_response.status_code, 400)

        self.assertEqual(CartItem.objects.count(), 0)



    def test_update_and_remove_cart_item(self):

        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=2
        )

        update_response = self.client.patch(
            f"/api/cart/items/{item.id}/",
            {
                "quantity": 4
            },
            format="json"
        )

        self.assertEqual(update_response.status_code, 200)

        item.refresh_from_db()

        self.assertEqual(item.quantity, 4)

        self.assertEqual(update_response.data["total_quantity"], 4)


        delete_response = self.client.delete(
            f"/api/cart/items/{item.id}/"
        )

        self.assertEqual(delete_response.status_code, 200)

        self.assertFalse(
            CartItem.objects.filter(id= item.id).exists()
        )

        self.assertEqual(delete_response.data["total_quantity"], 0)