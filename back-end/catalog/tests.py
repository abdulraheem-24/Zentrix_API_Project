from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Category, Product



class CatalogTests(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.category = Category.objects.create(
            name="Electronics",
            is_active=True
        )

        self.inactive_category = Category.objects.create(
            name="Furniture",
            is_active=False
        )


        self.product1 = Product.objects.create(
            category=self.category,
            name="Wireless Mouse",
            brand="Logitech",
            price=Decimal("1000.00"),
            discount=Decimal("10.00"),
            rating=Decimal("4.50"),
            stock=10,
            is_active=True
        )


        self.product2 = Product.objects.create(
            category=self.category,
            name="Mechanical Keyboard",
            brand="Logitech",
            price=Decimal("3000.00"),
            rating=Decimal("4.80"),
            stock=5,
            is_active=True
        )


        self.inactive_product = Product.objects.create(
            category=self.category,
            name="Old Headphones",
            brand="Sony",
            price=Decimal("2000.00"),
            stock=0,
            is_active=False
        )


        self.hidden_category_product = Product.objects.create(
            category=self.inactive_category,
            name="Office Chair",
            brand="Ikea",
            price=Decimal("5000.00"),
            stock=5,
            is_active=True
        )


    def test_product_listing_and_pagination(self):

        response = self.client.get(
            "/api/products/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.data["count"], 2)

        self.assertEqual(len(response.data["results"]), 2)

        product_names = [
            product["name"]
            for product in response.data["results"]
        ]

        self.assertIn("Wireless Mouse", product_names)
        self.assertIn("Mechanical Keyboard", product_names)

        self.assertNotIn("Old Headphones", product_names)
        self.assertNotIn("Office Chair", product_names)

        self.assertIsNone(response.data["previous"])



    def test_product_filtering_and_search(self):

        category_response = self.client.get(
            "/api/products/",
            {"category": "electronics"}
        )

        self.assertEqual(category_response.status_code, 200)
        self.assertEqual(category_response.data["count"], 2)


        brand_response = self.client.get(
            "/api/products/",
            {"brand": "logitech"}
        )

        self.assertEqual(brand_response.data["count"], 2)

        price_response = self.client.get(
            "/api/products/",
            {
                "min_price": 1000,
                "max_price": 2000
            }
        )

        self.assertEqual(price_response.data["count"], 1)

        search_response = self.client.get(
            "/api/products/",
            {"search": "keyboard"}
        )

        self.assertEqual(search_response.data["count"], 1)
        self.assertEqual(
            search_response.data["results"][0]["name"],
            "Mechanical Keyboard"
        )



    def test_product_detail(self):

        response = self.client.get(
            f"/api/products/{self.product1.id}/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["name"],
            "Wireless Mouse"
        )

        self.assertIn("description", response.data)
        self.assertIn("specs", response.data)


        invalid_response = self.client.get(
            "/api/products/99999/"
        )

        self.assertEqual(invalid_response.status_code, 404)

        inactive_response = self.client.get(
            f"/api/cproducts/{self.inactive_product.id}/"
        )

        self.assertEqual(inactive_response.status_code, 404)

