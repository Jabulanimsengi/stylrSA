#!/usr/bin/env python3
"""
Keyword Generator for Stylr SA
Generates 30,000+ SEO keywords for beauty services across South Africa
"""

# --- Comprehensive Services List ---
services = [
    "hair salon", "barber", "nail salon", "spa", "beauty salon", "makeup artist",
    "braiding", "box braids", "knotless braids", "cornrows", "twists", "dreadlocks",
    "hair extensions", "weave installation", "haircut", "men's haircut", "fade haircut",
    "kids haircut", "hair styling", "blowout", "hair colour", "highlights",
    "Brazilian blowout", "Olaplex treatment", "manicure", "pedicure", "gel nails",
    "acrylic nails", "nail art", "lash extensions", "lash lift", "microblading",
    "brow lamination", "threading", "facial", "skin care", "chemical peel",
    "massage", "deep tissue massage", "Swedish massage", "couples massage",
    "hot stone massage", "waxing", "Brazilian wax", "Hollywood wax", "leg wax",
    "men's grooming", "hot shave", "beard trim", "wedding makeup", "tattoo removal",
    "balayage", "ombre", "hair color", "hair dye", "keratin treatment",
    "hair treatment", "hair transformation", "haircut and color", "haircut and style",
    "Ghana braids", "Senegalese twists", "crochet braids", "faux locs",
    "nail technician", "nail care", "nail design", "nail polish", "nail repair",
    "eyebrow threading", "eyebrow waxing", "eyebrow tinting", "eyebrow shaping",
    "full body massage", "sports massage", "prenatal massage", "reflexology",
    "body scrub", "body wrap", "cellulite treatment", "anti-aging facial",
    "acne treatment", "skin rejuvenation", "dermaplaning", "hydrafacial",
    "bikini wax", "underarm wax", "full leg wax", "half leg wax",
    "bridal hair", "bridal makeup", "bridal package", "wedding hair and makeup",
    "event makeup", "special occasion makeup", "prom makeup", "matric dance makeup"
]

# --- Comprehensive Locations List (Major Cities & Suburbs) ---
locations = [
    # Gauteng
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Sandton", "Randburg",
    "Soweto", "Gqeberha", "Midrand", "Roodepoort", "Bloemfontein", "Rosebank",
    "Fourways", "Sea Point", "Umhlanga", "Durbanville", "Bellville", "Claremont",
    "Stellenbosch", "Paarl", "East London", "Polokwane", "Nelspruit", "Bedfordview",
    "Centurion", "Kempton Park", "Springs", "Germiston", "Benoni", "Boksburg",
    "Alberton", "Edenvale", "Vanderbijlpark", "Vereeniging", "Krugersdorp",
    "Alexandra", "Katlehong", "Tembisa", "Vosloorus", "Mamelodi", "Soshanguve",
    "Atteridgeville", "Melrose", "Hyde Park", "Bryanston", "Parktown", "Melville",
    "Greenside", "Illovo", "Houghton", "Killarney", "Norwood", "Orange Grove",
    "Auckland Park", "Braamfontein", "Newtown", "Maboneng", "Fordsburg",
    
    # Western Cape
    "Camps Bay", "Clifton", "Green Point", "Mouille Point", "V&A Waterfront",
    "City Bowl", "Gardens", "Tamboerskloof", "Oranjezicht", "Vredehoek",
    "Constantia", "Newlands", "Rondebosch", "Observatory", "Mowbray",
    "Pinelands", "Parow", "Goodwood", "Brackenfell", "Kraaifontein",
    "Somerset West", "Strand", "Gordon's Bay", "Hermanus", "Knysna",
    "Plettenberg Bay", "George", "Mossel Bay", "Oudtshoorn", "Worcester",
    "Robertson", "Franschhoek", "Wellington", "Tulbagh", "Ceres",
    "Langebaan", "Saldanha", "Vredenburg", "Atlantis", "Milnerton",
    "Table View", "Blouberg", "Melkbosstrand", "Hout Bay", "Noordhoek",
    "Fish Hoek", "Simon's Town", "Kalk Bay", "Muizenberg", "St James",
    "Kalk Bay", "Kommetjie", "Scarborough", "Sunset Beach", "Big Bay",
    
    # KwaZulu-Natal
    "Durban North", "Westville", "Ballito", "Hillcrest", "Kloof",
    "Pinetown", "New Germany", "Queensburgh", "Amanzimtoti", "Umlazi",
    "Chatsworth", "Phoenix", "Verulam", "Tongaat", "Umhlanga Rocks",
    "La Mercy", "Umdloti", "Salt Rock", "Shakaskraal", "Zimbali",
    "Pietermaritzburg", "Hilton", "Howick", "Richmond", "Greytown",
    "Scottburgh", "Port Shepstone", "Margate", "Ramsgate", "Southbroom",
    "Shelly Beach", "Uvongo", "Port Edward", "Kokstad", "Harding",
    "Underberg", "Himeville", "Nottingham Road", "Mooi River", "Estcourt",
    "Ladysmith", "Newcastle", "Vryheid", "Dundee", "Glencoe",
    
    # Eastern Cape
    "Port Elizabeth", "Summerstrand", "Humewood", "Richmond Hill", "Central",
    "Greenacres", "Newton Park", "Lorraine", "Walmer", "Schoenmakerskop",
    "Sardinia Bay", "Jeffreys Bay", "St Francis Bay", "Cape St Francis",
    "Port Alfred", "Kentucky-on-Sea", "Bathurst", "Grahamstown", "Makhanda",
    "Adelaide", "Fort Beaufort", "Cradock", "Graaff-Reinet", "Aberdeen",
    "Somerset East", "Jansenville", "Steytlerville", "Willowmore", "Uniondale",
    "Kareedouw", "Joubertina", "Patensie", "Hankey", "Paterson",
    "Kirkwood", "Addo", "Alexandria", "Bushmans River Mouth", "Cannon Rocks",
    
    # Free State
    "Bloemfontein", "Welkom", "Kroonstad", "Sasolburg", "Virginia",
    "Odendaalsrus", "Bothaville", "Parys", "Vredefort", "Koppies",
    "Heilbron", "Villiers", "Frankfort", "Reitz", "Lindley",
    "Bethlehem", "Clarens", "Fouriesburg", "Harrismith", "Phuthaditjhaba",
    "Ladybrand", "Ficksburg", "Clocolan", "Marquard", "Senekal",
    "Winburg", "Brandfort", "Theunissen", "Bultfontein", "Hoofstad",
    
    # Mpumalanga
    "Nelspruit", "Mbombela", "White River", "Hazyview", "Sabie",
    "Graskop", "Pilgrim's Rest", "Lydenburg", "Machadodorp", "Dullstroom",
    "Barberton", "Badplaas", "Carolina", "Ermelo", "Bethal",
    "Standerton", "Secunda", "Trichardt", "Evander", "Kinross",
    "Middelburg", "Witbank", "Emalahleni", "Kriel", "Ogies",
    "Delmas", "Bronkhorstspruit", "Belfast", "Dullstroom", "Waterval Boven",
    
    # Limpopo
    "Polokwane", "Pietersburg", "Seshego", "Mankweng", "Turfloop",
    "Tzaneen", "Haenertsburg", "Magoebaskloof", "Duiwelskloof", "Modjadjiskloof",
    "Phalaborwa", "Hoedspruit", "Timbavati", "Klaserie", "Orpen",
    "Louis Trichardt", "Makhado", "Musina", "Messina", "Alldays",
    "Ellisras", "Lephalale", "Mokopane", "Potgietersrus", "Modimolle",
    "Nylstroom", "Bela-Bela", "Warmbaths", "Thabazimbi", "Northam",
    "Giyani", "Groblersdal", "Marble Hall", "Roedtan", "Naboomspruit",
    
    # North West
    "Rustenburg", "Sun City", "Pilanesberg", "Klerksdorp", "Potchefstroom",
    "Ventersdorp", "Lichtenburg", "Coligny", "Delareyville", "Sannieshof",
    "Ottosdal", "Schweizer-Reneke", "Wolmaransstad", "Makwassie", "Leeudoringstad",
    "Stilfontein", "Orkney", "Hartbeesfontein", "Klerksdorp", "Vryburg",
    "Mafikeng", "Mmabatho", "Mahikeng", "Zeerust", "Groot Marico",
    "Brits", "Hartbeespoort", "Broederstroom", "Kosmos", "Ifafi",
    
    # Northern Cape
    "Kimberley", "Upington", "Kuruman", "Kathu", "Sishen",
    "Postmasburg", "Olifantshoek", "Danielskuil", "Barkly West", "Warrenton",
    "Hartswater", "Jan Kempdorp", "Vryburg", "Mafikeng", "Taung",
    "Campbell", "Griquatown", "Prieska", "Marydale", "Groblershoop",
    "Keimoes", "Kakamas", "Augrabies", "Kenhardt", "Brandvlei",
    "Calvinia", "Nieuwoudtville", "Loeriesfontein", "Williston", "Fraserburg",
    "Carnarvon", "Victoria West", "Hutchinson", "Richmond", "Hanover",
    "Colesberg", "Norvalspont", "De Aar", "Britstown", "Loxton",
    "Sutherland", "Fraserburg", "Merweville", "Beaufort West", "Laingsburg",
    "Prince Albert", "Leeu-Gamka", "Murraysburg", "Nelspoort", "Three Sisters"
]

# --- Keyword Modifiers ---
modifiers_prefix = [
    "best", "top-rated", "affordable", "cheap", "find a", "book a", 
    "mobile", "last-minute", "emergency", "walk-in", "luxury", "premium",
    "professional", "experienced", "certified", "licensed", "nearby",
    "local", "recommended", "popular", "trending", "new", "established"
]

modifiers_suffix = [
    "near me", "prices", "cost", "specials", "deals", "reviews", 
    "open now", "for men", "for women", "for kids", "quotes",
    "booking", "appointment", "online booking", "same day", "walk in",
    "discount", "promotion", "package", "treatment", "service",
    "salon", "studio", "clinic", "spa", "shop"
]

# --- Competitors ---
competitors = ["Booksy", "Fresha", "Treatwell", "StyleSeat"]

# --- The Generator ---
keyword_list = set()  # Using a set to avoid duplicates

print("Generating keywords...")
print(f"Services: {len(services)}")
print(f"Locations: {len(locations)}")
print(f"Prefix modifiers: {len(modifiers_prefix)}")
print(f"Suffix modifiers: {len(modifiers_suffix)}")
print()

# Type 1: [Service] in [Location]
print("Type 1: [Service] in [Location]")
for service in services:
    for location in locations:
        keyword_list.add(f"{service} in {location}")
print(f"  Generated: {len(services) * len(locations)} keywords")

# Type 2: [Modifier] [Service] in [Location]
print("Type 2: [Modifier] [Service] in [Location]")
count = 0
for prefix in modifiers_prefix:
    for service in services:
        for location in locations:
            keyword_list.add(f"{prefix} {service} in {location}")
            count += 1
            if count % 10000 == 0:
                print(f"  Progress: {count} keywords...")
print(f"  Generated: {count} keywords")

# Type 3: [Service] [Suffix]
print("Type 3: [Service] [Suffix]")
for service in services:
    for suffix in modifiers_suffix:
        keyword_list.add(f"{service} {suffix}")
print(f"  Generated: {len(services) * len(modifiers_suffix)} keywords")

# Type 4: [Service] [Location] [Suffix]
print("Type 4: [Service] [Location] [Suffix]")
count = 0
for service in services:
    for location in locations:
        for suffix in modifiers_suffix:
            keyword_list.add(f"{service} {location} {suffix}")
            count += 1
            if count % 10000 == 0:
                print(f"  Progress: {count} keywords...")
print(f"  Generated: {count} keywords")

# Type 5: [Modifier] [Service] [Location] [Suffix] (High-value combinations)
print("Type 5: [Modifier] [Service] [Location] [Suffix] (selective)")
high_value_prefixes = ["best", "top-rated", "affordable", "cheap", "find a", "book a"]
high_value_suffixes = ["near me", "prices", "cost", "reviews", "open now", "booking"]
count = 0
for prefix in high_value_prefixes:
    for service in services:
        for location in locations[:50]:  # Top 50 locations only for this type
            for suffix in high_value_suffixes:
                keyword_list.add(f"{prefix} {service} {location} {suffix}")
                count += 1
print(f"  Generated: {count} keywords")

# Type 6: Competitor Keywords
print("Type 6: Competitor Keywords")
for competitor in competitors:
    keyword_list.add(f"{competitor} alternative South Africa")
    keyword_list.add(f"Stylr SA vs {competitor}")
    keyword_list.add(f"better than {competitor} South Africa")
    for location in locations[:30]:  # Top 30 locations
        keyword_list.add(f"{competitor} {location}")
        keyword_list.add(f"{competitor} alternative {location}")
print(f"  Generated: {len(competitors) * (3 + 60)} keywords")

# Type 7: Service-specific variations
print("Type 7: Service-specific variations")
service_variations = {
    "hair salon": ["hairdresser", "hairstylist", "hair studio", "hair salon near me"],
    "nail salon": ["nail technician", "nail studio", "nail bar", "nail spa"],
    "spa": ["day spa", "wellness center", "beauty spa", "relaxation spa"],
    "barber": ["barbershop", "barber shop", "men's barber", "traditional barber"],
    "massage": ["massage therapist", "massage therapy", "therapeutic massage"],
    "makeup artist": ["makeup artist near me", "professional makeup", "bridal makeup artist"],
    "braiding": ["hair braiding", "braiding salon", "braid specialist", "african hair braiding"],
    "waxing": ["waxing salon", "wax specialist", "hair removal", "waxing studio"],
    "facial": ["facial treatment", "facial spa", "skin facial", "deep cleansing facial"],
    "manicure": ["manicure and pedicure", "nail manicure", "gel manicure", "classic manicure"]
}

for base_service, variations in service_variations.items():
    for variation in variations:
        for location in locations[:40]:  # Top 40 locations
            keyword_list.add(f"{variation} {location}")
            keyword_list.add(f"{variation} near me {location}")
print(f"  Generated service variations")

# --- Print Results ---
print()
print("=" * 60)
print(f"Total Unique Keywords Generated: {len(keyword_list)}")
print("=" * 60)
print()

# --- Save to file ---
output_file = "keyword_list.txt"
print(f"Saving keywords to {output_file}...")
with open(output_file, "w", encoding="utf-8") as f:
    for keyword in sorted(keyword_list):
        f.write(f"{keyword}\n")

print(f"✅ Keyword list saved to {output_file}")
print()

# --- Generate keyword analysis ---
print("Keyword Analysis:")
print(f"  - Total keywords: {len(keyword_list):,}")
print(f"  - Average length: {sum(len(k) for k in keyword_list) / len(keyword_list):.1f} characters")
print()

# Count keywords by type
location_keywords = sum(1 for k in keyword_list if any(loc in k for loc in locations[:10]))
service_keywords = sum(1 for k in keyword_list if any(serv in k.lower() for serv in services[:10]))
near_me_keywords = sum(1 for k in keyword_list if "near me" in k.lower())
price_keywords = sum(1 for k in keyword_list if "price" in k.lower() or "cost" in k.lower())

print("Keyword Distribution:")
print(f"  - Location-based: {location_keywords:,}")
print(f"  - Service-based: {service_keywords:,}")
print(f"  - 'Near me' keywords: {near_me_keywords:,}")
print(f"  - Price-related: {price_keywords:,}")
print()

print("✅ Keyword generation complete!")
print()
print("Next steps:")
print("1. Review keyword_list.txt")
print("2. Use these keywords to create content pages")
print("3. Update your site's metadata with relevant keywords")
print("4. Submit sitemap to Google Search Console")

