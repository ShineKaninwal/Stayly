from flask import Blueprint, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, set_access_cookies, unset_jwt_cookies
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db, limiter
from app.models import User
from app.services import auth_service as svc
from app.utils.exceptions import ApiError
from app.utils.responses import success

bp = Blueprint("auth", __name__, url_prefix="/api/auth")
_DUMMY_HASH = generate_password_hash("not-a-real-password")


def _with_session(user, status):
    resp, code = success({"user": user.to_dict()}, status)
    set_access_cookies(resp, create_access_token(identity=str(user.id)))
    return resp, code


def _exists():
    return ApiError("EMAIL_EXISTS", "An account with this email already exists.", 409, {"email": "This email is already registered."})


@bp.post("/signup")
@limiter.limit("10 per minute")
def signup():
    name, email, password = svc.validate_signup(request.get_json(silent=True))
    if User.query.filter_by(email=email).first():
        raise _exists()
    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:  # race: two signups with the same email
        db.session.rollback()
        raise _exists()
    return _with_session(user, 201)


@bp.post("/login")
@limiter.limit("10 per minute")
def login():
    email, password = svc.validate_login(request.get_json(silent=True))
    user = User.query.filter_by(email=email).first()
    if user is None:
        check_password_hash(_DUMMY_HASH, password)  # keep timing similar for unknown emails
    if user is None or not user.check_password(password):
        raise ApiError("INVALID_CREDENTIALS", "Invalid email or password.", 401)
    return _with_session(user, 200)


@bp.post("/logout")
def logout():
    resp, code = success({"message": "Logged out."})
    unset_jwt_cookies(resp)
    return resp, code


@bp.get("/me")
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        raise ApiError("UNAUTHORIZED", "Please log in to continue.", 401)
    return success({"user": user.to_dict()})
