import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import Fernet


# Generate Fernet key from password + salt
def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=390000,
    )
    key = kdf.derive(password.encode("utf-8"))
    return base64.urlsafe_b64encode(key)   # return key safe for Fernet


# Create Fernet object using password
def _get_fernet(password: str, salt: bytes) -> Fernet:
    key = _derive_key(password, salt)
    return Fernet(key)


# Encrypt plaintext using password
def encrypt_message(plaintext: str, password: str) -> bytes:
    salt = os.urandom(16)                   # generate random salt
    f = _get_fernet(password, salt)
    token = f.encrypt(plaintext.encode("utf-8"))
    return salt + token                    # prepend salt to ciphertext


# Decrypt ciphertext using password
def decrypt_message(ciphertext: bytes, password: str) -> str:
    if len(ciphertext) < 16:
        raise ValueError("Invalid ciphertext")

    salt = ciphertext[:16]                 # extract salt
    token = ciphertext[16:]                # encrypted data
    f = _get_fernet(password, salt)

    try:
        plaintext = f.decrypt(token)
    except Exception:
        raise ValueError("Incorrect password or corrupted data")

    return plaintext.decode("utf-8")
