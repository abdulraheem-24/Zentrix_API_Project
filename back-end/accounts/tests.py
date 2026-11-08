from datetime import timedelta
from django.utils import timezone
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch
from .serializers import ForgotPasswordSerializer
from .models import PasswordResetOTP
from .utils.password_reset import (
    hash_otp,
    generate_reset_token,
    hash_reset_token,
    verify_reset_token,
)


User = get_user_model()


class PasswordResetTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@gmail.com",
            password="TestPassword123!"
        )



    def test_forgot_password_invalid_email(self):

        serializer = ForgotPasswordSerializer(
            data={"email": "not-an-email"}
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn("email", serializer.errors)



    @patch("accounts.views.send_password_reset_email")
    def test_forgot_password_success(self, mock_send_email):

        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": self.user.email},
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            PasswordResetOTP.objects.filter(user=self.user).count(),
            1
        )

        mock_send_email.assert_called_once()

        send_otp = mock_send_email.call_args.kwargs["otp"]

        otp_record = PasswordResetOTP.objects.get(user=self.user)

        self.assertTrue(
            hash_otp(send_otp) == otp_record.otp_hash
        )



    @patch("accounts.views.send_password_reset_email")
    def test_forgot_password_unregistered_email(self, mock_send_email):

        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "unknown@gmail.com"},
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            PasswordResetOTP.objects.count(),
            0
        )

        mock_send_email.assert_not_called()



    @patch("accounts.views.send_password_reset_email")
    def test_forgot_password_cooldown(self, mock_send_email):

        first_response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": self.user.email},
            format="json"
        )

        self.assertEqual(first_response.status_code, 200)

        second_response = self.client.post(
             "/api/auth/forgot-password/",
            {"email": self.user.email},
            format="json"
        )

        self.assertEqual(
            second_response.status_code,
            200
        )

        self.assertEqual(
            PasswordResetOTP.objects.filter(user=self.user).count(),
            1
        )

        mock_send_email.assert_called_once()




    @patch("accounts.views.send_password_reset_email")
    def test_forgot_password_does_not_reveal_account_existence(
        self,
        mock_send_email
    ):
        self.client.post(
            "/api/auth/forgot-password/",
            {"email": self.user.email},
            format="json"
        )

        registered_response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": self.user.email},
            format="json"
        )

        unregistered_response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "unknown@gmail.com"},
            format="json"
        )

        self.assertEqual(
            registered_response.status_code,
            unregistered_response.status_code
        )


    def test_verify_otp_success(self):

        otp = '123456'

        otp_record = PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.user.email,
                "otp": otp
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        self.assertIn("reset_token", response.data)

        self.assertTrue(response.data["reset_token"])


        otp_record.refresh_from_db()

        self.assertIsNotNone(otp_record.reset_token_hash)

        self.assertTrue(
            verify_reset_token(
                response.data["reset_token"],
                otp_record.reset_token_hash
            )
        )


        self.assertIsNotNone(otp_record.verified_at)

        self.assertIsNotNone(otp_record.used_at)


    def test_verify_otp_invalid(self):

        otp = "123456"

        PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.user.email,
                "otp": "999999"
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

        otp_record = PasswordResetOTP.objects.get(user=self.user)

        self.assertEqual(otp_record.attempts, 1)

        self.assertIsNone(otp_record.verified_at)

        self.assertIsNone(otp_record.reset_token_hash)



    def test_verify_otp_expired(self):

        otp = "123456"

        otp_record = PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp(otp),
            expires_at=timezone.now() - timedelta(minutes=1)
        )

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.user.email,
                "otp": otp
            },
            format="json"
        )


        self.assertEqual(response.status_code, 400)

        otp_record.refresh_from_db()

        self.assertEqual(otp_record.attempts, 0)
        self.assertIsNone(otp_record.verified_at)
        self.assertIsNone(otp_record.reset_token_hash)



    def test_reset_password_success(self):

        reset_token = generate_reset_token()

        otp_record = PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp("123456"),
            expires_at=timezone.now() - timedelta(minutes=1),
            verified_at=timezone.now(),
            reset_token_hash=hash_reset_token(reset_token),
            reset_token_expires_at=timezone.now() + timedelta(minutes=10),
            used_at=timezone.now(),
        )

        new_password = "NewSecurePassword456!"

        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "reset_token": reset_token,
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(new_password)
        )

        otp_record.refresh_from_db()

        self.assertIsNone(otp_record.reset_token_hash)
        self.assertIsNone(otp_record.reset_token_expires_at)




    def test_reset_password_invalid_token(self):

        new_password = "NewSecurePassword456!"

        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "reset_token": "invalid-reset-token",
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password("TestPassword123!")
        )

        self.assertEqual(
            PasswordResetOTP.objects.filter(user=self.user).count(),
            0
        )




    def test_reset_password_expired_token(self):

        reset_token = generate_reset_token()

        otp_record = PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp("123456"),
            expires_at=timezone.now() - timedelta(minutes=5),
            verified_at=timezone.now() - timedelta(minutes=5),
            reset_token_hash=hash_reset_token(reset_token),
            reset_token_expires_at=timezone.now() - timedelta(minutes=1),
            used_at=timezone.now() - timedelta(minutes=5),
        )

        new_password = "NewSecurePassword456!"

        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "reset_token": reset_token,
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="json"
        )


        self.assertEqual(response.status_code, 400)

        self.user.refresh_from_db()


        self.assertTrue(
            self.user.check_password("TestPassword123!")
        )

        otp_record.refresh_from_db()

        self.assertIsNotNone(otp_record.reset_token_hash)
        self.assertIsNotNone(otp_record.reset_token_expires_at)




    def test_reset_password_token_reuse(self):

        reset_token = generate_reset_token()

        PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp("123456"),
            expires_at=timezone.now() - timedelta(minutes=5),
            verified_at=timezone.now(),
            reset_token_hash=hash_reset_token(reset_token),
            reset_token_expires_at=timezone.now() + timedelta(minutes=10),
            used_at=timezone.now(),
        )

        new_password = "NewSecurePassword456!"

        first_response = self.client.post(
            "/api/auth/reset-password/",
            {
                "reset_token": reset_token,
                "new_password" : new_password,
                "confirm_password": new_password,
            },
            format="json"
        )

        self.assertEqual(first_response.status_code, 200)

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(new_password)
        )


        second_response = self.client.post(
            "/api/auth/reset-password/",
            {
                "reset_token": reset_token,
                "new_password": "anotherPassword123",
                "confirm_password": "anotherPassword123"
            },
            format="json"
        )

        self.assertEqual(second_response.status_code, 400)

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(new_password)
        )




    def test_verify_otp_maximum_attempts_exceeded(self):

        otp = "123456"

        otp_record = PasswordResetOTP.objects.create(
            user=self.user,
            otp_hash=hash_otp(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )


        for _ in range(5):

            response = self.client.post(
                "/api/auth/verify-otp/",
                {
                    "email": self.user.email,
                    "otp": "999999"
                },
                format="json"
            )

            self.assertEqual(response.status_code, 400)

        otp_record.refresh_from_db()

        self.assertEqual(otp_record.attempts, 5)

        response = self.client.post(
            "/api/auth/verify-otp/",
            {
                "email": self.user.email,
                "otp": otp
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

        otp_record.refresh_from_db()

        self.assertEqual(otp_record.attempts, 5)

        self.assertIsNone(otp_record.verified_at)
        self.assertIsNone(otp_record.reset_token_hash)

    







class AccountAuthenticationTests(TestCase):

    def setUp(self):
        self.client = APIClient()


    def test_registration_success_with_customer_role(self):

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newcustomer",
                "email": "newcustomer@gmail.com",
                "password": "StrongPassword789!",
                "confirm_password": "StrongPassword789!",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        user = User.objects.get(
            email="newcustomer@gmail.com"
        )

        self.assertEqual(
            user.role,
            User.Role.CUSTOMER
        )

        self.assertTrue(
            user.check_password("StrongPassword789!")
        )

        self.assertNotIn("password", response.data)
        self.assertNotIn("confirm_password", response.data)





    def test_registration_duplicate_email(self):

        User.objects.create_user(
            username="existinguser",
            email="existing@gmail.com",
            password="StrongPassword123!"
        )


        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newuser",
                "email": "existing@gmail.com",
                "password": "StrongPassword789!",
                "confirm_password": "StrongPassword789!",
            },
            format="json"
        )


        self.assertEqual(response.status_code, 400)

        self.assertIn("email", response.data)

        self.assertEqual(
            User.objects.filter(email="existing@gmail.com").count(),
            1
        )


        


    def test_registration_password_mismatch(self):

        response = self.client.post(
            "/api/auth/register/",
                {
                    "username": "mismatchuser",
                    "email": "mismatch@gmail.com",
                    "password": "StrongPassword123!",
                    "confirm_password": "DifferentPassword456!",
                },
                format="json"
        )

        self.assertEqual(response.status_code, 400)

        self.assertIn("confirm_password", response.data)

        self.assertFalse(
            User.objects.filter(email="mismatch@gmail.com").exists()
        )



    def test_login_success_returns_jwt_tokens(self):

        User.objects.create_user(
            username="loginuser",
            email="login@gmail.com",
            password="StrongPassword123!"
        )

        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "login@gmail.com",
                "password": "StrongPassword123!",
            },
            format="json"
        )


        self.assertEqual(response.status_code, 200)

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        self.assertTrue(response.data["access"])
        self.assertTrue(response.data["refresh"])





    def test_login_invalid_credentials(self):

        User.objects.create_user(
            username="loginuser",
            email="login@gmail.com",
            password="StrongPassword123!"
        )


        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "login@gmail.com",
                "password": "WrongPassword123!",
            },
            format="json"
        )


        self.assertEqual(response.status_code, 401)

        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)


    


    def test_customer_cannot_access_admin_user_management(self):

        customer = User.objects.create_user(
            username="customer",
            email="customer@gmail.com",
            password="StrongPassword123!",
            role=User.Role.CUSTOMER
        )

        self.client.force_authenticate(user=customer)

        response = self.client.get(
            "/api/auth/admin/users/"
        )

        self.assertEqual(response.status_code, 403)



    def test_admin_can_access_user_management(self):

        admin = User.objects.create_user(
            username="admin",
            email="admin@gmail.com",
            password="StrongPassword123!",
            role=User.Role.ADMIN,
            is_staff=True
        )

        self.client.force_authenticate(user=admin)

        response = self.client.get(
            "/api/auth/admin/users/"
        )

        self.assertEqual(response.status_code, 200)


    
