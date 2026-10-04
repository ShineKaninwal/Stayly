from sqlalchemy import func, or_

from app.extensions import db
from app.models import Property
from app.utils.exceptions import ApiError

SORTS = {
    "price_asc": (Property.price_per_night.asc(), Property.id.asc()),
    "price_desc": (Property.price_per_night.desc(), Property.id.asc()),
    "rating": (Property.rating.desc(), Property.reviews_count.desc()),
    "popular": (Property.reviews_count.desc(), Property.id.asc()),
    "newest": (Property.id.asc(),),  # seed order keeps the demo feed stable
}


def _num(args, key, cast, lo, hi):
    raw = args.get(key)
    if raw in (None, ""):
        return None
    try:
        n = cast(raw)
    except (TypeError, ValueError):
        raise ApiError("INVALID_FILTER", f"'{key}' must be a number.", 400)
    if not lo <= n <= hi:
        raise ApiError("INVALID_FILTER", f"'{key}' must be between {lo} and {hi}.", 400)
    return n


def _like(term):
    esc = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{esc}%"


def search_properties(args):
    q = Property.query
    location = (args.get("location") or "").strip()[:100]
    if location:
        like = _like(location)
        q = q.filter(or_(Property.location.ilike(like, escape="\\"), Property.region_label.ilike(like, escape="\\")))
    category = (args.get("category") or "").strip()
    if category:
        q = q.filter(func.lower(Property.category) == category.lower())
    max_price = _num(args, "max_price", int, 0, 10_000_000)
    min_price = _num(args, "min_price", int, 0, 10_000_000)
    guests = _num(args, "guests", int, 1, 100)
    min_rating = _num(args, "min_rating", float, 0, 5)
    if max_price is not None:
        q = q.filter(Property.price_per_night <= max_price)
    if min_price is not None:
        q = q.filter(Property.price_per_night >= min_price)
    if guests is not None:
        q = q.filter(Property.guests >= guests)
    if min_rating is not None:
        q = q.filter(Property.rating >= min_rating)

    sort = args.get("sort") or "newest"
    if sort not in SORTS:
        raise ApiError("INVALID_FILTER", f"'sort' must be one of: {', '.join(SORTS)}.", 400)
    page = _num(args, "page", int, 1, 10_000) or 1
    limit = _num(args, "limit", int, 1, 60) or 20
    p = q.order_by(*SORTS[sort]).paginate(page=page, per_page=limit, error_out=False)
    return {"items": [x.to_dict() for x in p.items], "total": p.total, "page": page, "pages": p.pages}


def location_summary():
    rows = (
        db.session.query(Property.location, func.count(Property.id), func.min(Property.price_per_night), func.min(Property.image_url))
        .group_by(Property.location).order_by(func.count(Property.id).desc(), Property.location).all()
    )
    return [{"location": r[0], "count": r[1], "min_price": r[2], "image_url": r[3]} for r in rows]
