"""
Firebase Admin SDK initialization and Firestore client.
"""

import os
import json
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client


@lru_cache()
def get_firebase_app() -> firebase_admin.App:
    """
    Initialize Firebase Admin SDK.
    Uses GOOGLE_APPLICATION_CREDENTIALS env var or default credentials in Cloud Run.
    """
    if firebase_admin._apps:
        return firebase_admin.get_app()

    # Check for service account JSON in environment variable
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if service_account_json:
        cred_dict = json.loads(service_account_json)
        cred = credentials.Certificate(cred_dict)
        return firebase_admin.initialize_app(cred)

    # Check for service account file path
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if service_account_path and os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        return firebase_admin.initialize_app(cred)

    # Use default credentials (works in Cloud Run)
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
