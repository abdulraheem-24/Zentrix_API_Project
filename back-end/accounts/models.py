from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from datetime import timedelta



class Zentrix_User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        CUSTOMER = "customer", "Customer"


    email = models.EmailField(unique=True)
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


    class Meta:
        db_table = "zentrix_users"
        ordering = ["-date_joined"]


    def __str__(self):
        return self.username

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN


    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER
    



class PasswordResetOTP(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_otps"
    )

    otp_hash = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)

    verified_at = models.DateTimeField(null=True, blank=True)

    reset_token_hash = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    reset_token_expires_at = models.DateTimeField(
        null=True,
        blank=True
    )

    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"]),
        ]


    def is_expired(self):
        return timezone.now() >= self.expires_at


    def is_in_cooldown(self):
        cooldown_period = timedelta(seconds=60)

        return timezone.now() < self.created_at + cooldown_period


    def has_exceeded_attempts(self):
        MAX_ATTEMPTS = 5

        return self.attempts >= MAX_ATTEMPTS
 

    def __str__(self):
        return f"Password Reset For {self.user.email}"
