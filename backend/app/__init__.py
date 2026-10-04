from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from config import Config
from .extensions import db, jwt

def _err(code, msg, status):
    return jsonify(success=False, error={"code": code, "message": msg}), status

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    if not app.config["SQLALCHEMY_DATABASE_URI"] or not app.config["JWT_SECRET_KEY"]:
        raise RuntimeError("Set DATABASE_URL and JWT_SECRET_KEY (copy .env.example to .env).")
    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)
    db.init_app(app)
    jwt.init_app(app)
    from .routes import bp
    app.register_blueprint(bp)

    for loader in ("unauthorized_loader", "invalid_token_loader"):
        getattr(jwt, loader)(lambda m, *_: _err("UNAUTHORIZED", "Please log in.", 401))
    jwt.expired_token_loader(lambda h, p: _err("UNAUTHORIZED", "Session expired.", 401))

    @app.errorhandler(HTTPException)
    def http_err(e):
        return _err(e.name.upper().replace(" ", "_"), e.description, e.code)

    @app.errorhandler(Exception)
    def any_err(e):
        app.logger.exception(e)
        return _err("INTERNAL_ERROR", "Something went wrong on our side.", 500)

    with app.app_context():
        from . import models  # noqa
        db.create_all()
    return app
