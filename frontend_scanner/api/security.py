"""Password hashing for the local Edge API; no plaintext credentials."""
import hashlib
import secrets


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1).hex()
    return f"scrypt${salt}${digest}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, salt, expected = encoded.split("$")
        if scheme != "scrypt":
            return False
        actual = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1).hex()
        return secrets.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False
