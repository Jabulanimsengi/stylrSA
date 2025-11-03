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
      {
        slug: 'johannesburg',
        name: 'Johannesburg',
        province: 'Gauteng',
        description: 'Discover premium salons and beauty services in Johannesburg. Book appointments at top-rated hair salons, nail studios, spas, and barbershops in the heart of Jozi.',
        keywords: ['Johannesburg salons', 'Jozi hair salon', 'Johannesburg spa', 'Johannesburg nail salon', 'Johannesburg beauty salon', 'Johannesburg barbershop'],
        popularAreas: ['Sandton', 'Rosebank', 'Fourways', 'Midrand', 'Randburg', 'Bryanston'],
      },
      {
        slug: 'sandton',
        name: 'Sandton',
        province: 'Gauteng',
        description: 'Find luxury salons and premium beauty services in Sandton. Book at the finest hair salons, nail studios, spas, and wellness centers in Sandton City and surrounding areas.',
        keywords: ['Sandton salons', 'Sandton hair salon', 'Sandton spa', 'Sandton nail salon', 'Sandton beauty services', 'luxury salon Sandton'],
      },
      {
        slug: 'pretoria',
        name: 'Pretoria',
        province: 'Gauteng',
        description: 'Explore top salons and beauty professionals in Pretoria. Book appointments at the best hair salons, nail salons, spas, and barbershops in Tshwane.',
        keywords: ['Pretoria salons', 'Tshwane hair salon', 'Pretoria spa', 'Pretoria nail salon', 'Pretoria beauty salon', 'Centurion salons'],
        popularAreas: ['Centurion', 'Hatfield', 'Menlyn', 'Brooklyn', 'Waterkloof'],
      },
      {
        slug: 'soweto',
        name: 'Soweto',
        province: 'Gauteng',
        description: 'Find quality salons and beauty services in Soweto. Book appointments at trusted hair salons, nail studios, and barbershops serving the Soweto community.',
        keywords: ['Soweto salons', 'Soweto hair salon', 'Soweto beauty', 'Soweto barbershop', 'Soweto braiding salon'],
      },
      {
        slug: 'katlehong',
        name: 'Katlehong',
        province: 'Gauteng',
        description: 'Discover local salons and beauty professionals in Katlehong. Book at trusted hair salons, nail studios, and barbershops in the East Rand.',
        keywords: ['Katlehong salons', 'Katlehong hair salon', 'Katlehong beauty', 'East Rand salons', 'Katlehong barbershop'],
      },
      {
        slug: 'fourways',
        name: 'Fourways',
        province: 'Gauteng',
        description: 'Find premium salons in Fourways. Book at top hair salons, nail studios, spas, and beauty centers in Fourways and surrounding areas.',
        keywords: ['Fourways salons', 'Fourways hair salon', 'Fourways spa', 'Fourways beauty', 'Fourways nail salon'],
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
