import django_filters
from .models import Product
from django.db.models import Q
from rest_framework import filters



class ProductFilter(django_filters.FilterSet):

    category = django_filters.CharFilter(
        method = "filter_by_category",
    )

    brand = django_filters.CharFilter(
        field_name="brand",
        lookup_expr="iexact",
    )

    featured = django_filters.BooleanFilter()

    min_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="gte",
    )

    max_price = django_filters.NumberFilter(
        field_name="price",
        lookup_expr="lte",
    )

    min_rating = django_filters.NumberFilter(
        field_name="rating",
        lookup_expr="gte",
    )

    in_stock = django_filters.BooleanFilter(
        method="filter_in_stock",
    )


    def filter_by_category(self, queryset, name, value):
        if not value or value.lower() == "all":
            return queryset

        return queryset.filter(
            Q(category__slug__iexact=value) 
            | Q(category__name__iexact=value)
        )


    def filter_in_stock(self, queryset, name, value):
        if value is True:
            return queryset.filter(stock__gt = 0)

        if value is False:
            return queryset.filter(stock=0)

        return queryset


    class Meta:
        model = Product
        fields = [
            "category",
            "brand",
            "featured",
            "min_price",
            "max_price",
            "min_rating",
            "in_stock",
        ]



class FlexibleOrderingFilter(filters.OrderingFilter):

    def get_ordering(self, request, queryset, view):
        params = (
            request.query_params.get(self.ordering_param)
            or request.query_params.get("_sort")
        )

        if params:
            fields = [
                field.strip()
                for field in params.split(",")
                if field.strip()
            ]

            # Support legacy _sort=price&_order=desc.
            # Explicit signs such as -price take precedence.
            legacy_order = request.query_params.get("_order", "").lower()

            if legacy_order in ("asc", "desc"):
                fields = [
                    field
                    if field.startswith(("-", "+"))
                    else (
                        f"-{field}"
                        if legacy_order == "desc"
                        else field
                    )
                    for field in fields
                ]

            ordering = self.remove_invalid_fields(
                queryset, fields, view, request
            )

            if ordering:
                return ordering

        return self.get_default_ordering(view)