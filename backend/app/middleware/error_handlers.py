from werkzeug.exceptions import HTTPException

from app.extensions import jwt
from app.utils.exceptions import ApiError
from app.utils.responses import error


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(e):
        return error(e.code, e.message, e.status, e.details)

    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        return error(e.name.upper().replace(" ", "_"), e.description, e.code)

    @app.errorhandler(Exception)
    def handle_unexpected(e):
        app.logger.exception(e)
        return error("INTERNAL_ERROR", "Something went wrong on our side.", 500)

    @jwt.unauthorized_loader
    def missing_token(_):
        return error("UNAUTHORIZED", "Please log in to continue.", 401)

    @jwt.invalid_token_loader
    def invalid_token(_):
        return error("UNAUTHORIZED", "Your session is invalid. Please log in again.", 401)

    @jwt.expired_token_loader
    def expired_token(_h, _p):
        return error("SESSION_EXPIRED", "Your session expired. Please log in again.", 401)


def register_security_headers(app):
    @app.after_request
    def add_headers(resp):
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        resp.headers.setdefault("Cache-Control", "no-store")
        return resp
