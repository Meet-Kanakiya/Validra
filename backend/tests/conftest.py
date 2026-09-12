import os
import sys
from pathlib import Path
import pytest

os.environ["TESTING"] = "1"

# Ensure app package is in Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
