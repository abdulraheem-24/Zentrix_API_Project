import secrets
import hashlib
import hmac
from django.conf import settings



def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"



def hash_otp(otp):
    return hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=otp.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()


def verify_otp(otp, stored_hash):
    generated_hash = hash_otp(otp)

    return hmac.compare_digest(
        generated_hash,
        stored_hash
    )


def generate_reset_token():
    return secrets.token_urlsafe(32)



def hash_reset_token(token):
    return hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()


def verify_reset_token(token, stored_hash):
    generated_hash = hash_reset_token(token)

    return hmac.compare_digest(
        generated_hash,
        stored_hash
    )