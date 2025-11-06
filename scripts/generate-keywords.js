#!/usr/bin/env node
/**
 * Keyword Generator for Stylr SA
 * Generates 30,000+ SEO keywords for beauty services across South Africa
 */

// --- Comprehensive Services List ---
const services = [
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
];

// --- Comprehensive Locations List (Major Cities & Suburbs) ---
const locations = [
  // Gauteng
  "Johannesburg", "Sandton", "Pretoria", "Randburg", "Soweto", "Midrand",
  "Roodepoort", "Rosebank", "Fourways", "Bedfordview", "Centurion", "Kempton Park",
  "Springs", "Germiston", "Benoni", "Boksburg", "Alberton", "Edenvale",
  "Vanderbijlpark", "Vereeniging", "Krugersdorp", "Alexandra", "Katlehong",
  "Tembisa", "Vosloorus", "Mamelodi", "Soshanguve", "Atteridgeville", "Melrose",
  "Hyde Park", "Bryanston", "Parktown", "Melville", "Greenside", "Illovo",
  "Houghton", "Killarney", "Norwood", "Orange Grove", "Auckland Park", "Braamfontein",
  "Newtown", "Maboneng", "Fordsburg",
  
  // Western Cape
  "Cape Town", "Camps Bay", "Clifton", "Green Point", "Mouille Point", "V&A Waterfront",
  "City Bowl", "Gardens", "Tamboerskloof", "Oranjezicht", "Vredehoek",
  "Constantia", "Newlands", "Rondebosch", "Observatory", "Mowbray",
  "Pinelands", "Parow", "Goodwood", "Brackenfell", "Kraaifontein",
  "Somerset West", "Strand", "Gordon's Bay", "Hermanus", "Knysna",
  "Plettenberg Bay", "George", "Mossel Bay", "Oudtshoorn", "Worcester",
  "Robertson", "Franschhoek", "Wellington", "Tulbagh", "Ceres",
  "Langebaan", "Saldanha", "Vredenburg", "Atlantis", "Milnerton",
  "Table View", "Blouberg", "Melkbosstrand", "Hout Bay", "Noordhoek",
  "Fish Hoek", "Simon's Town", "Kalk Bay", "Muizenberg", "St James",
  "Kommetjie", "Scarborough", "Sunset Beach", "Big Bay", "Stellenbosch",
  "Paarl", "Durbanville", "Bellville", "Claremont", "Sea Point",
  
  // KwaZulu-Natal
  "Durban", "Durban North", "Westville", "Ballito", "Hillcrest", "Kloof",
  "Pinetown", "New Germany", "Queensburgh", "Amanzimtoti", "Umlazi",
  "Chatsworth", "Phoenix", "Verulam", "Tongaat", "Umhlanga Rocks",
  "La Mercy", "Umdloti", "Salt Rock", "Shakaskraal", "Zimbali",
  "Pietermaritzburg", "Hilton", "Howick", "Richmond", "Greytown",
  "Scottburgh", "Port Shepstone", "Margate", "Ramsgate", "Southbroom",
  "Shelly Beach", "Uvongo", "Port Edward", "Kokstad", "Harding",
  "Underberg", "Himeville", "Nottingham Road", "Mooi River", "Estcourt",
  "Ladysmith", "Newcastle", "Vryheid", "Dundee", "Glencoe",
  
  // Eastern Cape
  "Port Elizabeth", "Gqeberha", "Summerstrand", "Humewood", "Richmond Hill", "Central",
  "Greenacres", "Newton Park", "Lorraine", "Walmer", "Schoenmakerskop",
  "Sardinia Bay", "Jeffreys Bay", "St Francis Bay", "Cape St Francis",
  "Port Alfred", "Kentucky-on-Sea", "Bathurst", "Grahamstown", "Makhanda",
  "Adelaide", "Fort Beaufort", "Cradock", "Graaff-Reinet", "Aberdeen",
  "Somerset East", "Jansenville", "Steytlerville", "Willowmore", "Uniondale",
  "Kareedouw", "Joubertina", "Patensie", "Hankey", "Paterson",
  "Kirkwood", "Addo", "Alexandria", "Bushmans River Mouth", "Cannon Rocks",
  "East London",
  
  // Free State
  "Bloemfontein", "Welkom", "Kroonstad", "Sasolburg", "Virginia",
  "Odendaalsrus", "Bothaville", "Parys", "Vredefort", "Koppies",
  "Heilbron", "Villiers", "Frankfort", "Reitz", "Lindley",
  "Bethlehem", "Clarens", "Fouriesburg", "Harrismith", "Phuthaditjhaba",
  "Ladybrand", "Ficksburg", "Clocolan", "Marquard", "Senekal",
  "Winburg", "Brandfort", "Theunissen", "Bultfontein", "Hoofstad",
  
  // Mpumalanga
  "Nelspruit", "Mbombela", "White River", "Hazyview", "Sabie",
  "Graskop", "Pilgrim's Rest", "Lydenburg", "Machadodorp", "Dullstroom",
  "Barberton", "Badplaas", "Carolina", "Ermelo", "Bethal",
  "Standerton", "Secunda", "Trichardt", "Evander", "Kinross",
  "Middelburg", "Witbank", "Emalahleni", "Kriel", "Ogies",
  "Delmas", "Bronkhorstspruit", "Belfast", "Waterval Boven", "Kaapmuiden",
  
  // Limpopo
  "Polokwane", "Pietersburg", "Seshego", "Mankweng", "Turfloop",
  "Tzaneen", "Haenertsburg", "Magoebaskloof", "Duiwelskloof", "Modjadjiskloof",
  "Phalaborwa", "Hoedspruit", "Timbavati", "Klaserie", "Orpen",
  "Louis Trichardt", "Makhado", "Musina", "Messina", "Alldays",
  "Ellisras", "Lephalale", "Mokopane", "Potgietersrus", "Modimolle",
  "Nylstroom", "Bela-Bela", "Warmbaths", "Thabazimbi", "Northam",
  "Giyani", "Groblersdal", "Marble Hall", "Roedtan", "Naboomspruit",
  
  // North West
  "Rustenburg", "Sun City", "Pilanesberg", "Klerksdorp", "Potchefstroom",
  "Ventersdorp", "Lichtenburg", "Coligny", "Delareyville", "Sannieshof",
  "Ottosdal", "Schweizer-Reneke", "Wolmaransstad", "Makwassie", "Leeudoringstad",
  "Stilfontein", "Orkney", "Hartbeesfontein", "Vryburg", "Mafikeng",
  "Mmabatho", "Mahikeng", "Zeerust", "Groot Marico", "Brits",
  "Hartbeespoort", "Broederstroom", "Kosmos", "Ifafi", "Hebron",
  
  // Northern Cape
  "Kimberley", "Upington", "Kuruman", "Kathu", "Sishen",
  "Postmasburg", "Olifantshoek", "Danielskuil", "Barkly West", "Warrenton",
  "Hartswater", "Jan Kempdorp", "Vryburg", "Taung", "Campbell",
  "Griquatown", "Prieska", "Marydale", "Groblershoop", "Keimoes",
  "Kakamas", "Augrabies", "Kenhardt", "Brandvlei", "Calvinia",
  "Nieuwoudtville", "Loeriesfontein", "Williston", "Fraserburg", "Carnarvon",
  "Victoria West", "Hutchinson", "Richmond", "Hanover", "Colesberg",
  "Norvalspont", "De Aar", "Britstown", "Loxton", "Sutherland",
  "Merweville", "Beaufort West", "Laingsburg", "Prince Albert", "Leeu-Gamka",
  "Murraysburg", "Nelspoort", "Three Sisters"
];

// --- Keyword Modifiers ---
const modifiersPrefix = [
  "best", "top-rated", "affordable", "cheap", "find a", "book a",
  "mobile", "last-minute", "emergency", "walk-in", "luxury", "premium",
  "professional", "experienced", "certified", "licensed", "nearby",
  "local", "recommended", "popular", "trending", "new", "established"
];

const modifiersSuffix = [
  "near me", "prices", "cost", "specials", "deals", "reviews",
  "open now", "for men", "for women", "for kids", "quotes",
  "booking", "appointment", "online booking", "same day", "walk in",
  "discount", "promotion", "package", "treatment", "service",
  "salon", "studio", "clinic", "spa", "shop"
];

// --- Competitors ---
const competitors = ["Booksy", "Fresha", "Treatwell", "StyleSeat"];

// --- The Generator ---
const keywordList = new Set(); // Using a Set to avoid duplicates

console.log("Generating keywords...");
console.log(`Services: ${services.length}`);
console.log(`Locations: ${locations.length}`);
console.log(`Prefix modifiers: ${modifiersPrefix.length}`);
console.log(`Suffix modifiers: ${modifiersSuffix.length}`);
console.log();

// Type 1: [Service] in [Location]
console.log("Type 1: [Service] in [Location]");
for (const service of services) {
  for (const location of locations) {
    keywordList.add(`${service} in ${location}`);
  }
}
console.log(`  Generated: ${services.length * locations.length} keywords`);

// Type 2: [Modifier] [Service] in [Location]
console.log("Type 2: [Modifier] [Service] in [Location]");
let count = 0;
for (const prefix of modifiersPrefix) {
  for (const service of services) {
    for (const location of locations) {
      keywordList.add(`${prefix} ${service} in ${location}`);
      count++;
      if (count % 10000 === 0) {
        console.log(`  Progress: ${count} keywords...`);
      }
    }
  }
}
console.log(`  Generated: ${count} keywords`);

// Type 3: [Service] [Suffix]
console.log("Type 3: [Service] [Suffix]");
for (const service of services) {
  for (const suffix of modifiersSuffix) {
    keywordList.add(`${service} ${suffix}`);
  }
}
console.log(`  Generated: ${services.length * modifiersSuffix.length} keywords`);

// Type 4: [Service] [Location] [Suffix]
console.log("Type 4: [Service] [Location] [Suffix]");
count = 0;
for (const service of services) {
  for (const location of locations) {
    for (const suffix of modifiersSuffix) {
      keywordList.add(`${service} ${location} ${suffix}`);
      count++;
      if (count % 10000 === 0) {
        console.log(`  Progress: ${count} keywords...`);
      }
    }
  }
}
console.log(`  Generated: ${count} keywords`);

// Type 5: [Modifier] [Service] [Location] [Suffix] (High-value combinations)
console.log("Type 5: [Modifier] [Service] [Location] [Suffix] (selective)");
const highValuePrefixes = ["best", "top-rated", "affordable", "cheap", "find a", "book a"];
const highValueSuffixes = ["near me", "prices", "cost", "reviews", "open now", "booking"];
count = 0;
for (const prefix of highValuePrefixes) {
  for (const service of services) {
    for (const location of locations.slice(0, 50)) { // Top 50 locations only
      for (const suffix of highValueSuffixes) {
        keywordList.add(`${prefix} ${service} ${location} ${suffix}`);
        count++;
      }
    }
  }
}
console.log(`  Generated: ${count} keywords`);

// Type 6: Competitor Keywords
console.log("Type 6: Competitor Keywords");
for (const competitor of competitors) {
  keywordList.add(`${competitor} alternative South Africa`);
  keywordList.add(`Stylr SA vs ${competitor}`);
  keywordList.add(`better than ${competitor} South Africa`);
  for (const location of locations.slice(0, 30)) { // Top 30 locations
    keywordList.add(`${competitor} ${location}`);
    keywordList.add(`${competitor} alternative ${location}`);
  }
}
console.log(`  Generated: ${competitors.length * (3 + 60)} keywords`);

// Type 7: Service-specific variations
console.log("Type 7: Service-specific variations");
const serviceVariations = {
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
};

for (const [baseService, variations] of Object.entries(serviceVariations)) {
  for (const variation of variations) {
    for (const location of locations.slice(0, 40)) { // Top 40 locations
      keywordList.add(`${variation} ${location}`);
      keywordList.add(`${variation} near me ${location}`);
    }
  }
}
console.log(`  Generated service variations`);

// --- Print Results ---
console.log();
console.log("=".repeat(60));
console.log(`Total Unique Keywords Generated: ${keywordList.size.toLocaleString()}`);
console.log("=".repeat(60));
console.log();

// --- Save to file ---
const fs = require('fs');
const path = require('path');
const outputFile = path.join(__dirname, 'keyword_list.txt');

console.log(`Saving keywords to ${outputFile}...`);
const sortedKeywords = Array.from(keywordList).sort();
fs.writeFileSync(outputFile, sortedKeywords.join('\n'), 'utf8');

console.log(`✅ Keyword list saved to ${outputFile}`);
console.log();

// --- Generate keyword analysis ---
console.log("Keyword Analysis:");
console.log(`  - Total keywords: ${keywordList.size.toLocaleString()}`);
const avgLength = Array.from(keywordList).reduce((sum, k) => sum + k.length, 0) / keywordList.size;
console.log(`  - Average length: ${avgLength.toFixed(1)} characters`);
console.log();

// Count keywords by type
const locationKeywords = Array.from(keywordList).filter(k => 
  locations.slice(0, 10).some(loc => k.includes(loc))
).length;
const serviceKeywords = Array.from(keywordList).filter(k => 
  services.slice(0, 10).some(serv => k.toLowerCase().includes(serv))
).length;
const nearMeKeywords = Array.from(keywordList).filter(k => 
  k.toLowerCase().includes("near me")
).length;
const priceKeywords = Array.from(keywordList).filter(k => 
  k.toLowerCase().includes("price") || k.toLowerCase().includes("cost")
).length;

console.log("Keyword Distribution:");
console.log(`  - Location-based: ${locationKeywords.toLocaleString()}`);
console.log(`  - Service-based: ${serviceKeywords.toLocaleString()}`);
console.log(`  - 'Near me' keywords: ${nearMeKeywords.toLocaleString()}`);
console.log(`  - Price-related: ${priceKeywords.toLocaleString()}`);
console.log();

console.log("✅ Keyword generation complete!");
console.log();
console.log("Next steps:");
console.log("1. Review keyword_list.txt");
console.log("2. Use these keywords to create content pages");
console.log("3. Update your site's metadata with relevant keywords");
console.log("4. Submit sitemap to Google Search Console");

