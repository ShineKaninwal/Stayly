from datetime import date

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Property, Reservation
from app.utils.exceptions import ApiError
from app.utils.responses import success

bp = Blueprint("reservations", __name__, url_prefix="/api/reservations")


def _date(value, field):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise ApiError("VALIDATION_ERROR", f"{field} must be a valid date (YYYY-MM-DD).", 400)


@bp.post("")
@jwt_required()
def create_reservation():
    uid = int(get_jwt_identity())
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        raise ApiError("INVALID_REQUEST", "Send a JSON body.", 400)
    pid, guests = body.get("property_id"), body.get("guests")
    if not isinstance(pid, int) or not isinstance(guests, int) or isinstance(guests, bool) or guests < 1:
        raise ApiError("VALIDATION_ERROR", "property_id and guests must be positive integers.", 400)
    check_in, check_out = _date(body.get("check_in"), "check_in"), _date(body.get("check_out"), "check_out")
    if check_in < date.today():
        raise ApiError("VALIDATION_ERROR", "Check-in can't be in the past.", 400)
    if check_out <= check_in:
        raise ApiError("VALIDATION_ERROR", "Check-out must be after check-in.", 400)
    prop = db.session.get(Property, pid)
    if prop is None:
        raise ApiError("NOT_FOUND", "We couldn't find that stay.", 404)
    if guests > prop.guests:
        raise ApiError("VALIDATION_ERROR", f"This stay sleeps up to {prop.guests} guests.", 400)
    clash = Reservation.query.filter(
        Reservation.property_id == pid, Reservation.status == "confirmed",
        Reservation.check_in < check_out, Reservation.check_out > check_in,
    ).first()
    if clash:
        raise ApiError("DATES_UNAVAILABLE", "Those dates are already booked. Try different dates.", 409)
    total = (check_out - check_in).days * prop.price_per_night  # computed server-side, never trusted from client
    r = Reservation(user_id=uid, property_id=pid, check_in=check_in, check_out=check_out, guests=guests, total_price=total)
    db.session.add(r)
    db.session.commit()
    return success({"reservation": r.to_dict()}, 201)


@bp.get("")
@jwt_required()
def list_reservations():
    uid = int(get_jwt_identity())
    rows = Reservation.query.filter_by(user_id=uid).order_by(Reservation.check_in.asc()).all()
    return success({"items": [r.to_dict() for r in rows]})


@bp.delete("/<int:reservation_id>")
@jwt_required()
def cancel_reservation(reservation_id):
    uid = int(get_jwt_identity())
    r = db.session.get(Reservation, reservation_id)
    if r is None:
        raise ApiError("NOT_FOUND", "Reservation not found.", 404)
    if r.user_id != uid:
        raise ApiError("FORBIDDEN", "You can't change this reservation.", 403)
    r.status = "cancelled"
    db.session.commit()
    return success({"reservation": r.to_dict()})
