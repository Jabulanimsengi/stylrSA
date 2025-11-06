#!/usr/bin/env python3
"""
Script to expand locationData.ts with all cities from locations.data.ts
This will help generate more location-specific pages for SEO
"""

import json
import re

# Read the locations.data.ts file structure
# This is a simplified version - you'll need to manually map the locations
# from backend/src/locations/locations.data.ts

# Major cities and suburbs to add (from locations.data.ts)
locations_to_add = {
    'gauteng': [
        # Already have: johannesburg, sandton, pretoria, soweto, fourways, midrand, randburg, roodepoort, etc.
        # Add more:
        'rosebank', 'melrose', 'hyde-park', 'bryanston', 'parktown', 'melville',
        'greenside', 'illovo', 'houghton', 'killarney', 'norwood', 'orange-grove',
        'auckland-park', 'braamfontein', 'newtown', 'maboneng', 'fordsburg',
        'bedfordview', 'boksburg', 'benoni', 'germiston', 'springs', 'alberton',
        'edenvale', 'kempton-park', 'vanderbijlpark', 'vereeniging', 'krugersdorp',
        'alexandra', 'katlehong', 'tembisa', 'vosloorus', 'mamelodi', 'soshanguve',
        'atteridgeville', 'centurion', 'bronkhorstspruit', 'cullinan', 'magaliesburg',
        'muldersdrift', 'kromdraai', 'helderberg', 'bapsfontein', 'ekangala',
        'orange-farm', 'clayville', 'ga-rankuwa', 'rietvallei', 'duduza', 'irene',
        'silverfields', 'hofontein', 'dunnottar', 'zithobeni', 'nigel', 'reiger-park',
        'tokoza', 'tsakane', 'wattville', 'luweero', 'lenasia', 'brakpan', 'modderfontein',
        'randfontein', 'westonaria', 'carletonville', 'fochville', 'oberholzer'
    ],
    'western-cape': [
        # Already have: cape-town, stellenbosch, somerset-west
        # Add more:
        'camps-bay', 'clifton', 'green-point', 'mouille-point', 'va-waterfront',
        'city-bowl', 'gardens', 'tamboerskloof', 'oranjezicht', 'vredehoek',
        'constantia', 'newlands', 'rondebosch', 'observatory', 'mowbray',
        'pinelands', 'parow', 'goodwood', 'brackenfell', 'kraaifontein',
        'strand', 'gordons-bay', 'hermanus', 'knysna', 'plettenberg-bay',
        'george', 'mossel-bay', 'oudtshoorn', 'worcester', 'robertson',
        'franschhoek', 'wellington', 'tulbagh', 'ceres', 'langebaan',
        'saldanha', 'vredenburg', 'atlantis', 'milnerton', 'table-view',
        'blouberg', 'melkbosstrand', 'hout-bay', 'noordhoek', 'fish-hoek',
        'simons-town', 'kalk-bay', 'muizenberg', 'st-james', 'kommetjie',
        'scarborough', 'sunset-beach', 'big-bay', 'paarl', 'durbanville',
        'bellville', 'claremont', 'sea-point', 'kenilworth', 'wynberg',
        'bergvliet', 'tokai', 'kirstenhof', 'lakeside', 'steenberg'
    ],
    'kwazulu-natal': [
        # Already have: durban, pietermaritzburg
        # Add more:
        'durban-north', 'westville', 'ballito', 'hillcrest', 'kloof',
        'pinetown', 'new-germany', 'queensburgh', 'amanzimtoti', 'umlazi',
        'chatsworth', 'phoenix', 'verulam', 'tongaat', 'umhlanga-rocks',
        'la-mercy', 'umdloti', 'salt-rock', 'shakaskraal', 'zimbali',
        'hilton', 'howick', 'richmond', 'greytown', 'scottburgh',
        'port-shepstone', 'margate', 'ramsgate', 'southbroom', 'shelly-beach',
        'uvongo', 'port-edward', 'kokstad', 'harding', 'underberg',
        'himeville', 'nottingham-road', 'mooi-river', 'estcourt', 'ladysmith',
        'newcastle', 'vryheid', 'dundee', 'glencoe', 'richards-bay',
        'empangeni', 'st-lucia', 'umtentweni', 'umzumbe', 'izotsha',
        'port-shepstone', 'umkomaas', 'amanzimtoti', 'warner-beach', 'winklespruit'
    ],
    'eastern-cape': [
        'port-elizabeth', 'summerstrand', 'humewood', 'richmond-hill', 'central',
        'greenacres', 'newton-park', 'lorraine', 'walmer', 'schoenmakerskop',
        'sardinia-bay', 'jeffreys-bay', 'st-francis-bay', 'cape-st-francis',
        'port-alfred', 'kentucky-on-sea', 'bathurst', 'grahamstown', 'makhanda',
        'adelaide', 'fort-beaufort', 'cradock', 'graaff-reinet', 'aberdeen',
        'somerset-east', 'jansenville', 'steytlerville', 'willowmore', 'uniondale',
        'kareedouw', 'joubertina', 'patensie', 'hankey', 'paterson',
        'kirkwood', 'addo', 'alexandria', 'bushmans-river-mouth', 'cannon-rocks',
        'east-london', 'gonubie', 'chiselhurst', 'vincent', 'bonza-bay',
        'nahoon', 'beacon-bay', 'selborne', 'berea', 'quigney'
    ],
    'free-state': [
        'bloemfontein', 'welkom', 'kroonstad', 'sasolburg', 'virginia',
        'odendaalsrus', 'bothaville', 'parys', 'vredefort', 'koppies',
        'heilbron', 'villiers', 'frankfort', 'reitz', 'lindley',
        'bethlehem', 'clarens', 'fouriesburg', 'harrismith', 'phuthaditjhaba',
        'ladybrand', 'ficksburg', 'clocolan', 'marquard', 'senekal',
        'winburg', 'brandfort', 'theunissen', 'bultfontein', 'hoofstad'
    ],
    'mpumalanga': [
        'nelspruit', 'mbombela', 'white-river', 'hazyview', 'sabie',
        'graskop', 'pilgrims-rest', 'lydenburg', 'machadodorp', 'dullstroom',
        'barberton', 'badplaas', 'carolina', 'ermelo', 'bethal',
        'standerton', 'secunda', 'trichardt', 'evander', 'kinross',
        'middelburg', 'witbank', 'emalahleni', 'kriel', 'ogies',
        'delmas', 'bronkhorstspruit', 'belfast', 'waterval-boven', 'kaapmuiden'
    ],
    'limpopo': [
        'polokwane', 'pietersburg', 'seshego', 'mankweng', 'turfloop',
        'tzaneen', 'haenertsburg', 'magoebaskloof', 'duiwelskloof', 'modjadjiskloof',
        'phalaborwa', 'hoedspruit', 'timbavati', 'klaserie', 'orpen',
        'louis-trichardt', 'makhado', 'musina', 'messina', 'alldays',
        'ellisras', 'lephalale', 'mokopane', 'potgietersrus', 'modimolle',
        'nylstroom', 'bela-bela', 'warmbaths', 'thabazimbi', 'northam',
        'giyani', 'groblersdal', 'marble-hall', 'roedtan', 'naboomspruit'
    ],
    'north-west': [
        'rustenburg', 'sun-city', 'pilanesberg', 'klerksdorp', 'potchefstroom',
        'ventersdorp', 'lichtenburg', 'coligny', 'delareyville', 'sannieshof',
        'ottosdal', 'schweizer-reneke', 'wolmaransstad', 'makwassie', 'leeudoringstad',
        'stilfontein', 'orkney', 'hartbeesfontein', 'vryburg', 'mafikeng',
        'mmabatho', 'mahikeng', 'zeerust', 'groot-marico', 'brits',
        'hartbeespoort', 'broederstroom', 'kosmos', 'ifafi', 'hebron'
    ],
    'northern-cape': [
        'kimberley', 'upington', 'kuruman', 'kathu', 'sishen',
        'postmasburg', 'olifantshoek', 'danielskuil', 'barkly-west', 'warrenton',
        'hartswater', 'jan-kempdorp', 'vryburg', 'taung', 'campbell',
        'griquatown', 'prieska', 'marydale', 'groblershoop', 'keimoes',
        'kakamas', 'augrabies', 'kenhardt', 'brandvlei', 'calvinia',
        'nieuwoudtville', 'loeriesfontein', 'williston', 'fraserburg', 'carnarvon',
        'victoria-west', 'hutchinson', 'richmond', 'hanover', 'colesberg',
        'norvalspont', 'de-aar', 'britstown', 'loxton', 'sutherland',
        'merweville', 'beaufort-west', 'laingsburg', 'prince-albert', 'leeu-gamka',
        'murraysburg', 'nelspoort', 'three-sisters'
    ]
}

def generate_city_entry(slug, name, province_name, description_template, keywords_template):
    """Generate a city entry for locationData.ts"""
    # Convert slug to display name
    display_name = name.replace('-', ' ').title()
    
    # Generate description
    description = description_template.format(city=display_name, province=province_name)
    
    # Generate keywords
    keywords = [
        f'hair salon near me {display_name}',
        f'nail salon near me {display_name}',
        f'spa near me {display_name}',
        f'beauty salon near me {display_name}',
        f'hairdresser near me {display_name}',
        f'gel nails near me {display_name}',
        f'massage near me {display_name}',
        f'manicure near me {display_name}',
        f'makeup artist near me {display_name}',
        f'facial near me {display_name}'
    ]
    
    return {
        'slug': slug,
        'name': display_name,
        'province': province_name,
        'description': description,
        'keywords': keywords
    }

# This is a helper script - the actual expansion should be done manually
# or through a more sophisticated TypeScript parser
print("Location expansion helper script")
print("=" * 60)
print()
print("This script helps identify cities to add to locationData.ts")
print("You'll need to manually add these to the TypeScript file")
print()
print(f"Total cities to add: {sum(len(cities) for cities in locations_to_add.values())}")
print()
for province, cities in locations_to_add.items():
    print(f"{province}: {len(cities)} cities")
print()
print("Next steps:")
print("1. Review the cities list above")
print("2. Add them to frontend/src/lib/locationData.ts")
print("3. Ensure proper formatting and SEO keywords")
print("4. Run the keyword generator to create pages for all locations")

