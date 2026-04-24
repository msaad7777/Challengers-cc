export type PartnerTier =
  | 'Title Sponsor'
  | 'Platinum Sponsor'
  | 'Gold Sponsor'
  | 'Community Partner'
  | 'Coaching Partner'
  | 'Official Partner';

export interface OrderLink {
  label: string;
  url: string;
}

export interface HoursRow {
  days: string;
  time: string;
}

export interface Partner {
  slug: string;
  name: string;
  tier: PartnerTier;
  category: string;
  tagline?: string;
  description: string;
  location: string;

  // Contact
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;

  // Restaurant-specific
  orderOnline?: OrderLink[];
  reservations?: string;
  menu?: string;
  hours?: HoursRow[];
  signatureItems?: string[];

  // Service-specific
  services?: string[];
  priceRange?: string;

  // Media
  logo?: string;
  heroImage?: string;
  video?: string;

  // Cross-links
  blogSlug?: string;

  // Optional custom copy
  whyPartnership?: string;
  matchDayNote?: string;
  testimonial?: { quote: string; attribution: string };
}

export const partners: Partner[] = [
  {
    slug: 'curry-culture-bistro',
    name: 'Curry Culture Bistro',
    tier: 'Community Partner',
    category: 'Authentic Indian Cuisine',
    tagline: 'A definite stop on every Challengers road trip through Kitchener.',
    description: `Curry Culture Bistro brings authentic North Indian cuisine and Indo-Chinese favourites to Kitchener-Waterloo in a modern, welcoming bistro setting. Traditional spices, fresh ingredients, warm hospitality — every dish reflects the depth and warmth of Indian cuisine, the kind of meal that brings people together long after the game has ended.`,
    location: 'Kitchener, ON',
    address: '29 King St E #5, Kitchener, ON N2G 2K4',
    phone: '(548) 889-5779',
    email: 'info@curryculturebistro.ca',
    website: 'https://curryculturebistro.ca/',
    instagram: '@curryculturebistro',
    whatsapp: 'https://wa.me/+13653247672',
    orderOnline: [
      { label: 'Order on DoorDash', url: 'https://www.doordash.com/store/curry-culture-bistro-kitchener-38341209/' },
      { label: 'Order Online Direct', url: 'https://order.online/store/-38341209/' },
    ],
    reservations: 'tel:+15488895779',
    menu: 'https://curryculturebistro.ca/our-menu/',
    hours: [
      { days: 'Monday – Saturday', time: '7:30 AM – 4:00 AM' },
      { days: 'Sunday', time: '10:00 AM – 12:00 AM' },
    ],
    signatureItems: [
      'Butter Chicken',
      'Dal Makhani',
      'Paneer Tikka Masala',
      'Hyderabadi Dum Biryani',
      'Chole Bhatura',
      'Pani Puri · Samosa Chaat · Pav Bhaji',
      'Indo-Chinese · Hakka Noodles · Manchurian',
    ],
    logo: '/curry-culture-logo.webp',
    heroImage: '/curry-culture-sponsor.png',
    video: '/videos/curry-culture-sponsor.mp4',
    blogSlug: 'curry-culture-community-partner',
    matchDayNote:
      "Open until 4 AM Monday–Saturday — perfect for teams heading home late from matches across Ontario. Travelling to or from Kitchener for a match? This is your stop.",
    testimonial: {
      quote:
        'Food brings people together, and so does cricket. We are proud to support Challengers Cricket Club and the inclusive, growing community they are building across Ontario.',
      attribution: 'Curry Culture Bistro, Kitchener',
    },
  },
];

export function getPartnerBySlug(slug: string): Partner | undefined {
  return partners.find((p) => p.slug === slug);
}

export function getAllPartnerSlugs(): string[] {
  return partners.map((p) => p.slug);
}
