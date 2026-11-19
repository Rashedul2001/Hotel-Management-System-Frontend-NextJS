// app/contact/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    Sparkles,
    Building2,
    CalendarCheck2,
    HelpCircle,
    Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { openGoogleMapsDirections, HOTEL_OFFICIAL_ADDRESS } from '@/lib/directions';
import { submitContactMessage } from '@/lib/contact-api';
import { successToast, errorToast } from '@/components/ui/toast';

const INQUIRY_TYPES = [
    { id: 'general', label: 'General Inquiry', icon: HelpCircle },
    { id: 'reservation', label: 'Reservations & Bookings', icon: CalendarCheck2 },
    { id: 'events', label: 'Events & Weddings', icon: Building2 },
] as const;

const DIRECT_CONTACTS = [
    {
        title: 'Front Desk & Support',
        description: 'Available 24/7 for guest assistance and check-in inquiries.',
        phone: '+880 1700-000001',
        email: 'frontdesk@velorahotels.com',
    },
    {
        title: 'Concierge Services',
        description: 'Airport transfers, local tours, and customized guest itineraries.',
        phone: '+880 1700-000002',
        email: 'concierge@velorahotels.com',
    },
    {
        title: 'Events & Catering',
        description: 'Dedicated team for corporate conferences, weddings, and private galas.',
        phone: '+880 1700-000003',
        email: 'events@velorahotels.com',
    },
];

export default function ContactPage() {
    const [inquiryType, setInquiryType] = useState<string>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitContactMessage({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || undefined,
                subject: formData.subject,
                message: formData.message,
                inquiryType,
            });
            setIsSubmitted(true);
            successToast(
                "Inquiry Received",
                "Thank you! Your message has been routed to our concierge and a confirmation email has been dispatched."
            );
        } catch (err: any) {
            errorToast(
                "Submission Error",
                err.message || "Failed to submit inquiry. Please check your information and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 max-w-7xl">
            {/* Page Header */}
            <div className="mb-12 text-center">
                <span className="flex items-center justify-center gap-1 text-xs uppercase font-bold tracking-widest text-primary mb-2">
                    <Sparkles className="h-3.5 w-3.5" /> Get in Touch
                </span>
                <h1 className="text-3xl font-extrabold text-foreground sm:text-5xl tracking-tight">
                    Contact Us
                </h1>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                    Have a question about your upcoming stay, event bookings, or special requests?
                    Our hospitality team is available around the clock.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Contact Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Send Us a Message
                    </h2>
                    <p className="text-xs text-muted-foreground mb-6">
                        Select the topic that best matches your inquiry so we can route your message to the right department.
                    </p>

                    {/* Inquiry Type Tabs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                        {INQUIRY_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = inquiryType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setInquiryType(type.id)}
                                    className={cn(
                                        'flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                                            : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{type.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {isSubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 text-center space-y-4"
                        >
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Message Sent Successfully</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Thank you for contacting us, {formData.fullName || 'Guest'}. A member of our team will respond to your inquiry shortly.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
                                }}
                                className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                Send Another Message
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        Full Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        Email Address <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        Subject <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Reservation inquiry, feedback..."
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">
                                    Message <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="How can we assist you with your stay?"
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span>Sending Message...</span>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Location & Direct Department Cards */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Quick Location & Hours Block */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-foreground">
                                Hotel Information
                            </h3>
                            <button
                                type="button"
                                onClick={() => openGoogleMapsDirections()}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                title="Open Google Maps Directions"
                            >
                                <Navigation className="h-3.5 w-3.5" />
                                Get Directions
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">Hotel Velora & Suites</p>
                                    <p>Sobujbag, Savar Bus Stand</p>
                                    <p>Savar, Dhaka, Bangladesh</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">Operating Hours</p>
                                    <p>Front Desk: 24 Hours / 7 Days</p>
                                    <p>Concierge: 7:00 AM – 10:00 PM</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Google Map Embed */}
                        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border mt-3 shadow-inner">
                            <iframe
                                title="Hotel Velora Location Map"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src="https://maps.google.com/maps?q=Sobujbag,+savar+bus+stand,+savar,+dhaka,+bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => openGoogleMapsDirections()}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Navigation className="h-4 w-4" />
                            Directions from Your Location
                        </button>
                    </div>

                    {/* Department Contact Directory */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-foreground px-1">
                            Direct Departments
                        </h3>

                        {DIRECT_CONTACTS.map((dept, idx) => (
                            <div
                                key={idx}
                                className="bg-card border border-border rounded-xl p-4 shadow-2xs hover:border-primary/50 transition-colors"
                            >
                                <h4 className="text-xs font-bold text-foreground">{dept.title}</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                                    {dept.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                                    <a
                                        href={`tel:${dept.phone}`}
                                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                    >
                                        <Phone className="h-3 w-3" /> {dept.phone}
                                    </a>
                                    <a
                                        href={`mailto:${dept.email}`}
                                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                                    >
                                        <Mail className="h-3 w-3" /> {dept.email}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}