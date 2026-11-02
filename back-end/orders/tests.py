from django.test import TestCase





# from django.contrib.auth import get_user_model
# from rest_framework.test import APITestCase
# from rest_framework import status

# from .models import Address, Order


# User = get_user_model()


# class AddressModelTests(TestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(
#             username="testcustomer",
#             email="customer@example.com",
#             password="TestPassword123!",
#         )

#     def test_address_belongs_to_user(self):
#         address = Address.objects.create(
#             user=self.user,
#             full_name="Test Customer",
#             phone="9876543210",
#             address_line="123 Main Road",
#             district="Palakkad",
#             city="Pattambi",
#             state="Kerala",
#             postal_code="679303",
#             country="India",
#         )

#         self.assertEqual(address.user, self.user)
#         self.assertEqual(address.city, "Pattambi")

#     def test_user_can_have_multiple_addresses(self):
#         for city in ["Pattambi", "Kochi"]:
#             Address.objects.create(
#                 user=self.user,
#                 full_name="Test Customer",
#                 phone="9876543210",
#                 address_line="123 Main Road",
#                 district="Palakkad",
#                 city=city,
#                 state="Kerala",
#                 postal_code="679303",
#                 country="India",
#             )

#         self.assertEqual(
#             Address.objects.filter(user=self.user).count(),
#             2,
#         )


# class OrderAPIPermissionTests(APITestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(
#             username="testcustomer",
#             email="customer@example.com",
#             password="TestPassword123!",
#         )

#     def test_orders_require_authentication(self):
#         response = self.client.get("/api/orders/")

#         self.assertIn(
#             response.status_code,
#             [
#                 status.HTTP_401_UNAUTHORIZED,
#                 status.HTTP_403_FORBIDDEN,
#             ],
#         )
