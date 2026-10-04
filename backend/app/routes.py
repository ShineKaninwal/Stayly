import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (create_access_token, jwt_required, get_jwt_identity,
                                set_access_cookies, unset_jwt_cookies)
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db
from .models import User, Property, Wishlist

bp = Blueprint("api", __name__, url_prefix="/api")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def ok(data=None, status=200):
    return jsonify(success=True, data=data), status

def err(code, msg, status=400):
    return jsonify(success=False, error={"code": code, "message": msg}), status

def _session(user, status=200):
    resp, _ = ok(user.to_dict(), status)
    set_access_cookies(resp, create_access_token(identity=str(user.id)))
    return resp, status

@bp.post("/auth/signup")
def signup():
    d = request.get_json(silent=True) or {}
    name, email, pw = (d.get("name") or "").strip(), (d.get("email") or "").strip().lower(), d.get("password") or ""
    if not 2 <= len(name) <= 100: return err("VALIDATION", "Enter your full name.")
    if not EMAIL_RE.match(email): return err("VALIDATION", "Enter a valid email address.")
    if len(pw) < 8 or not re.search(r"[A-Za-z]", pw) or not re.search(r"\d", pw):
        return err("VALIDATION", "Password needs 8+ characters with a letter and a number.")
    if User.query.filter_by(email=email).first(): return err("EMAIL_EXISTS", "An account with this email already exists.", 409)
    user = User(name=name, email=email, password_hash=generate_password_hash(pw))
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return err("EMAIL_EXISTS", "An account with this email already exists.", 409)
    return _session(user, 201)

@bp.post("/auth/login")
def login():
    d = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=(d.get("email") or "").strip().lower()).first()
    if not user or not check_password_hash(user.password_hash, d.get("password") or ""):
        return err("INVALID_CREDENTIALS", "Invalid email or password.", 401)
    return _session(user)

@bp.post("/auth/logout")
def logout():
    resp, _ = ok({"logged_out": True})
    unset_jwt_cookies(resp)
    return resp

@bp.get("/auth/me")
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    return ok(user.to_dict()) if user else err("UNAUTHORIZED", "Please log in.", 401)

def _num(name, cast=int):
    v = request.args.get(name)
    if v in (None, ""): return None
    try: return cast(v)
    except ValueError: raise ValueError(name)

CATS = ["Beach", "Amazing views", "Mountain", "Countryside", "Pools", "Luxury", "Trending", "Nature", "City"]
ALIAS = {**{c.lower(): c for c in CATS}, "mountains": "Mountain", "cities": "City"}

@bp.get("/properties")
@bp.get("/properties/search")
def properties():
    q = Property.query
    try:
        if (loc := request.args.get("location", "").strip()): q = q.filter(Property.location.ilike(f"%{loc}%"))
        if (c := request.args.get("category", "").strip()):
            canon = ALIAS.get(c.lower())
            if not canon: raise ValueError("category")
            q = q.filter(Property.categories.contains([canon]))
        if (v := _num("max_price")) is not None: q = q.filter(Property.price_per_night <= v)
        if (v := _num("guests")) is not None: q = q.filter(Property.guests >= v)
        if (v := _num("min_rating", float)) is not None: q = q.filter(Property.rating >= v)
        page = max(_num("page") or 1, 1)
        limit = min(max(_num("limit") or 12, 1), 48)
    except ValueError as e:
        return err("VALIDATION", f"Invalid value for {e}.")
    pg = q.order_by(Property.rating.desc(), Property.id).paginate(page=page, per_page=limit, error_out=False)
    return ok({"items": [p.to_dict() for p in pg.items], "page": pg.page, "pages": pg.pages, "total": pg.total})

@bp.get("/properties/<int:pid>")
def property_detail(pid):
    p = db.session.get(Property, pid)
    return ok(p.to_dict()) if p else err("NOT_FOUND", "Stay not found.", 404)

@bp.get("/wishlist")
@jwt_required()
def wishlist():
    rows = Wishlist.query.filter_by(user_id=int(get_jwt_identity())).order_by(Wishlist.created_at.desc()).all()
    return ok([r.property.to_dict() for r in rows])

@bp.post("/wishlist")
@jwt_required()
def wishlist_add():
    pid = (request.get_json(silent=True) or {}).get("property_id")
    if not isinstance(pid, int) or not db.session.get(Property, pid): return err("NOT_FOUND", "Stay not found.", 404)
    db.session.add(Wishlist(user_id=int(get_jwt_identity()), property_id=pid))
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return err("ALREADY_SAVED", "Already in your wishlist.", 409)
    return ok({"property_id": pid}, 201)

@bp.delete("/wishlist/<int:pid>")
@jwt_required()
def wishlist_remove(pid):
    row = Wishlist.query.filter_by(user_id=int(get_jwt_identity()), property_id=pid).first()
    if not row: return err("NOT_FOUND", "Not in your wishlist.", 404)
    db.session.delete(row)
    db.session.commit()
    return ok({"property_id": pid})
