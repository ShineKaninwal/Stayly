"""Seed demo data. Usage: python seed.py  (add --reset to wipe and reseed properties; wishlist rows are cleared)."""
import sys
from sqlalchemy import inspect
from app import create_app
from app.extensions import db
from app.models import Property, Wishlist

# title|location|type|categories|price|guests|rating|reviews|host|description
ROWS = """Casa Azul Anjuna|Goa|Villa|Beach,Pools,Trending|7800|6|4.9|164|Meera D'Souza|Portuguese-style villa with a private pool, ten minutes from Anjuna's cafés and sunset beaches.
The Coconut Shack|Goa|Cottage|Beach,Nature|3400|2|4.7|92|Rohan Naik|A breezy palm-thatched cottage a short walk from the quiet sands of Palolem.
Deodar Lodge|Manali|Chalet|Mountain,Amazing views,Trending|5600|5|4.9|138|Tenzin Dorje|Timber chalet above Old Manali with deodar forest and Beas valley views from every room.
Apple Orchard Homestay|Manali|Homestay|Mountain,Countryside,Nature|2900|4|4.8|76|Kavita Thakur|Wake up among apple trees in Naggar and sit down to home-cooked Himachali meals.
Haveli Mandawa Suite|Jaipur|Heritage Haveli|Luxury,City,Trending|9400|4|4.9|152|Vikram Shekhawat|Restored 19th-century haveli suite with frescoed walls and a rooftop terrace in the Pink City.
Amer Fort View Loft|Jaipur|Apartment|City,Amazing views|3800|3|4.6|88|Ananya Joshi|Bright loft with a balcony facing the ramparts of Amer, close to the old bazaars.
Lakeside Mahal Room|Udaipur|Heritage Palace|Luxury,Amazing views,Trending|11800|3|5.0|201|Raghav Singh Mewar|Palace room with marble balconies directly over Lake Pichola and the City Palace.
Aravalli Farm Retreat|Udaipur|Farmhouse|Countryside,Pools,Nature|4300|8|4.7|59|Harsh Mehta|Spacious farmhouse with a pool and mango orchard in the quiet Aravalli foothills.
Backwater Kettuvallam|Kerala|Houseboat|Amazing views,Nature,Trending|8200|4|4.9|187|Joseph Varghese|Traditional rice-barge houseboat cruising the Alleppey backwaters with a private cook.
Munnar Mist Villa|Kerala|Villa|Mountain,Luxury,Amazing views|9600|6|4.9|113|Lakshmi Nair|Hillside villa among tea gardens in Munnar with a glass-walled lounge.
Tea Estate Bungalow|Ooty|Bungalow|Countryside,Nature,Mountain|4600|6|4.8|97|Arun Kumar|Colonial-era bungalow on a working tea estate with log fires and a walled garden.
Pine Lake Cottage|Ooty|Cottage|Amazing views,Mountain|3300|3|4.6|64|Divya Raman|Snug stone cottage a few minutes from Ooty Lake with a sunny deck.
Marine Drive Sea Studio|Mumbai|Apartment|City,Amazing views,Beach|6200|2|4.7|209|Farah Khan|Sea-facing studio on the Queen's Necklace, with a work desk and fast wifi.
Bandra Bohemian Flat|Mumbai|Apartment|City,Trending|5400|3|4.6|132|Kabir Malhotra|Art-filled two-bed in Bandra West steps from cafés, galleries and Carter Road.
Lutyens Garden Residence|Delhi|Villa|Luxury,City|10200|5|4.8|84|Nikhil Kapoor|Elegant garden residence near India Gate with quiet courtyards and a chef-ready kitchen.
Hauz Khas Village Loft|Delhi|Apartment|City,Trending|4100|3|4.5|118|Simran Arora|Design-led loft overlooking the Hauz Khas deer park, near restaurants and nightlife.
Indiranagar Garden Studio|Bangalore|Apartment|City,Nature|3600|2|4.7|141|Priya Hegde|Calm garden-level studio in Indiranagar, ideal for remote work and long stays.
Nandi Hills Glass Cabin|Bangalore|Cabin|Mountain,Amazing views,Trending|5900|4|4.8|72|Sandeep Rao|Glass-fronted cabin above the clouds, ninety minutes from Bengaluru.
La Maison Rose|Pondicherry|Heritage Home|City,Luxury,Beach|7200|4|4.9|126|Camille Laurent|French Quarter townhouse with a courtyard plunge pool, steps from the Promenade.
Auroville Bamboo House|Pondicherry|Eco Cottage|Nature,Countryside|2600|2|4.6|58|Devika Subramanian|Handbuilt bamboo house in the Auroville greenbelt, surrounded by forest and birdsong.
Ganga Riverside Camp|Rishikesh|Camp|Nature,Amazing views,Beach|2400|2|4.6|107|Aman Rawat|Riverside tent on a quiet Ganga sandbank with yoga mornings and bonfire evenings.
Laxman Jhula Penthouse|Rishikesh|Penthouse|Amazing views,Mountain,Pools|4800|4|4.7|69|Neha Bisht|Top-floor penthouse with a rooftop pool and views of the Ganga and Himalayan foothills.
Coffee Plantation Villa|Coorg|Villa|Countryside,Nature,Pools,Luxury|8400|8|4.9|95|Ganapathy Ponnappa|Plantation villa with an infinity pool among coffee and pepper estates in Madikeri.
Dubare Riverside Homestay|Coorg|Homestay|Countryside,Nature,Mountain|3100|4|4.7|81|Bopanna Cheppudira|Family-run homestay by the Cauvery with Coorgi meals and guided plantation walks."""
EXTRA = {"Pools": "Private pool", "Beach": "Beach access", "Mountain": "Mountain view", "Nature": "Garden", "Luxury": "Breakfast included", "City": "Workspace", "Amazing views": "Balcony", "Countryside": "Bonfire area"}

app = create_app()
with app.app_context():
    cols = {c["name"] for c in inspect(db.engine).get_columns("properties")}
    if "--reset" in sys.argv or "categories" not in cols:  # old schema or explicit reset
        Wishlist.__table__.drop(db.engine, checkfirst=True)
        Property.__table__.drop(db.engine, checkfirst=True)
        db.create_all()
    if Property.query.count():
        print("Already seeded. Use --reset to reseed.")
    else:
        for i, line in enumerate(ROWS.splitlines()):
            t, loc, typ, cats, price, g, r, n, host, desc = line.split("|")
            cats, g = cats.split(","), int(g)
            br = max(1, (g + 1) // 2)
            am = list(dict.fromkeys(["Wifi", "Kitchen", "Free parking", "Air conditioning"] + [EXTRA[c] for c in cats]))[:8]
            db.session.add(Property(title=t, location=loc, property_type=typ, categories=cats, category=cats[0],
                price_per_night=int(price), guests=g, bedrooms=br, beds=br + 1, bathrooms=max(1, br - (br > 3)),
                rating=float(r), reviews_count=int(n), host_name=host, amenities=am,
                description=f"{desc} Sleeps {g}, with a fully equipped kitchen and easy access to local food and sights.",
                image_url=f"https://picsum.photos/seed/stayly{i}/900/700/"))
        db.session.commit()
        print(f"Seeded {Property.query.count()} properties.")
