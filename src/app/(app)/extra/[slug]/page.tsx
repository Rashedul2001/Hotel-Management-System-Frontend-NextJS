'use client'
import React, { useState, useMemo } from 'react';
import {
    Building2,
    ConciergeBell,
    UtensilsCrossed,
    Compass,
    HelpCircle,
    FileText,
    ShieldCheck,
    Search,
    Sparkles,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
    Star,
    CheckCircle2,
    ExternalLink,
    X,
    Filter,
    Car,
    Wifi,
    Sparkle,
    Waves,
    Shirt,
    ShieldAlert,
    Users,
    Award,
    HeartHandshake,
    GlassWater,
    Utensils,
    Coffee,
    ChevronRight,
    Check,
    ArrowRight,
    Info
} from 'lucide-react';
import { useParams } from 'next/navigation';


// --- DATA DEFINITIONS ---

const HOTEL_STATS = [
    { label: 'Luxury Suites & Villas', value: '250+', icon: Building2 },
    { label: 'Guest Satisfaction Rating', value: '4.95 / 5', icon: Star },
    { label: 'International Hospitality Awards', value: '18', icon: Award },
    { label: 'Years of Excellence', value: '25', icon: HeartHandshake }
];

const LEADERSHIP_TEAM = [
    { name: 'Elena Vance', role: 'General Manager', experience: '18+ yrs Luxury Hospitality', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
    { name: 'Chef Jean-Luc Moreau', role: 'Executive Culinary Director', experience: '3 Michelin Stars', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Marcus Thorne', role: 'Head Concierge (Les Clefs d\'Or)', experience: '15 yrs Velora Service', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' }
];

const SERVICES_DIRECTORY = [
    {
        id: 'concierge',
        title: 'Les Clefs d\'Or Concierge',
        category: 'Guest Relations',
        description: '24/7 dedicated assistance for bespoke tour itineraries, priority reservations, transport arrangements, and personal guest requests.',
        hours: '24 Hours / 7 Days',
        location: 'Main Lobby Level 1',
        icon: ConciergeBell,
        status: 'Available 24/7',
        badge: 'Signature'
    },
    {
        id: 'chauffeur',
        title: 'Valet & Luxury Chauffeur',
        category: 'Transportation',
        description: 'Private transfer fleet featuring Mercedes Maybach and Rolls Royce Phantom with professional uniformed chauffeurs.',
        hours: '05:00 - 23:30 Daily',
        location: 'Porte-Cochère Front Entrance',
        icon: Car,
        status: 'On Demand',
        badge: 'Premium'
    },
    {
        id: 'spa',
        title: 'Aura Infinity Pool & Spa',
        category: 'Wellness',
        description: 'Rooftop temperature-controlled infinity pool, hydrotherapy jet circuits, private sauna suites, and bespoke spa treatments.',
        hours: '06:00 - 22:00 Daily',
        location: 'Level 24 Rooftop',
        icon: Waves,
        status: 'Open Now',
        badge: 'Wellness'
    },
    {
        id: 'dining-room',
        title: 'In-Suite Fine Dining Room Service',
        category: 'In-Room',
        description: 'Chef-crafted artisanal breakfasts, midnight gourmet menus, and private sommelier pairing delivered directly to your suite.',
        hours: '24 Hours Daily',
        location: 'In-Suite Service',
        icon: Utensils,
        status: 'Available 24/7',
        badge: 'Gourmet'
    },
    {
        id: 'dry-cleaning',
        title: 'Express Laundry & Valet Pressing',
        category: 'Housekeeping',
        description: 'Same-day eco-friendly dry cleaning, silk pressing, and garment restoration with complimentary morning delivery.',
        hours: '07:00 - 20:00 Daily',
        location: 'Concierge Desk Pickup',
        icon: Shirt,
        status: 'Express Available',
        badge: 'Valet'
    },
    {
        id: 'business',
        title: 'Velora Executive Fiber & Business Hub',
        category: 'Business',
        description: 'Ultra-high-speed multi-gigabit Wi-Fi, private soundproof conference pods, secretarial assistance, and printing facilities.',
        hours: '06:00 - 23:00 Daily',
        location: 'Level 3 Executive Lounge',
        icon: Wifi,
        status: 'Open Now',
        badge: 'Corporate'
    }
];

const DINING_VENUES = [
    {
        id: 'letoile',
        name: 'L\'Étoile Fine Dining',
        tagline: 'Modern French Gastronomy & Wine Library',
        description: 'An elevated multi-course culinary experience showcasing seasonal organic produce, rare truffles, and a 1,200-bottle wine cellar curated by Master Sommelier Paul Laurent.',
        cuisine: 'French Contemporary',
        dressCode: 'Formal / Elegantly Attired',
        hours: 'Dinner: 18:00 - 23:00 (Wed - Sun)',
        rating: 4.9,
        chef: 'Jean-Luc Moreau',
        image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800',
        featuredDishes: ['A5 Wagyu Beef Tenderloin', 'Brittany Blue Lobster Bisque', 'Black Winter Truffle Soufflé']
    },
    {
        id: 'sky-lounge',
        name: 'The Sky Lounge & Mixology Bar',
        tagline: 'Panoramic Horizon Views & Craft Cocktails',
        description: 'Perched on the 25th floor, offering handcrafted botanical cocktails, rare Japanese whiskeys, micro-tapas, and live jazz trio performances every evening.',
        cuisine: 'Cocktails & Tapas',
        dressCode: 'Smart Casual',
        hours: '16:00 - 02:00 Daily',
        rating: 4.8,
        chef: 'Mixologist Mia Zhang',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
        featuredDishes: ['Velora Smoked Old Fashioned', 'Caviar Blinis & Cream', 'Charred Octopus Skewers']
    },
    {
        id: 'poolside-bistro',
        name: 'Velora Poolside Bistro & Garden',
        tagline: 'Al-Fresco Mediterranean Dining',
        description: 'Sun-drenched relaxed dining featuring wood-fired Neapolitan pizzas, fresh coastal seafood, organic superfood salads, and cold-pressed juices.',
        cuisine: 'Mediterranean Al-Fresco',
        dressCode: 'Resort Casual',
        hours: '08:00 - 20:00 Daily',
        rating: 4.7,
        chef: 'Marco Rossi',
        image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=800',
        featuredDishes: ['Wood-Fired Burrata Pizza', 'Grilled Sea Bass Skewer', 'Chilled Watermelon & Feta']
    }
];

const CURATED_EXPERIENCES = [
    {
        id: 'yacht',
        title: 'Private Riviera Yacht Charter',
        category: 'VIP Luxury',
        duration: '4 - 8 Hours',
        price: '৳28,000',
        priceSubtitle: 'per private charter (up to 8 guests)',
        image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=800',
        description: 'Set sail aboard our private 70ft luxury yacht. Includes personal captain, gourmet champagne lunch, snorkeling gear, and sunset coastal cruise.',
        highlights: ['Captain & Crew Included', 'Veuve Clicquot Champagne & Tapas', 'Secluded Cove Swimming Stop']
    },
    {
        id: 'helipad',
        title: 'Skyline Helipad City & Coastal Tour',
        category: 'Adventure',
        duration: '45 Minutes',
        price: '৳9,500',
        priceSubtitle: 'per couple',
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
        description: 'Experience breathless aerial views of the metropolis and coastline with a VIP helicopter takeoff directly from Velora Roof Helipad.',
        highlights: ['Direct Rooftop Liftoff', 'Commemorative Photo Package', 'Champagne Toast Upon Landing']
    },
    {
        id: 'wine-tasting',
        title: 'Exclusive Sommelier Cellar Reserve Tasting',
        category: 'Gastronomy',
        duration: '2.5 Hours',
        price: '৳3,800',
        priceSubtitle: 'per guest',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800',
        description: 'A private journey through Velora\'s underground vault featuring rare vintage Grand Crus paired with artisanal European cheeses and cured meats.',
        highlights: ['6 Vintage Rare Pairings', 'Hosted by Master Sommelier', 'Private Vault Access']
    },
    {
        id: 'spa-retreat',
        title: 'Aura Total Harmony Wellness Day',
        category: 'Wellness',
        duration: '3.5 Hours',
        price: '৳5,200',
        priceSubtitle: 'per guest',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
        description: 'Rejuvenate body and spirit with a bespoke full-body hot stone massage, radiant hydration facial, hydro-soak, and organic herbal tea ceremony.',
        highlights: ['Customized Aromatherapy Massage', 'Hydra-Facial Treatment', 'Full Day Spa Lounge Access']
    }
];

const FAQ_CATEGORIES = [
    { id: 'all', label: 'All Questions' },
    { id: 'checkin', label: 'Check-In & Check-Out' },
    { id: 'reservations', label: 'Bookings & Cancellations' },
    { id: 'amenities', label: 'Hotel Amenities & Services' },
    { id: 'special', label: 'Special Requests & Pets' }
];

const FAQ_ITEMS = [
    {
        id: 1,
        category: 'checkin',
        question: 'What are the standard Check-In and Check-Out times at Velora Hotels & Suites?',
        answer: 'Standard check-in time commences at 15:00 (3:00 PM), and check-out is required by 12:00 (12:00 PM Midday). Early check-in or late check-out can be requested via our Les Clefs d\'Or Concierge and is subject to room availability.'
    },
    {
        id: 2,
        category: 'checkin',
        question: 'Is a minimum age required at check-in?',
        answer: 'Yes, primary registered guests must be at least 18 years of age with valid government-issued photo identification and a major credit card for security hold.'
    },
    {
        id: 3,
        category: 'reservations',
        question: 'What is the standard cancellation policy for suite bookings?',
        answer: 'For standard flexible rate reservations, cancellations made up to 48 hours prior to local arrival time (15:00) incur no charge. Cancellations within 48 hours or no-shows are subject to a penalty equal to one night\'s room rate plus tax. Special promotional or non-refundable rates retain specific terms disclosed during booking.'
    },
    {
        id: 4,
        category: 'reservations',
        question: 'Does Velora require a security deposit upon check-in?',
        answer: 'Yes, a temporary authorization hold of ৳15,000 per night is placed on your card upon check-in to cover potential incidental charges. Any unused hold balance is released automatically upon check-out.'
    },
    {
        id: 5,
        category: 'amenities',
        question: 'Is valet parking available on-site and what are the fees?',
        answer: 'Overnight secure valet parking is available at ৳1,500 per vehicle per night with unlimited in/out privileges. Electric vehicle charging stations (including Tesla Superchargers) are complimentary for staying guests.'
    },
    {
        id: 6,
        category: 'amenities',
        question: 'Does the hotel provide airport transfers?',
        answer: 'Yes, private luxury transfer services (Mercedes S-Class or Maybach) can be reserved through our Concierge team at least 12 hours in advance for seamless pickup from local international airports.'
    },
    {
        id: 7,
        category: 'special',
        question: 'Are pets permitted at Velora Hotels & Suites?',
        answer: 'We welcome dogs up to 25 lbs (11 kg) in designated pet-friendly suites. A one-time deep cleaning fee of ৳5,000 per stay applies, which includes plush dog beds, organic treats, and custom dining bowls.'
    },
    {
        id: 8,
        category: 'special',
        question: 'Can I request dietary options at hotel restaurants?',
        answer: 'Absolutely. All our restaurants and room service offer curated vegan, gluten-free, halal, and allergy-sensitive dining options. Please notify us prior to arrival or inform your server upon seating.'
    }
];


export default function App() {
    const params = useParams();
    const goto = typeof params.slug === 'string' ? decodeURIComponent(params.slug) : 'about';

    const [activeTab, setActiveTab] = useState(goto);
    const [serviceFilter, setServiceFilter] = useState('All');
    const [faqCategory, setFaqCategory] = useState('all');
    const [faqSearch, setFaqSearch] = useState('');
    const [openFaqId, setOpenFaqId] = useState(1);

    // Modals state
    const [diningModalOpen, setDiningModalOpen] = useState(false);
    const [selectedDining, setSelectedDining] = useState(DINING_VENUES[0]);
    const [expModalOpen, setExpModalOpen] = useState(false);
    const [selectedExp, setSelectedExp] = useState(CURATED_EXPERIENCES[0]);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Form states
    const [reservationForm, setReservationForm] = useState({
        name: '',
        email: '',
        guests: '2',
        date: '2026-10-15',
        time: '19:00',
        specialRequests: ''
    });

    // Services filtering
    const filteredServices = useMemo(() => {
        if (serviceFilter === 'All') return SERVICES_DIRECTORY;
        return SERVICES_DIRECTORY.filter(s => s.category === serviceFilter);
    }, [serviceFilter]);

    // FAQ filtering
    const filteredFaqs = useMemo(() => {
        return FAQ_ITEMS.filter(faq => {
            const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
            const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [faqCategory, faqSearch]);

    const openDiningReservation = (venue: typeof DINING_VENUES[0]) => {
        setSelectedDining(venue);
        setBookingSuccess(false);
        setDiningModalOpen(true);
    };

    const openExpReservation = (exp: typeof CURATED_EXPERIENCES[0]) => {
        setSelectedExp(exp);
        setBookingSuccess(false);
        setExpModalOpen(true);
    };

    const handleReservationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setBookingSuccess(true);
        setTimeout(() => {
            // delay auto close
        }, 2000);
    };


    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">


            {/* --- MAIN HEADER NAV BAR --- */}
            <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* BRAND LOGO */}
                        <div
                            onClick={() => setActiveTab('about')}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                                    <span className="font-serif text-xl font-bold text-amber-400">V</span>
                                </div>
                            </div>
                            <div>
                                <span className="font-serif text-2xl font-semibold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors">
                                    VELORA
                                </span>
                                <span className="block text-[10px] tracking-[0.25em] text-amber-500/80 uppercase font-medium">
                                    Hotels & Suites
                                </span>
                            </div>
                        </div>

                        {/* DESKTOP ROUTE NAVIGATION TABS */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {[
                                { id: 'about', label: 'About Velora', icon: Building2 },
                                { id: 'services', label: 'Services', icon: ConciergeBell },
                                { id: 'dining', label: 'Dining', icon: UtensilsCrossed },
                                { id: 'experiences', label: 'Experiences', icon: Compass },
                                { id: 'faq', label: 'FAQs', icon: HelpCircle },
                                { id: 'terms', label: 'Terms', icon: FileText },
                                { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-900'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* QUICK BOOK DIRECT CTA BUTTON */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('dining')}
                                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-md shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform active:scale-95"
                            >
                                Reserve Table
                            </button>
                        </div>
                    </div>

                    {/* MOBILE NAVIGATION BAR (SCROLLABLE) */}
                    <div className="lg:hidden flex overflow-x-auto pb-3 gap-2 no-scrollbar border-t border-slate-800/60 pt-2">
                        {[
                            { id: 'about', label: 'About', icon: Building2 },
                            { id: 'services', label: 'Services', icon: ConciergeBell },
                            { id: 'dining', label: 'Dining', icon: UtensilsCrossed },
                            { id: 'experiences', label: 'Experiences', icon: Compass },
                            { id: 'faq', label: 'FAQs', icon: HelpCircle },
                            { id: 'terms', label: 'Terms', icon: FileText },
                            { id: 'privacy', label: 'Privacy', icon: ShieldCheck }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${isActive
                                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* --- CONTENT CONTAINER WITH ROUTED SECTIONS --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                { }
                {activeTab === 'about' && (
                    <div className="space-y-16 animate-fadeIn">
                        {/* HERO HERO SECTION */}
                        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                            <div className="absolute inset-0">
                                <img
                                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600"
                                    alt="Velora Luxury Suite Exterior"
                                    className="w-full h-full object-cover opacity-35"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                            </div>

                            <div className="relative max-w-3xl px-8 py-20 sm:p-16">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-6">
                                    <Sparkle className="w-3.5 h-3.5" />
                                    Established 2001
                                </div>
                                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                                    A Sanctuary of Timeless Luxury & Unrivaled Elegance
                                </h1>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                    Nestled in the heart of the coastal metropolis, Velora Hotels & Suites combines world-class architecture, Michelin-caliber gastronomy, and intuitive personalized hospitality designed for the discerning traveler.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => setActiveTab('services')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <span>Explore Guest Services</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('experiences')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
                                    >
                                        <span>Curated Experiences</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* KEY METRICS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {HOTEL_STATS.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center hover:border-amber-500/40 transition-all">
                                        <div className="inline-flex p-3 rounded-lg bg-amber-500/10 text-amber-400 mb-4">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="font-serif text-3xl sm:text-4xl font-bold text-white mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                                            {stat.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* BRAND STORY & PHILOSOPHY */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="text-amber-400 text-xs uppercase font-semibold tracking-widest">Our Philosophy</div>
                                <h2 className="font-serif text-3xl font-bold text-white">Crafting Unforgettable Moments with Intention</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    Founded on the belief that luxury is defined by attentiveness and seamless comfort, Velora has stood as a beacon of hospitality for over two decades. From bespoke suite aromas to customized culinary journeys, every touchpoint is curated to exceed expectations.
                                </p>
                                <div className="space-y-3 pt-2">
                                    {[
                                        '24/7 Butler Service for Penthouse & Reserve Suites',
                                        'Eco-Friendly Sustainable Luxury Operations & Zero Plastic',
                                        'Les Clefs d\'Or Certified Concierge Team',
                                        'Private Helipad Access & Valet Chauffeur Fleet'
                                    ].map((point, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-slate-200 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=600"
                                    alt="Luxury Suite Living Area"
                                    className="rounded-xl object-cover h-64 w-full border border-slate-800"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600"
                                    alt="Velora Luxury Hotel Pool"
                                    className="rounded-xl object-cover h-64 w-full border border-slate-800 mt-8"
                                />
                            </div>
                        </div>

                        {/* LEADERSHIP TEAM */}
                        <div className="space-y-8">
                            <div className="text-center max-w-2xl mx-auto space-y-2">
                                <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Excellence in Leadership</span>
                                <h2 className="font-serif text-3xl font-bold text-white">Meet Our Concierge & Culinary Masters</h2>
                                <p className="text-slate-400 text-sm">The dedicated professionals ensuring your stay is nothing short of extraordinary.</p>
                            </div>

                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {LEADERSHIP_TEAM.map((member, idx) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-amber-500/40 transition-all">
                                        <div className="h-64 overflow-hidden relative">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-serif text-xl font-bold text-white">{member.name}</h3>
                                            <p className="text-amber-400 text-xs font-medium mb-2">{member.role}</p>
                                            <p className="text-slate-400 text-xs">{member.experience}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                { }
                {activeTab === 'services' && (
                    <div className="space-y-10 animate-fadeIn">
                        {/* SERVICES HEADER */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                            <div>
                                <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Guest Amenities</span>
                                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">Interactive Hotel Services Directory</h1>
                                <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                                    Access 24/7 dedicated guest care, private transportation, dry cleaning, wellness facilities, and business hub conveniences.
                                </p>
                            </div>

                            {/* FILTER BUTTONS */}
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Guest Relations', 'Transportation', 'Wellness', 'In-Room', 'Housekeeping', 'Business'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setServiceFilter(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${serviceFilter === cat
                                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SERVICES GRID */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <div
                                        key={service.id}
                                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700">
                                                    {service.badge}
                                                </span>
                                            </div>

                                            <h3 className="font-serif text-xl font-bold text-white mb-2">{service.title}</h3>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                                {service.description}
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                                <span><strong>Hours:</strong> {service.hours}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                                <span><strong>Location:</strong> {service.location}</span>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                                    {service.status}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('faq');
                                                        setFaqCategory('amenities');
                                                    }}
                                                    className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 hover:underline"
                                                >
                                                    <span>Inquire Details</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                { }
                {activeTab === 'dining' && (
                    <div className="space-y-12 animate-fadeIn">
                        {/* DINING HEADER */}
                        <div className="text-center max-w-3xl mx-auto space-y-3">
                            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Culinary Masterpieces</span>
                            <h1 className="font-serif text-4xl font-bold text-white">Restaurants, Bars & Lounges</h1>
                            <p className="text-slate-400 text-sm">
                                Indulge in Michelin-recognized fine dining, crafted rooftop cocktails, and relaxed al-fresco Mediterranean cuisine.
                            </p>
                        </div>

                        {/* VENUES DISPLAY */}
                        <div className="space-y-10">
                            {DINING_VENUES.map((venue, index) => (
                                <div
                                    key={venue.id}
                                    className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden grid lg:grid-cols-12 gap-0 hover:border-amber-500/30 transition-all shadow-xl`}
                                >
                                    <div className={`lg:col-span-6 relative min-h-[300px] ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                                        <img
                                            src={venue.image}
                                            alt={venue.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-400 border border-slate-700 flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span>{venue.rating} / 5.0 Rating</span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
                                        <div>
                                            <div className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
                                                {venue.cuisine}
                                            </div>
                                            <h2 className="font-serif text-3xl font-bold text-white mb-2">{venue.name}</h2>
                                            <p className="text-slate-400 italic text-sm mb-4">{venue.tagline}</p>
                                            <p className="text-slate-300 text-sm leading-relaxed mb-6">{venue.description}</p>

                                            {/* FEATURED MENU PREVIEW */}
                                            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-6">
                                                <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2 flex items-center gap-1.5">
                                                    <Utensils className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Chef Highlights</span>
                                                </div>
                                                <ul className="grid sm:grid-cols-3 gap-2">
                                                    {venue.featuredDishes.map((dish, idx) => (
                                                        <li key={idx} className="text-xs text-slate-200 bg-slate-900 p-2 rounded border border-slate-800/80">
                                                            • {dish}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                            <div className="text-xs space-y-1 text-slate-400">
                                                <div><strong>Operating Hours:</strong> {venue.hours}</div>
                                                <div><strong>Dress Code:</strong> {venue.dressCode}</div>
                                            </div>

                                            <button
                                                onClick={() => openDiningReservation(venue)}
                                                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
                                            >
                                                Reserve Table
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                { }
                {activeTab === 'experiences' && (
                    <div className="space-y-12 animate-fadeIn">
                        {/* EXPERIENCES HEADER */}
                        <div className="text-center max-w-3xl mx-auto space-y-3">
                            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Tailored Excursions</span>
                            <h1 className="font-serif text-4xl font-bold text-white">Curated Luxury Experiences</h1>
                            <p className="text-slate-400 text-sm">
                                Elevate your resort stay with unique coastal yacht charters, private aerial city tours, and master-led tastings.
                            </p>
                        </div>

                        {/* EXPERIENCES GRID */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {CURATED_EXPERIENCES.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                                >
                                    <div>
                                        <div className="h-64 relative overflow-hidden">
                                            <img
                                                src={exp.image}
                                                alt={exp.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                            <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                {exp.category}
                                            </span>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-serif text-2xl font-bold text-white">{exp.title}</h3>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-amber-400 mb-4 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {exp.duration}
                                                </span>
                                                <span>•</span>
                                                <span className="text-slate-300">{exp.priceSubtitle}</span>
                                            </div>

                                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                                {exp.description}
                                            </p>

                                            <div className="space-y-2 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-2">Experience Highlights</span>
                                                {exp.highlights.map((h, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                                                        <Check className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>{h}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-auto">
                                        <div>
                                            <span className="text-xs text-slate-400 block">Starting From</span>
                                            <span className="font-serif text-2xl font-bold text-white">{exp.price}</span>
                                        </div>

                                        <button
                                            onClick={() => openExpReservation(exp)}
                                            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                                        >
                                            Book Package
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                { }
                {activeTab === 'faq' && (
                    <div className="space-y-10 max-w-4xl mx-auto animate-fadeIn">
                        {/* FAQ HEADER */}
                        <div className="text-center space-y-3">
                            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Help Center</span>
                            <h1 className="font-serif text-4xl font-bold text-white">Frequently Asked Questions</h1>
                            <p className="text-slate-400 text-sm">
                                Find clear answers regarding check-in procedures, suite cancellations, valet parking, and special guest accommodations.
                            </p>
                        </div>

                        {/* SEARCH BAR & CATEGORY TABS */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions (e.g., check-in, parking, cancellation, pets)..."
                                    value={faqSearch}
                                    onChange={(e) => setFaqSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>

                            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                                {FAQ_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFaqCategory(cat.id)}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${faqCategory === cat.id
                                            ? 'bg-amber-500 text-slate-950 shadow-md'
                                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ACCORDION LIST */}
                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => {
                                    const isOpen = openFaqId === faq.id;
                                    return (
                                        <div
                                            key={faq.id}
                                            className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setOpenFaqId(isOpen ? 1 : faq.id)}
                                                className="w-full p-5 text-left flex items-center justify-between gap-4 font-medium text-slate-200 hover:text-white"
                                            >
                                                <span className="font-serif text-lg font-semibold">{faq.question}</span>
                                                {isOpen ? (
                                                    <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                )}
                                            </button>

                                            {isOpen && (
                                                <div className="px-5 pb-5 text-slate-300 text-sm leading-relaxed border-t border-slate-800/80 pt-4 bg-slate-950/40">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-300 font-medium">No matching questions found.</p>
                                    <p className="text-slate-500 text-xs mt-1">Try clearing your search query or selecting another category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                { }
                {activeTab === 'terms' && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
                        {/* HEADER */}
                        <div className="border-b border-slate-800 pb-6">
                            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Legal Agreement</span>
                            <h1 className="font-serif text-4xl font-bold text-white mt-1">Terms & Conditions</h1>
                            <p className="text-slate-400 text-xs mt-2">Effective Date: October 1, 2026 | Version 4.2</p>
                        </div>

                        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h2 className="font-serif text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                                    <span className="text-slate-500 text-sm font-sans">01.</span> Reservation & Check-In Policy
                                </h2>
                                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                                    <li><strong>Check-in Time:</strong> Standard guest check-in begins at 15:00 hours. Guests arriving earlier may store luggage securely with the Concierge desk free of charge.</li>
                                    <li><strong>Check-out Time:</strong> Suite departure must occur no later than 12:00 hours on the scheduled date of departure. Late check-outs between 12:00 and 16:00 incur a half-day room charge. Departures past 16:00 incur a full daily rate.</li>
                                    <li><strong>Age Requirement:</strong> Primary suite reservation holders must be at least 18 years of age and present valid photo identification (Passport or Driver&apos;s License) upon check-in.</li>
                                </ul>
                            </section>

                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h2 className="font-serif text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                                    <span className="text-slate-500 text-sm font-sans">02.</span> Cancellation & Refund Policy
                                </h2>
                                <p className="mb-3">
                                    Cancellations or modifications to standard flexible reservations must be submitted at least <strong>48 hours prior to 15:00 hours local time</strong> on the scheduled arrival date to avoid penalties.
                                </p>
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-400">
                                    <strong className="text-amber-300">Late Cancellation Penalty:</strong> Cancellations made within 48 hours or unannounced no-shows will result in a fee equal to one night&apos;s room rate plus applicable local occupancy taxes.
                                </div>
                            </section>

                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h2 className="font-serif text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                                    <span className="text-slate-500 text-sm font-sans">03.</span> Incidental Guarantee & Payment Terms
                                </h2>
                                <p>
                                    A valid card is required at check-in. Velora Hotels & Suites reserves the right to place a temporary security authorization hold of <strong>৳15,000 BDT per suite per night</strong> for potential incidental room charges (room service, spa, minibar). Unused funds are released upon departure.
                                </p>
                            </section>

                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h2 className="font-serif text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                                    <span className="text-slate-500 text-sm font-sans">04.</span> Guest Conduct & Property Damage
                                </h2>
                                <p>
                                    Velora is a 100% non-smoking luxury establishment. Smoking or vaping in non-designated areas or guest suites carries a mandatory ৳20,000 deep cleaning fee. Any intentional damage caused to suite furnishings, artwork, or hotel property will be billed directly to the guest payment account on file.
                                </p>
                            </section>
                        </div>
                    </div>
                )}

                { }
                {activeTab === 'privacy' && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
                        {/* HEADER */}
                        <div className="border-b border-slate-800 pb-6">
                            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Compliance & Security</span>
                            <h1 className="font-serif text-4xl font-bold text-white mt-1">Privacy Policy & Data Rights</h1>
                            <p className="text-slate-400 text-xs mt-2">GDPR & CCPA Compliant | Last Updated: September 2026</p>
                        </div>

                        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl flex items-start gap-4">
                                <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Our Commitment to Guest Privacy</h3>
                                    <p className="text-xs text-slate-300">
                                        At Velora Hotels & Suites, protecting your personal information and maintaining strict guest confidentiality is paramount to our commitment to luxury service.
                                    </p>
                                </div>
                            </div>

                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                                <h2 className="font-serif text-xl font-bold text-white text-amber-400">1. Information We Collect</h2>
                                <p>We collect essential personal data to facilitate room bookings, dining reservations, and personalized concierge services, including:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                                    <li>Contact details (Full name, verified email address, phone number, residential address).</li>
                                    <li>Payment credentials (Encrypted credit card tokens handled through PCI-DSS certified gateways).</li>
                                    <li>Guest preferences (Dietary choices, room temperature settings, accessibility requirements).</li>
                                    <li>Digital identifiers (IP address, browser cookies for reservation site performance).</li>
                                </ul>
                            </section>

                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                                <h2 className="font-serif text-xl font-bold text-white text-amber-400">2. How We Use Your Data</h2>
                                <p>Your information is exclusively utilized to deliver high-touch hospitality, process transactions, communicate itinerary updates, and continuously refine our service standards. We <strong>never sell or rent</strong> guest contact lists to third-party marketing firms.</p>
                            </section>

                            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
                                <h2 className="font-serif text-xl font-bold text-white text-amber-400">3. Guest Rights & Data Deletion Requests</h2>
                                <p>Under GDPR and CCPA regulations, you maintain the full legal right to:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                                    <li>Request a copy of all personal records maintained by Velora Hotels & Suites.</li>
                                    <li>Request permanent deletion of your profile from our marketing database.</li>
                                    <li>Opt-out of promotional news and seasonal luxury offer communications.</li>
                                </ul>
                                <div className="pt-2">
                                    <a
                                        href="mailto:privacy@velorahotels.com"
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span>Submit Data Inquiry to privacy@velorahotels.com</span>
                                    </a>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

            </main>

            { }

            {/* --- DINING RESERVATION MODAL --- */}
            {diningModalOpen && selectedDining && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
                        <button
                            onClick={() => setDiningModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!bookingSuccess ? (
                            <form onSubmit={handleReservationSubmit} className="space-y-4">
                                <div>
                                    <span className="text-amber-400 text-[10px] uppercase font-bold tracking-widest">Table Reservation</span>
                                    <h3 className="font-serif text-2xl font-bold text-white">{selectedDining.name}</h3>
                                    <p className="text-slate-400 text-xs mt-1">{selectedDining.hours}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={reservationForm.date}
                                            onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
                                        <select
                                            value={reservationForm.time}
                                            onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                        >
                                            <option>18:00</option>
                                            <option>19:00</option>
                                            <option>20:00</option>
                                            <option>21:00</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Guest Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Lord / Lady Vance"
                                            value={reservationForm.name}
                                            onChange={(e) => setReservationForm({ ...reservationForm, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Number of Guests</label>
                                        <select
                                            value={reservationForm.guests}
                                            onChange={(e) => setReservationForm({ ...reservationForm, guests: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                        >
                                            <option>1 Guest</option>
                                            <option>2 Guests</option>
                                            <option>4 Guests</option>
                                            <option>6+ Guests (VIP Table)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Dietary Requests / Occasion</label>
                                    <input
                                        type="text"
                                        placeholder="Anniversary, Gluten-Free, Window table preference..."
                                        value={reservationForm.specialRequests}
                                        onChange={(e) => setReservationForm({ ...reservationForm, specialRequests: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all mt-2"
                                >
                                    Confirm Reservation Request
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-6 h-6" />
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-white">Table Request Received</h3>
                                <p className="text-slate-300 text-xs max-w-xs mx-auto">
                                    Our Maitre d&apos; at {selectedDining.name} has logged your reservation for {reservationForm.guests} on {reservationForm.date} at {reservationForm.time}.
                                </p>
                                <button
                                    onClick={() => setDiningModalOpen(false)}
                                    className="px-6 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700"
                                >
                                    Close Window
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- EXPERIENCE RESERVATION MODAL --- */}
            {expModalOpen && selectedExp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
                        <button
                            onClick={() => setExpModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!bookingSuccess ? (
                            <form onSubmit={handleReservationSubmit} className="space-y-4">
                                <div>
                                    <span className="text-amber-400 text-[10px] uppercase font-bold tracking-widest">{selectedExp.category} Excursion</span>
                                    <h3 className="font-serif text-2xl font-bold text-white">{selectedExp.title}</h3>
                                    <p className="text-amber-400 font-serif text-lg font-bold mt-1">{selectedExp.price}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={reservationForm.date}
                                            onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">Primary Guest</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Full Name"
                                            value={reservationForm.name}
                                            onChange={(e) => setReservationForm({ ...reservationForm, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Special Concierge Requirements</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Provide additional guest names, airport transfer pickup times, or dietary needs..."
                                        value={reservationForm.specialRequests}
                                        onChange={(e) => setReservationForm({ ...reservationForm, specialRequests: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all mt-2"
                                >
                                    Submit Booking Request
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-6 h-6" />
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-white">Experience Reserved</h3>
                                <p className="text-slate-300 text-xs max-w-xs mx-auto">
                                    Our Les Clefs d Or Concierge team will contact you within 2 hours to confirm your custom itinerary for {selectedExp.title}.
                                </p>
                                <button
                                    onClick={() => setExpModalOpen(false)}
                                    className="px-6 py-2 rounded-lg bg-slate-800 text-xs font-medium text-white hover:bg-slate-700"
                                >
                                    Close Window
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            { }

            {/* --- FOOTER COMPONENT WITH 7 FOOTER LINKS --- */}
            <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 border-b border-slate-800/80 pb-8">
                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Overview</h4>
                            <button onClick={() => setActiveTab('about')} className="block py-1 hover:text-amber-400 transition-colors">
                                About Velora
                            </button>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Guest Care</h4>
                            <button onClick={() => setActiveTab('services')} className="block py-1 hover:text-amber-400 transition-colors">
                                Hotel Services
                            </button>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Gastronomy</h4>
                            <button onClick={() => setActiveTab('dining')} className="block py-1 hover:text-amber-400 transition-colors">
                                Dining
                            </button>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Excursions</h4>
                            <button onClick={() => setActiveTab('experiences')} className="block py-1 hover:text-amber-400 transition-colors">
                                Experiences
                            </button>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Support</h4>
                            <button onClick={() => setActiveTab('faq')} className="block py-1 hover:text-amber-400 transition-colors">
                                FAQs
                            </button>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Policies</h4>
                            <button onClick={() => setActiveTab('terms')} className="block py-1 hover:text-amber-400 transition-colors">
                                Terms & Conditions
                            </button>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Compliance</h4>
                            <button onClick={() => setActiveTab('privacy')} className="block py-1 hover:text-amber-400 transition-colors">
                                Privacy Policy
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-bold text-white tracking-wider">VELORA</span>
                            <span className="text-slate-600">|</span>
                            <span>© 2026 Velora Hotels & Suites International. All Rights Reserved.</span>
                        </div>

                        <div className="flex items-center gap-6 text-slate-500">
                            <span className="hover:text-amber-400 cursor-pointer">Concierge Desk: +1 (800) 555-VELORA</span>
                            <span className="hover:text-amber-400 cursor-pointer">concierge@velorahotels.com</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}