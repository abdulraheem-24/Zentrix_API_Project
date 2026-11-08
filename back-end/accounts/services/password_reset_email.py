from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings



def send_password_reset_email(recipient_email, otp):

    context = {
        "otp": otp,
        "expiry_minutes": 5,
    }

    html_content = render_to_string(
        "accounts/emails/password_reset.html",
        context
    )

    text_content = render_to_string(
        "accounts/emails/password_reset.txt",
        context
    )


    email = EmailMultiAlternatives(
        subject="Zentrix - Password Reset OTP",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email]
    )

    email.attach_alternative(
        html_content,
        "text/html"
    )

    return email.send(fail_silently=False)
