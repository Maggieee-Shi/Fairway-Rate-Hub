"""
Django settings for Fairway Rate Hub.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# ----------------------------
# Security
# ----------------------------

SECRET_KEY = "django-insecure-6^zrne6n%0*&_o*c7w$)wcr5d5^a20(wrzv0oebzp6a4iy9(@!"
DEBUG = True

ALLOWED_HOSTS = [
    "*",
    "localhost",
    "127.0.0.1",
]


# ----------------------------
# Application definition
# ----------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Your backend app
    "sqlapp.apps.SqlappConfig",

    # CORS support
    'django.contrib.sessions',
    'corsheaders',
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # MUST be first
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ----------------------------
# CORS (Fix: allow React at localhost:3000)
# ----------------------------
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://fairway-rate-hub.vercel.app",
    "https://fairway-rate-hub-git-main-maggieee-shis-projects.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://fairway-rate-hub.vercel.app",
    "https://fairway-rate-hub-git-main-maggieee-shis-projects.vercel.app",
]
CSRF_COOKIE_SAMESITE = None
CSRF_COOKIE_SECURE = False


# ----------------------------
# URL / WSGI
# ----------------------------

ROOT_URLCONF = "sqlapp.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "sqlapp.wsgi.application"


# ----------------------------
# Database - GCP Cloud SQL (MySQL)
# ----------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "FairwayRateHub",
        "USER": "root",
        "PASSWORD": "Strongpassword123!",
        "HOST": "34.102.114.144",
        "PORT": "3306",
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}


# ----------------------------
# Password validation
# ----------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ----------------------------
# Internationalization
# ----------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"

USE_I18N = True
USE_TZ = True


# ----------------------------
# Static files
# ----------------------------

STATIC_URL = "static/"


# ----------------------------
# Default primary key
# ----------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SESSION_COOKIE_SAMESITE = "None"  # Required for cross-domain cookies
SESSION_COOKIE_SECURE = True      # Required when SameSite=None in production (HTTPS)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 86400
SESSION_SAVE_EVERY_REQUEST = True