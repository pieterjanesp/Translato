"""
Basic API tests for the translation service.

These tests verify that the API endpoints are working correctly.
They don't test the actual translation (which would require API keys),
but they test the structure and error handling.
"""

from fastapi.testclient import TestClient
from app.main import app

# Create a test client
client = TestClient(app)


def test_health_check():
    """Test that the health check endpoint returns OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_no_file():
    """Test upload endpoint rejects requests without a file."""
    response = client.post("/api/translate/upload")
    assert response.status_code == 422  # Unprocessable Entity


def test_get_nonexistent_job():
    """Test that requesting a non-existent job returns 404."""
    response = client.get("/api/translate/status/fake-job-id")
    assert response.status_code == 404


def test_upload_invalid_file_type():
    """Test that uploading an invalid file type is rejected."""
    # Create a fake .txt file
    files = {"file": ("test.txt", b"Hello world", "text/plain")}
    response = client.post("/api/translate/upload", files=files)
    assert response.status_code == 400  # Bad Request
