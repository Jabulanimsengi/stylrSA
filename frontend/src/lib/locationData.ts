// Location data for SEO and navigation

export interface CityInfo {
  slug: string;
  name: string;
  province: string;
  description: string;
  keywords: string[];
  popularAreas?: string[];
}

export interface ProvinceInfo {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  cities: CityInfo[];
}

export const PROVINCES: Record<string, ProvinceInfo> = {
  gauteng: {
    slug: 'gauteng',
    name: 'Gauteng',
    description: 'Find top-rated salons, spas, and beauty professionals in Gauteng. Book appointments at the best hair salons, nail salons, barbershops, and wellness centers in Johannesburg, Pretoria, and surrounding areas.',
    keywords: ['Gauteng salons', 'Johannesburg beauty', 'Pretoria hair salon', 'Gauteng spa', 'Johannesburg nail salon', 'Pretoria barbershop'],
    cities: [
      // Major Cities & CBDs
      {
        slug: 'johannesburg',
        name: 'Johannesburg',
        province: 'Gauteng',
        description: 'Discover premium salons and beauty services in Johannesburg. Book appointments at top-rated hair salons, nail studios, spas, and barbershops in the heart of Jozi.',
        keywords: ['hair salon near me Johannesburg', 'nail salon near me Johannesburg', 'spa near me Johannesburg', 'best hair salon in Johannesburg', 'beauty salon near me Johannesburg'],
      },
      {
        slug: 'sandton',
        name: 'Sandton',
        province: 'Gauteng',
        description: 'Find luxury salons and premium beauty services in Sandton. Book at the finest hair salons, nail studios, spas, and wellness centers in Sandton City and surrounding areas.',
        keywords: ['luxury spa near me Sandton', 'best hair salon in Sandton', 'nail salon near me Sandton', 'beauty salon Sandton', 'balayage near me Sandton'],
      },
      {
        slug: 'pretoria',
        name: 'Pretoria',
        province: 'Gauteng',
        description: 'Explore top salons and beauty professionals in Pretoria. Book appointments at the best hair salons, nail salons, spas, and barbershops in Tshwane.',
        keywords: ['hair salon near me Pretoria', 'nail salon near me Pretoria', 'spa near me Pretoria', 'beauty salon Pretoria', 'Tshwane salons'],
      },

      // Soweto & Townships
      {
        slug: 'soweto',
        name: 'Soweto',
        province: 'Gauteng',
        description: 'Find quality salons and beauty services in Soweto. Book appointments at trusted hair salons, nail studios, and barbershops serving the Soweto community.',
        keywords: ['hair salon near me Soweto', 'african hair braiding near me Soweto', 'beauty salon Soweto', 'barbershop near me Soweto', 'nail salon Soweto'],
      },
      {
        slug: 'alexandra',
        name: 'Alexandra',
        province: 'Gauteng',
        description: 'Find local salons and beauty services in Alexandra. Book at trusted hair salons, nail studios, and barbershops in Alex.',
        keywords: ['hair salon near me Alexandra', 'beauty salon Alexandra', 'barbershop Alex', 'nail salon Alexandra'],
      },
      {
        slug: 'katlehong',
        name: 'Katlehong',
        province: 'Gauteng',
        description: 'Discover local salons and beauty professionals in Katlehong. Book at trusted hair salons, nail studios, and barbershops in the East Rand.',
        keywords: ['hair salon near me Katlehong', 'beauty salon Katlehong', 'nail salon Katlehong', 'barbershop Katlehong', 'East Rand salons'],
      },
      {
        slug: 'tembisa',
        name: 'Tembisa',
        province: 'Gauteng',
        description: 'Find salons and beauty services in Tembisa. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Tembisa', 'beauty salon Tembisa', 'nail salon Tembisa', 'barbershop Tembisa'],
      },
      {
        slug: 'vosloorus',
        name: 'Vosloorus',
        province: 'Gauteng',
        description: 'Discover salons and beauty professionals in Vosloorus. Book at trusted hair salons and barbershops.',
        keywords: ['hair salon near me Vosloorus', 'beauty salon Vosloorus', 'barbershop Vosloorus'],
      },
      {
        slug: 'thokoza',
        name: 'Thokoza',
        province: 'Gauteng',
        description: 'Find local salons in Thokoza. Book appointments at hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Thokoza', 'beauty salon Thokoza', 'barbershop Thokoza'],
      },
      {
        slug: 'daveyton',
        name: 'Daveyton',
        province: 'Gauteng',
        description: 'Discover salons in Daveyton. Book at local hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon near me Daveyton', 'beauty salon Daveyton', 'nail salon Daveyton'],
      },
      {
        slug: 'diepsloot',
        name: 'Diepsloot',
        province: 'Gauteng',
        description: 'Find salons in Diepsloot. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Diepsloot', 'beauty salon Diepsloot', 'barbershop Diepsloot'],
      },

      // Northern Suburbs
      {
        slug: 'fourways',
        name: 'Fourways',
        province: 'Gauteng',
        description: 'Find premium salons in Fourways. Book at top hair salons, nail studios, spas, and beauty centers in Fourways and surrounding areas.',
        keywords: ['hair salon near me Fourways', 'spa near me Fourways', 'nail salon Fourways', 'beauty salon Fourways'],
      },
      {
        slug: 'midrand',
        name: 'Midrand',
        province: 'Gauteng',
        description: 'Discover salons in Midrand. Book at quality hair salons, nail studios, and spas between Johannesburg and Pretoria.',
        keywords: ['hair salon near me Midrand', 'nail salon Midrand', 'spa near me Midrand', 'beauty salon Midrand'],
      },
      {
        slug: 'randburg',
        name: 'Randburg',
        province: 'Gauteng',
        description: 'Find top salons in Randburg. Book at hair salons, nail studios, spas, and barbershops.',
        keywords: ['hair salon near me Randburg', 'nail salon Randburg', 'spa Randburg', 'beauty salon Randburg'],
      },
      {
        slug: 'roodepoort',
        name: 'Roodepoort',
        province: 'Gauteng',
        description: 'Discover salons in Roodepoort. Book at hair salons, nail studios, and beauty centers in the West Rand.',
        keywords: ['hair salon near me Roodepoort', 'nail salon Roodepoort', 'beauty salon Roodepoort', 'West Rand salons'],
      },
      {
        slug: 'krugersdorp',
        name: 'Krugersdorp',
        province: 'Gauteng',
        description: 'Find salons in Krugersdorp. Book at local hair salons, nail studios, and barbershops in the West Rand.',
        keywords: ['hair salon near me Krugersdorp', 'nail salon Krugersdorp', 'beauty salon Krugersdorp'],
      },

      // East Rand
      {
        slug: 'benoni',
        name: 'Benoni',
        province: 'Gauteng',
        description: 'Find salons in Benoni. Book at hair salons, nail studios, spas, and barbershops in the East Rand.',
        keywords: ['hair salon near me Benoni', 'nail salon Benoni', 'spa Benoni', 'beauty salon Benoni'],
      },
      {
        slug: 'boksburg',
        name: 'Boksburg',
        province: 'Gauteng',
        description: 'Discover salons in Boksburg. Book at hair salons, nail studios, and beauty centers in East Rand.',
        keywords: ['hair salon near me Boksburg', 'nail salon Boksburg', 'beauty salon Boksburg'],
      },
      {
        slug: 'germiston',
        name: 'Germiston',
        province: 'Gauteng',
        description: 'Find salons in Germiston. Book at hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Germiston', 'nail salon Germiston', 'beauty salon Germiston'],
      },
      {
        slug: 'springs',
        name: 'Springs',
        province: 'Gauteng',
        description: 'Discover salons in Springs. Book at hair salons, nail studios, and beauty professionals.',
        keywords: ['hair salon near me Springs', 'nail salon Springs', 'beauty salon Springs'],
      },
      {
        slug: 'alberton',
        name: 'Alberton',
        province: 'Gauteng',
        description: 'Find salons in Alberton. Book at hair salons, nail studios, and spas.',
        keywords: ['hair salon near me Alberton', 'nail salon Alberton', 'spa Alberton', 'beauty salon Alberton'],
      },
      {
        slug: 'edenvale',
        name: 'Edenvale',
        province: 'Gauteng',
        description: 'Discover salons in Edenvale. Book at hair salons, nail studios, and beauty centers near OR Tambo.',
        keywords: ['hair salon near me Edenvale', 'nail salon Edenvale', 'beauty salon Edenvale'],
      },
      {
        slug: 'kempton-park',
        name: 'Kempton Park',
        province: 'Gauteng',
        description: 'Find salons in Kempton Park. Book at hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Kempton Park', 'nail salon Kempton Park', 'beauty salon Kempton Park'],
      },

      // Vaal Triangle
      {
        slug: 'vanderbijlpark',
        name: 'Vanderbijlpark',
        province: 'Gauteng',
        description: 'Find salons in Vanderbijlpark. Book at hair salons, nail studios, and beauty professionals in the Vaal Triangle.',
        keywords: ['hair salon near me Vanderbijlpark', 'nail salon Vanderbijlpark', 'beauty salon Vanderbijlpark'],
      },
      {
        slug: 'vereeniging',
        name: 'Vereeniging',
        province: 'Gauteng',
        description: 'Discover salons in Vereeniging. Book at hair salons, nail studios, and barbershops in the Vaal.',
        keywords: ['hair salon near me Vereeniging', 'nail salon Vereeniging', 'beauty salon Vereeniging'],
      },

      // Tshwane/Pretoria Areas
      {
        slug: 'centurion',
        name: 'Centurion',
        province: 'Gauteng',
        description: 'Find top salons in Centurion. Book at premium hair salons, nail studios, spas, and beauty centers.',
        keywords: ['hair salon near me Centurion', 'nail salon Centurion', 'spa near me Centurion', 'beauty salon Centurion'],
      },
      {
        slug: 'mamelodi',
        name: 'Mamelodi',
        province: 'Gauteng',
        description: 'Discover salons in Mamelodi. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon near me Mamelodi', 'beauty salon Mamelodi', 'nail salon Mamelodi', 'barbershop Mamelodi'],
      },
      {
        slug: 'atteridgeville',
        name: 'Atteridgeville',
        province: 'Gauteng',
        description: 'Find salons in Atteridgeville. Book at hair salons, nail studios, and beauty professionals.',
        keywords: ['hair salon near me Atteridgeville', 'beauty salon Atteridgeville', 'nail salon Atteridgeville'],
      },
      {
        slug: 'soshanguve',
        name: 'Soshanguve',
        province: 'Gauteng',
        description: 'Discover salons in Soshanguve. Book at local hair salons and barbershops.',
        keywords: ['hair salon near me Soshanguve', 'beauty salon Soshanguve', 'barbershop Soshanguve'],
      },

      // Upmarket Areas
      {
        slug: 'rosebank',
        name: 'Rosebank',
        province: 'Gauteng',
        description: 'Find premium salons in Rosebank. Book at top hair salons, nail studios, and spas.',
        keywords: ['hair salon near me Rosebank', 'nail salon Rosebank', 'spa Rosebank', 'luxury salon Rosebank'],
      },
      {
        slug: 'melrose',
        name: 'Melrose',
        province: 'Gauteng',
        description: 'Discover upscale salons in Melrose. Book at premium hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon near me Melrose', 'nail salon Melrose', 'beauty salon Melrose'],
      },
      {
        slug: 'hyde-park',
        name: 'Hyde Park',
        province: 'Gauteng',
        description: 'Find luxury salons in Hyde Park. Book at exclusive hair salons, nail studios, and spas.',
        keywords: ['luxury spa near me Hyde Park', 'hair salon Hyde Park', 'nail salon Hyde Park'],
      },
      {
        slug: 'bryanston',
        name: 'Bryanston',
        province: 'Gauteng',
        description: 'Discover premium salons in Bryanston. Book at top hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon near me Bryanston', 'nail salon Bryanston', 'beauty salon Bryanston'],
      },
    ],
  },
  'western-cape': {
    slug: 'western-cape',
    name: 'Western Cape',
    description: 'Discover premier salons, spas, and beauty services in the Western Cape. Book appointments at top-rated establishments in Cape Town, Stellenbosch, and the Garden Route.',
    keywords: ['Western Cape salons', 'Cape Town beauty', 'Cape Town hair salon', 'Western Cape spa', 'Cape Town nail salon'],
    cities: [
      {
        slug: 'cape-town',
        name: 'Cape Town',
        province: 'Western Cape',
        description: 'Explore the best salons and beauty professionals in Cape Town. Book at top-rated hair salons, nail studios, spas, and wellness centers in the Mother City.',
        keywords: ['Cape Town salons', 'Cape Town hair salon', 'Cape Town spa', 'Cape Town nail salon', 'Cape Town beauty', 'V&A Waterfront salon'],
        popularAreas: ['V&A Waterfront', 'City Bowl', 'Sea Point', 'Camps Bay', 'Constantia', 'Claremont'],
      },
      {
        slug: 'stellenbosch',
        name: 'Stellenbosch',
        province: 'Western Cape',
        description: 'Find quality salons in Stellenbosch. Book appointments at trusted hair salons, nail studios, and beauty centers in the Winelands.',
        keywords: ['Stellenbosch salons', 'Stellenbosch hair salon', 'Stellenbosch beauty', 'Winelands salon'],
      },
      {
        slug: 'somerset-west',
        name: 'Somerset West',
        province: 'Western Cape',
        description: 'Discover salons in Somerset West. Book at local hair salons, nail studios, and beauty professionals in the Helderberg area.',
        keywords: ['Somerset West salons', 'Somerset West hair salon', 'Helderberg beauty', 'Somerset West spa'],
      },
    ],
  },
  'kwazulu-natal': {
    slug: 'kwazulu-natal',
    name: 'KwaZulu-Natal',
    description: 'Find exceptional salons and beauty professionals in KwaZulu-Natal. Book services at top hair salons, nail salons, and spas in Durban, Pietermaritzburg, and the North Coast.',
    keywords: ['KwaZulu-Natal salons', 'Durban hair salon', 'Durban beauty salon', 'KZN spa', 'Durban nail salon'],
    cities: [
      {
        slug: 'durban',
        name: 'Durban',
        province: 'KwaZulu-Natal',
        description: 'Discover top salons and beauty services in Durban. Book appointments at the best hair salons, nail studios, spas, and barbershops in Durban and surrounding areas.',
        keywords: ['Durban salons', 'Durban hair salon', 'Durban spa', 'Durban nail salon', 'Durban beauty', 'Umhlanga salons'],
        popularAreas: ['Umhlanga', 'Durban North', 'Westville', 'Gateway', 'Morningside'],
      },
      {
        slug: 'pietermaritzburg',
        name: 'Pietermaritzburg',
        province: 'KwaZulu-Natal',
        description: 'Find quality salons in Pietermaritzburg. Book at trusted hair salons, nail studios, and beauty centers in the capital city of KZN.',
        keywords: ['Pietermaritzburg salons', 'PMB hair salon', 'Pietermaritzburg beauty', 'PMB spa'],
      },
    ],
  },
  'eastern-cape': {
    slug: 'eastern-cape',
    name: 'Eastern Cape',
    description: 'Find top salons and beauty professionals in the Eastern Cape. Book appointments in Gqeberha (Port Elizabeth), East London, and surrounding areas.',
    keywords: ['Eastern Cape salons', 'Port Elizabeth hair salon', 'East London beauty salon', 'Gqeberha spa'],
    cities: [
      {
        slug: 'gqeberha',
        name: 'Gqeberha (Port Elizabeth)',
        province: 'Eastern Cape',
        description: 'Discover salons in Gqeberha. Book at top hair salons, nail studios, and spas in the Friendly City.',
        keywords: ['hair salon Gqeberha', 'Port Elizabeth beauty salon', 'nail salon PE', 'spa Gqeberha'],
      },
      {
        slug: 'east-london',
        name: 'East London',
        province: 'Eastern Cape',
        description: 'Find quality salons in East London. Book at trusted hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon East London', 'nail salon East London', 'beauty salon East London'],
      },
    ],
  },
  'free-state': {
    slug: 'free-state',
    name: 'Free State',
    description: 'Discover salons and beauty services in the Free State. Book appointments in Bloemfontein, Welkom, and Sasolburg.',
    keywords: ['Free State salons', 'Bloemfontein hair salon', 'Welkom beauty salon', 'Free State spa'],
    cities: [
      {
        slug: 'bloemfontein',
        name: 'Bloemfontein',
        province: 'Free State',
        description: 'Find top salons in Bloemfontein. Book at hair salons, nail studios, and spas in the City of Roses.',
        keywords: ['hair salon Bloemfontein', 'nail salon Bloemfontein', 'beauty salon Bloemfontein', 'spa Bloemfontein'],
      },
      {
        slug: 'welkom',
        name: 'Welkom',
        province: 'Free State',
        description: 'Discover salons in Welkom. Book at local hair salons, nail studios, and barbershops.',
        keywords: ['hair salon Welkom', 'nail salon Welkom', 'beauty salon Welkom'],
      },
    ],
  },
  'limpopo': {
    slug: 'limpopo',
    name: 'Limpopo',
    description: 'Find beauty professionals in Limpopo. Book appointments in Polokwane, Tzaneen, and Thohoyandou.',
    keywords: ['Limpopo salons', 'Polokwane hair salon', 'Limpopo beauty', 'Polokwane spa'],
    cities: [
      {
        slug: 'polokwane',
        name: 'Polokwane',
        province: 'Limpopo',
        description: 'Discover salons in Polokwane. Book at top hair salons, nail studios, and beauty centers.',
        keywords: ['hair salon Polokwane', 'nail salon Polokwane', 'beauty salon Polokwane'],
      },
      {
        slug: 'tzaneen',
        name: 'Tzaneen',
        province: 'Limpopo',
        description: 'Find salons in Tzaneen. Book at local hair salons and beauty professionals.',
        keywords: ['hair salon Tzaneen', 'beauty salon Tzaneen'],
      },
    ],
  },
  'mpumalanga': {
    slug: 'mpumalanga',
    name: 'Mpumalanga',
    description: 'Discover beauty services in Mpumalanga. Book appointments in Mbombela (Nelspruit), Witbank, and surrounding areas.',
    keywords: ['Mpumalanga salons', 'Nelspruit hair salon', 'Mbombela beauty salon', 'Witbank spa'],
    cities: [
      {
        slug: 'mbombela',
        name: 'Mbombela (Nelspruit)',
        province: 'Mpumalanga',
        description: 'Find top salons in Mbombela. Book at hair salons, nail studios, and spas in the Lowveld.',
        keywords: ['hair salon Nelspruit', 'beauty salon Mbombela', 'nail salon Nelspruit'],
      },
      {
        slug: 'witbank',
        name: 'Witbank (Emalahleni)',
        province: 'Mpumalanga',
        description: 'Discover salons in Witbank. Book at local hair salons and beauty professionals.',
        keywords: ['hair salon Witbank', 'nail salon Witbank', 'beauty salon Emalahleni'],
      },
    ],
  },
  'north-west': {
    slug: 'north-west',
    name: 'North West',
    description: 'Find salons and beauty professionals in North West. Book appointments in Rustenburg, Potchefstroom, and Klerksdorp.',
    keywords: ['North West salons', 'Rustenburg hair salon', 'Potchefstroom beauty salon', 'North West spa'],
    cities: [
      {
        slug: 'rustenburg',
        name: 'Rustenburg',
        province: 'North West',
        description: 'Find top salons in Rustenburg. Book at hair salons, nail studios, and spas in the Platinum City.',
        keywords: ['hair salon Rustenburg', 'nail salon Rustenburg', 'beauty salon Rustenburg'],
      },
      {
        slug: 'potchefstroom',
        name: 'Potchefstroom',
        province: 'North West',
        description: 'Discover salons in Potchefstroom. Book at local hair salons and beauty centers.',
        keywords: ['hair salon Potchefstroom', 'nail salon Potchefstroom', 'beauty salon Potchefstroom'],
      },
    ],
  },
  'northern-cape': {
    slug: 'northern-cape',
    name: 'Northern Cape',
    description: 'Discover beauty services in the Northern Cape. Book appointments in Kimberley, Upington, and surrounding areas.',
    keywords: ['Northern Cape salons', 'Kimberley hair salon', 'Upington beauty salon', 'Northern Cape spa'],
    cities: [
      {
        slug: 'kimberley',
        name: 'Kimberley',
        province: 'Northern Cape',
        description: 'Find top salons in Kimberley. Book at hair salons, nail studios, and spas in the Diamond City.',
        keywords: ['hair salon Kimberley', 'nail salon Kimberley', 'beauty salon Kimberley'],
      },
      {
        slug: 'upington',
        name: 'Upington',
        province: 'Northern Cape',
        description: 'Discover salons in Upington. Book at local hair salons and beauty professionals.',
        keywords: ['hair salon Upington', 'beauty salon Upington'],
      },
    ],
  },
};

// Helper function to get all cities across all provinces
export function getAllCities(): CityInfo[] {
  return Object.values(PROVINCES).flatMap(province => province.cities);
}

// Helper function to get cities by province slug
export function getCitiesByProvince(provinceSlug: string): CityInfo[] {
  return PROVINCES[provinceSlug]?.cities || [];
}

// Helper function to get city info
export function getCityInfo(provinceSlug: string, citySlug: string): CityInfo | null {
  const province = PROVINCES[provinceSlug];
  if (!province) return null;

  return province.cities.find(city => city.slug === citySlug) || null;
}

// Helper function to get province info
export function getProvinceInfo(provinceSlug: string): ProvinceInfo | null {
  return PROVINCES[provinceSlug] || null;
}

// Generate URL-friendly slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
