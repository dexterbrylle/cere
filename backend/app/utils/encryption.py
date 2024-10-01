from cryptography.fernet import Fernet
import os

KEY = os.getenv('ENCRYPTION_KEY')
if not KEY:
    raise ValueError("ENCRYPTION_KEY must be set in the environment variables")

f = Fernet(KEY.encode())

def encrypt_message(message: str) -> str:
    return f.encrypt(message.encode()).decode()

def decrypt_message(encrypted_message: str) -> str:
    return f.decrypt(encrypted_message.encode()).decode()
