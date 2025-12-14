# backend/utils/crypto_store.py
from backend.crypto.aes import encrypt_message, decrypt_message

def encrypt_store(text: str, master_key: str) -> bytes:
    return encrypt_message(text, master_key)

def decrypt_store(cipher: bytes, master_key: str) -> str:
    return decrypt_message(cipher, master_key)
