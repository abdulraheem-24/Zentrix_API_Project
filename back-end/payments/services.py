import razorpay
from django.conf import settings



def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID:
        raise RuntimeError("Razorpay Key ID is not configured.")

    if not settings.RAZORPAY_KEY_SECRET:
        raise RuntimeError("Razorpay Key Secret is not configured.")

    client = razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET,
        )
    )

    return client
