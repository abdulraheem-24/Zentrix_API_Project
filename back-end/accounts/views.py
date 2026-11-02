from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework import filters, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .permissions import IsZentrixAdmin
from .serializers import (
    RegisterSerializer,
    AdminUserSerializer,
    AdminUserStatusSerializer,
)


User = get_user_model()


class RegisterUserView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] 




class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdminUserSerializer

    permission_classes = [
        IsAuthenticated,
        IsZentrixAdmin,
    ]


    queryset = User.objects.all().order_by("-date_joined")

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "username",
        "email",
    ]

    ordering_fields = [
        "date_joined",
        "username",
        "email",
    ]


    ordering = ["-date_joined"]


    @action(
        detail=True,
        methods=["patch"],
        url_path="status",
    )
    def update_status(self, request, pk=None):

        user = self.get_object()

        serializer = AdminUserStatusSerializer(
            user,
            data=request.data,
            context=self.get_serializer_context(),
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            AdminUserSerializer(user).data,
            status=status.HTTP_200_OK,
        )


