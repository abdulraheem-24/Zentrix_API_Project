from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']
        


    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact = value).exists():
            raise serializers.ValidationError(
                "An Account with this email already exists."
            )

        return value


    def validate(self, attrs):

        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        validate_user = User(
            username = attrs["username"],
            email = attrs["email"],
        )

        try:
            validate_password(
                password= attrs["password"],
                user= validate_user,
            )
        except DjangoValidationError as exc:
            raise serializers.ValidationError({
                "password": exc.messages
            }) from exc

        return attrs



    def create(self, validated_data):

        validated_data.pop("confirm_password")

        password = validated_data.pop("password")

        return User.objects.create_user(
            password= password,
            role = User.Role.CUSTOMER,
            **validated_data,
        )

    




class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "date_joined",
            "last_login",
        ]
        read_only_fields = fields




class AdminUserStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ["is_active"]


    def validate_is_active(self, value):
        user = self.instance
        request = self.context.get("request")

        if user.pk == request.user.pk:
            raise serializers.ValidationError(
                "You cannot block or unblock you own accounts "
                "through this endpoint."
            )

        if user.is_staff or user.is_superuser:
            raise serializers.ValidationError(
                "Administrator accounts cannot be managed "
                "through this endpoint."
            )

        if getattr(user, "role", None) == "admin":
            raise serializers.ValidationError(
                "Admin accounts cannot be managed "
                "through this endpoint."
            )

        return value




class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()


    def validate_email(self, value):
        return value.strip().lower()



class VerifyOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        min_length=6,
        max_length=6,
        trim_whitespace=False,
    )


    def validate_email(self, value):
        return value.strip().lower()


    def validate_otp(self, value):

        if not value.isdigit():
            raise serializers.ValidationError(
                "OTP must contain only digits."
            )

        return value




class ResetPasswordSerializer(serializers.Serializer):
    
    reset_token = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )


    def validate(self, attrs):

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        validate_user = self.context.get("user")

        try:
            validate_password(
                password=attrs["new_password"],
                user=validate_user,
            )
        except DjangoValidationError as exc:
            raise serializers.ValidationError({
                "new_password": exc.messages
            }) from exc

        return attrs
    