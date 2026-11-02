from django.db import models
from django.contrib.auth.models import AbstractUser


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
    

