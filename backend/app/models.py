from sqlalchemy.dialects.postgresql import JSONB
from .extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    def to_dict(self):  # never exposes password_hash
        return {"id": self.id, "name": self.name, "email": self.email, "created_at": self.created_at.isoformat()}

class Property(db.Model):
    __tablename__ = "properties"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    price_per_night = db.Column(db.Integer, nullable=False, index=True)
    category = db.Column(db.String(30), nullable=False, index=True)
    guests = db.Column(db.SmallInteger, nullable=False)
    bedrooms = db.Column(db.SmallInteger, nullable=False)
    beds = db.Column(db.SmallInteger, nullable=False)
    bathrooms = db.Column(db.SmallInteger, nullable=False)
    rating = db.Column(db.Numeric(2, 1), nullable=False, index=True)
    reviews_count = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.Text, nullable=False)  # picsum seed URL; gallery derived below
    amenities = db.Column(JSONB, nullable=False)
    categories = db.Column(JSONB, nullable=False, default=list)  # e.g. ["Beach","Pools"]
    property_type = db.Column(db.String(40), nullable=False, default="Stay")
    host_name = db.Column(db.String(80), nullable=False, default="Stayly Host")
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    __table_args__ = (db.CheckConstraint("price_per_night > 0"), db.CheckConstraint("guests >= 1"))

    def to_dict(self):
        seed = self.image_url.rsplit("/", 3)[-3]
        return {
            "id": self.id, "title": self.title, "location": self.location, "description": self.description,
            "price_per_night": self.price_per_night, "category": self.category, "guests": self.guests,
            "bedrooms": self.bedrooms, "beds": self.beds, "bathrooms": self.bathrooms,
            "rating": float(self.rating), "reviews_count": self.reviews_count,
            "image_url": self.image_url, "amenities": self.amenities, "categories": self.categories,
            "property_type": self.property_type, "host_name": self.host_name,
            "images": [f"https://picsum.photos/seed/{seed}-{i}/900/700" for i in range(1, 5)],
        }

class Wishlist(db.Model):
    __tablename__ = "wishlist"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    property = db.relationship("Property")
    __table_args__ = (db.UniqueConstraint("user_id", "property_id"),)
