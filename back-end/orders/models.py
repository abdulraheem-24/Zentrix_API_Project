import uuid
from django.conf import settings
from django.db import models
from django.db.models import Q



class Address(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )

    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    address_line = models.CharField(max_length=400)
    district = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default="India")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(is_default=True),
                name="one_default_address_per_user",
            )
        ]


    def __str__(self):
        return f"{self.full_name} - {self.city}"



class Order(models.Model):


    class Status(models.TextChoices):
        PROCESSING = "Processing", "Processing"
        PACKED = "Packed", "Packed"
        SHIPPED = "Shipped", "Shipped"
        DELIVERED = "Delivered", "Delivered"
        CANCELLED = "Cancelled", "Cancelled"


    class PaymentMethod(models.TextChoices):
        CARD = "card", "Card"
        UPI = "upi", "UPI"
        COD = "cod", "Cash on Delivery"


    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"


    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    order_number = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )

    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)

    shipping_address = models.CharField(max_length=255)
    shipping_district = models.CharField(max_length=100)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=10)
    shipping_country = models.CharField(max_length=100)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PROCESSING,
    )

    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
    )

    payment_status = models.CharField(
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )


    subtotal = models.DecimalField(
        max_digits=14, decimal_places=2,
    )

    shipping_charge = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
    )

    discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
    )

    total_amount = models.DecimalField(
        max_digits=14, decimal_places=2,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=Q(subtotal__gte=0),
                name="order_subtotal_nonnegative",
            ),
            models.CheckConstraint(
                condition=Q(shipping_charge__gte=0),
                name="order_shipping_nonnegative"
            ),
            models.CheckConstraint(
                condition=Q(discount_amount__gte=0),
                name="order_discount_nonnegative"
            ),
            models.CheckConstraint(
                condition=Q(total_amount__gte=0),
                name="order_total_nonnegative"
            )
        ]


    def __str__(self):
        return str(self.order_number)




class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )


    product_name = models.CharField(max_length=300)
    product_brand = models.CharField(max_length=300)
    product_image = models.URLField(max_length=1000, blank=True)

    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=14, decimal_places=2)


    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(quantity__gte=1),
                name="order_item_quantity_at_least_one",
            ),
            models.CheckConstraint(
                condition=Q(unit_price__gte=0),
                name="order_item_unit_price_nonnegative",
            ),
            models.CheckConstraint(
                condition=Q(line_total__gte=0),
                name="order_item_line_total_nonnegative",
            ),
        ]


    def __str__(self):
        return f"{self.product_name} x {self.quantity}"




