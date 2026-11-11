export type Room = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  size: string;
  guests: number;
  bed: string;
  image: string;
  features: string[];
  popular?: boolean;
};

export type HotelOffer = {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
  code: string;
};

export const rooms: Room[] = [
  {
    id: "rose-deluxe",
    name: "Deluxe Garden Room",
    category: "Deluxe",
    description:
      "A calming retreat with natural textures, soft lighting, and views across the hotel gardens.",
    price: 6500,
    rating: 4.9,
    size: "42 m²",
    guests: 2,
    bed: "King Bed",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
    features: ["Garden View", "Rain Shower", "Smart TV"],
    popular: true,
  },
  {
    id: "aurelia-suite",
    name: "Aurelia Suite",
    category: "Suite",
    description:
      "An expansive suite combining contemporary design, a separate living area, and panoramic city views.",
    price: 12000,
    rating: 5,
    size: "68 m²",
    guests: 3,
    bed: "King Bed",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
    features: ["City View", "Living Room", "Bathtub"],
  },
  {
    id: "signature-suite",
    name: "Signature Residence",
    category: "Premium Suite",
    description:
      "Our signature stay with generous space, refined furnishings, and an atmosphere made for slow mornings.",
    price: 18000,
    rating: 5,
    size: "96 m²",
    guests: 4,
    bed: "King + Sofa Bed",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    features: ["Panoramic View", "Private Lounge", "Premium Bath"],
  },
];

export const offers: HotelOffer[] = [
  {
    id: "stay-longer",
    title: "Stay a Little Longer",
    description:
      "Stay three nights or more and enjoy a complimentary breakfast experience.",
    discount: "15% OFF",
    code: "VELORA15",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "weekend-escape",
    title: "The Weekend Escape",
    description:
      "A curated weekend stay with breakfast, late checkout, and a welcome drink.",
    discount: "PACKAGE",
    code: "WEEKEND",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  },
];

export const experiences = [
  {
    title: "Signature Dining",
    description:
      "Seasonal cuisine, thoughtful cocktails, and intimate dining spaces.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Wellness & Spa",
    description:
      "Restore your rhythm with treatments, quiet spaces, and mindful rituals.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Poolside Moments",
    description:
      "Take a slower approach to the day beside our tranquil pool.",
    image:
      "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1000&q=85",
  },
];

export const testimonials = [
  {
    name: "Sophia Martin",
    location: "Paris, France",
    rating: 5,
    text: "Beautifully designed, incredibly comfortable, and the service felt genuinely personal.",
  },
  {
    name: "Daniel Cooper",
    location: "London, UK",
    rating: 5,
    text: "The kind of hotel where every detail feels considered. We extended our stay by two nights.",
  },
  {
    name: "Aisha Rahman",
    location: "Dhaka, Bangladesh",
    rating: 5,
    text: "The room was stunning and the breakfast experience was exceptional. Absolutely loved the atmosphere.",
  },
];

export const faqs = [
  {
    question: "What time is check-in and check-out?",
    answer:
      "Check-in begins at 3:00 PM and check-out is at 12:00 PM. Early check-in and late check-out may be available depending on occupancy.",
  },
  {
    question: "Can I cancel my reservation?",
    answer:
      "Cancellation policies vary by rate and room type. Your specific cancellation terms will be displayed before you confirm your booking.",
  },
  {
    question: "Do you offer airport transportation?",
    answer:
      "Yes. Private airport transfers can be arranged through our guest services team.",
  },
  {
    question: "Is breakfast included?",
    answer:
      "Breakfast is included with selected rates and packages. You will see the exact inclusions when choosing your room.",
  },
];