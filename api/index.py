import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent / "Backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from main import app

__all__ = ["app"]
