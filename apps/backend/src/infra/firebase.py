"""
Firebase Admin SDK initialization and Firestore client.

Supports:
- Production: Uses GOOGLE_APPLICATION_CREDENTIALS or default Cloud Run credentials
- Development: Uses FIRESTORE_EMULATOR_HOST for local emulator
"""

import json
import logging
import os
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client

logger = logging.getLogger(__name__)


def is_emulator() -> bool:
    """Check if running with Firebase Emulator."""
    return bool(os.getenv("FIRESTORE_EMULATOR_HOST"))


@lru_cache()
def get_firebase_app() -> firebase_admin.App:
    """
    Initialize Firebase Admin SDK.
    Uses GOOGLE_APPLICATION_CREDENTIALS env var or default credentials in Cloud Run.
    For emulator, uses a dummy project.
    """
    if firebase_admin._apps:
        return firebase_admin.get_app()

    # Check if using emulator
    if is_emulator():
        from google.auth.credentials import AnonymousCredentials as GoogleAnonymousCredentials

        # Define a mock credential class that passes firebase-admin validation
        class MockCreds(credentials.Base):
            def get_credential(self):
                return GoogleAnonymousCredentials()

        emulator_host = os.getenv("FIRESTORE_EMULATOR_HOST")
        logger.info(f"🔧 Using Firebase Emulator at {emulator_host}")

        # Initialize with dummy project and Mock credential to bypass auth check
        return firebase_admin.initialize_app(credential=MockCreds(), options={"projectId": "filadelfias-dev"})

    # Check for service account JSON in environment variable
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if service_account_json:
        cred_dict = json.loads(service_account_json)
        cred = credentials.Certificate(cred_dict)
        logger.info("🔐 Using Firebase with service account JSON")
        return firebase_admin.initialize_app(cred)

    # Check for service account file path
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if service_account_path and os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        logger.info(f"🔐 Using Firebase with credentials file: {service_account_path}")
        return firebase_admin.initialize_app(cred)

    # Use default credentials (works in Cloud Run)
    logger.info("☁️ Using Firebase with default credentials (Cloud Run)")
    return firebase_admin.initialize_app()


@lru_cache()
def get_firestore_client() -> Client:
    """
    Get Firestore client instance.
    """
    get_firebase_app()
    return firestore.client()


# Convenience function
def get_db() -> Client:
    """
    Get Firestore database client.
    """
    return get_firestore_client()
