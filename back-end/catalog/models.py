from django.db import models
from django.utils.text import slugify


class Category(models.Model):

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    




class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products"
    )

    name = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    brand = models.CharField(max_length=200)
    sub_category = models.CharField(max_length=100, blank=True)

    price = models.DecimalField(max_digits=12, decimal_places=2,)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0,)

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    reviews = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    is_hero = models.BooleanField(default=False)

    image = models.URLField(max_length=1000, blank=True)
    description = models.TextField(blank=True)
    specs = models.JSONField(default=dict, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)


    @property
    def discounted_price(self):
        return self.price * ( 1 - self.discount / 100 )

    def __str__(self):
        return self.name


    class Meta:
        constraints = [
            models.CheckConstraint(
                condition = models.Q(price__gte = 0),
                name = "product_price_nonnegative",
            ),
            models.CheckConstraint(
                condition = (
                    models.Q(discount__gte = 0) 
                    & models.Q(discount__lte = 100)
                ),
                name = "product_discount_0_to_100"
            ),
            models.CheckConstraint(
                condition =(
                    models.Q(rating__gte = 0) 
                    & models.Q(rating__lte = 5)
                ),
                name = "product_rating_0_to_5"
            ),
        ]


