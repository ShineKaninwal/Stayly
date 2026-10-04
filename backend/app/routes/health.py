from flask import Blueprint
from sqlalchemy import text

from app.extensions import db
from app.utils.responses import error, success

bp = Blueprint("health", __name__, url_prefix="/api")


@bp.get("/health")
def health():
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        return error("DB_UNAVAILABLE", "Database connection failed.", 503)
    return success({"status": "ok", "database": "connected"})
