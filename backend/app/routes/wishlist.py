from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Property, WishlistItem
from app.utils.exceptions import ApiError
from app.utils.responses import success

bp = Blueprint("wishlist", __name__, url_prefix="/api/wishlist")


@bp.get("")
@jwt_required()
def list_wishlist():
    uid = int(get_jwt_identity())
    rows = WishlistItem.query.filter_by(user_id=uid).order_by(WishlistItem.created_at.desc(), WishlistItem.id.desc()).all()
    return success({"items": [{**r.property.to_dict(), "saved_at": r.created_at.isoformat()} for r in rows]})


@bp.post("")
@jwt_required()
def add_to_wishlist():
    uid = int(get_jwt_identity())
    body = request.get_json(silent=True)
    pid = body.get("property_id") if isinstance(body, dict) else None
    if not isinstance(pid, int) or isinstance(pid, bool):
        raise ApiError("VALIDATION_ERROR", "property_id must be an integer.", 400)
    if db.session.get(Property, pid) is None:
        raise ApiError("NOT_FOUND", "We couldn't find that stay.", 404)
    if WishlistItem.query.filter_by(user_id=uid, property_id=pid).first():
        raise ApiError("ALREADY_SAVED", "This stay is already in your wishlist.", 409)
    db.session.add(WishlistItem(user_id=uid, property_id=pid))
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError("ALREADY_SAVED", "This stay is already in your wishlist.", 409)
    return success({"property_id": pid, "saved": True}, 201)


@bp.delete("/<int:property_id>")
@jwt_required()
def remove_from_wishlist(property_id):
    uid = int(get_jwt_identity())
    item = WishlistItem.query.filter_by(user_id=uid, property_id=property_id).first()
    if item is None:
        raise ApiError("NOT_FOUND", "That stay isn't in your wishlist.", 404)
    db.session.delete(item)
    db.session.commit()
    return success({"property_id": property_id, "saved": False})
