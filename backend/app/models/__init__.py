from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db

JsonType = JSON().with_variant(JSONB(), "postgresql")


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    return dt.isoformat() if dt else None


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_now)

    wishlist = db.relationship("WishlistItem", backref="user", cascade="all, delete-orphan", passive_deletes=True)
    reservations = db.relationship("Reservation", backref="user", cascade="all, delete-orphan", passive_deletes=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):  # never includes password_hash
        return {"id": self.id, "name": self.name, "email": self.email, "created_at": _iso(self.created_at)}


class Property(db.Model):
    __tablename__ = "properties"
    __table_args__ = (
        CheckConstraint("price_per_night > 0", name="ck_property_price"),
        CheckConstraint("guests >= 1", name="ck_property_guests"),
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_property_rating"),
    )
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, unique=True)
    location = db.Column(db.String(100), nullable=False, index=True)
    region_label = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_per_night = db.Column(db.Integer, nullable=False, index=True)
    category = db.Column(db.String(30), nullable=False, index=True)
    guests = db.Column(db.SmallInteger, nullable=False)
    bedrooms = db.Column(db.SmallInteger, nullable=False)
    beds = db.Column(db.SmallInteger, nullable=False)
    bathrooms = db.Column(db.SmallInteger, nullable=False)
    rating = db.Column(db.Numeric(2, 1), nullable=False, index=True)
    reviews_count = db.Column(db.Integer, nullable=False, default=0)
    distance_km = db.Column(db.SmallInteger, nullable=False, default=5)
    image_url = db.Column(db.Text, nullable=False)
    images = db.Column(JsonType, nullable=False, default=list)
    amenities = db.Column(JsonType, nullable=False, default=list)
    host_name = db.Column(db.String(80), nullable=False)
    host_since_year = db.Column(db.SmallInteger, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_now)

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "location": self.location, "region_label": self.region_label,
            "description": self.description, "price_per_night": self.price_per_night, "category": self.category,
            "guests": self.guests, "bedrooms": self.bedrooms, "beds": self.beds, "bathrooms": self.bathrooms,
            "rating": float(self.rating), "reviews_count": self.reviews_count, "distance_km": self.distance_km,
            "image_url": self.image_url, "images": self.images or [], "amenities": self.amenities or [],
            "host_name": self.host_name, "host_since_year": self.host_since_year,
        }


class WishlistItem(db.Model):
    __tablename__ = "wishlist"
    __table_args__ = (UniqueConstraint("user_id", "property_id", name="uq_wishlist_user_property"),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_now)
    property = db.relationship("Property")


class Reservation(db.Model):
    __tablename__ = "reservations"
    __table_args__ = (CheckConstraint("check_out > check_in", name="ck_reservation_dates"),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    guests = db.Column(db.SmallInteger, nullable=False)
    total_price = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="confirmed")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_now)
    property = db.relationship("Property")

    def to_dict(self):
        return {
            "id": self.id, "property_id": self.property_id, "check_in": self.check_in.isoformat(),
            "check_out": self.check_out.isoformat(), "guests": self.guests, "total_price": self.total_price,
            "status": self.status, "created_at": _iso(self.created_at), "property": self.property.to_dict(),
        }
