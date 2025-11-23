import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-2025')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000/api')
    DEBUG = os.getenv('DEBUG', True)