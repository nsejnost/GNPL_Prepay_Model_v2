"""Pytest configuration: ensure the repo root is on sys.path so tests
can import `model.lifetime_engine.*` without an editable install."""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
