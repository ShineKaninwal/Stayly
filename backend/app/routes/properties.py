from flask import Blueprint, request

from app.extensions import db
from app.models import Property
from app.services import property_service as svc
from app.utils.exceptions import ApiError
from app.utils.responses import success

bp = Blueprint("properties", __name__, url_prefix="/api/properties")


@bp.get("")
@bp.get("/search")
def list_properties():
    return success(svc.search_properties(request.args))


@bp.get("/locations")
def locations():
    return success({"items": svc.location_summary()})


@bp.get("/<int:property_id>")
def get_property(property_id):
    prop = db.session.get(Property, property_id)
    if prop is None:
        raise ApiError("NOT_FOUND", "We couldn't find that stay.", 404)
    return success({"property": prop.to_dict()})
