from datetime import timedelta
from django.utils import timezone
from django.db import transaction
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
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)
from .models import PasswordResetOTP
from .services.password_reset_email import send_password_reset_email
from .utils.password_reset import (
    generate_otp,
    hash_otp,
    verify_otp,
    generate_reset_token,
    hash_reset_token,
    verify_reset_token,
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





class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email).first()

        if user:

            latest_otp = PasswordResetOTP.objects.filter(
                user=user
            ).first()

            if latest_otp and latest_otp.is_in_cooldown():
                return Response(
                    {
                        "message": (
                            "If an account exists with this email, "
                            "a password reset OTP has been sent."
                        )
                    },
                    status=status.HTTP_200_OK,
                )

            otp = generate_otp()
            otp_hash = hash_otp(otp)

            PasswordResetOTP.objects.filter(
                user=user,
                used_at__isnull=True,
            ).update(used_at=timezone.now())

            PasswordResetOTP.objects.create(
                user=user,
                otp_hash=otp_hash,
                expires_at=timezone.now() + timedelta(minutes=5),
            )

            send_password_reset_email(
                recipient_email=user.email,
                otp=otp,
            )

        return Response(
            {
                "message": (
                    "If an account exists with this email,"
                    "a password reset OTP has been sent."
                )                
            },
            status=status.HTTP_200_OK,
        )



class VerifyOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {"message": "Invalid or expired OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            otp_record = PasswordResetOTP.objects.select_for_update().filter(
                user=user,
            ).first()

            if not otp_record:
                return Response(
                    {"message": "Invalid or expired OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if otp_record.is_expired():
                return Response(
                    {"message": "Invalid or expired OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if otp_record.used_at is not None:
                return Response(
                    {"message": "Invalid or expired OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if otp_record.has_exceeded_attempts():
                return Response(
                    {"message": "Invalid or expired OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )


            if not verify_otp(otp, otp_record.otp_hash):

                otp_record.attempts += 1
                otp_record.save(update_fields=["attempts"])

                return Response(
                    {"message": "Invalid or expired OTP."},
                    status=status.HTTP_400_BAD_REQUEST,
                )


            otp_record.verified_at = timezone.now()

            reset_token = generate_reset_token()

            reset_token_hash = hash_reset_token(reset_token)

            otp_record.reset_token_hash = reset_token_hash
            otp_record.reset_token_expires_at = (
                timezone.now() + timedelta(minutes=10)
            )

            otp_record.used_at = timezone.now()

            otp_record.save(
                update_fields=[
                    "verified_at",
                    "reset_token_hash",
                    "reset_token_expires_at",
                    "used_at",
                ]
            )

            return Response(
                {
                    "message": "OTP verified successfully.",
                    "reset_token": reset_token,
                },
                status=status.HTTP_200_OK,
            )
        
            

class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        reset_token = request.data.get("reset_token")

        if not reset_token:
            return Response(
                {"message": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_hash = hash_reset_token(reset_token)


        with transaction.atomic():

            otp_record = PasswordResetOTP.objects.select_for_update().filter(
                reset_token_hash=token_hash,
            ).first()

            if not otp_record:
                return Response(
                    {"message": "Invalid or expired reset token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if (
                otp_record.reset_token_expires_at is None
                or timezone.now() >= otp_record.reset_token_expires_at
            ):
                return Response(
                    {"message": "Invalid or expired reset token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if otp_record.verified_at is None:
                return Response(
                    {"message": "Invalid or expired reset token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not verify_reset_token(
                reset_token,
                otp_record.reset_token_hash,
            ):
                return Response(
                    {"message": "Invalid or expired reset token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )


            serializer = ResetPasswordSerializer(
                data=request.data,
                context={
                    "user": otp_record.user
                },
            )

            serializer.is_valid(raise_exception=True)

            user = otp_record.user

            user.set_password(
                serializer.validated_data["new_password"]
            )

            user.save(update_fields=["password"])

            otp_record.reset_token_hash = None
            otp_record.reset_token_expires_at = None

            otp_record.save(
                update_fields=[
                    "reset_token_hash",
                    "reset_token_expires_at",
                ]
            )

            return Response(
                {
                    "message": "Password reset successfully.",
                },
                status=status.HTTP_200_OK,
            )
