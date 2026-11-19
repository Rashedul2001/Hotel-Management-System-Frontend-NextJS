import Image from "next/image";
import Link from "next/link";

import {
    FaInstagram,
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
} from "react-icons/fa";

import {
    FiArrowUpRight,
    FiMail,
    FiMapPin,
    FiPhone,
} from "react-icons/fi";

const FOOTER_LINKS = {
    stay: [
        { label: "Home", href: "/" },
        { label: "Rooms & Suites", href: "/rooms" },
        { label: "Gallery", href: "/gallery" },
        { label: "Contact", href: "/contact" },
    ],
    hotel: [
        { label: "About Velora", href: "/extra/about" },
        { label: "Hotel Services", href: "/extra/services" },
        { label: "Dining", href: "/extra/dining" },
        { label: "Experiences", href: "/extra/experiences" },
    ],
    guest: [
        { label: "My Profile", href: "/extra/profile" },
        { label: "My Bookings", href: "/bookings" },
        { label: "Guest Support", href: "/contact" },
        { label: "FAQs", href: "/extra/faq" },
    ],
};

const SOCIAL_LINKS = [
    {
        label: "Instagram",
        href: "#",
        icon: FaInstagram,
    },
    {
        label: "Facebook",
        href: "#",
        icon: FaFacebookF,
    },
    {
        label: "Twitter",
        href: "#",
        icon: FaTwitter,
    },
    {
        label: "LinkedIn",
        href: "#",
        icon: FaLinkedinIn,
    },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">

            {/* -------------------------------------------------------------------- */}
            {/* Main Footer                                                          */}
            {/* -------------------------------------------------------------------- */}

            <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">

                <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">

                    {/* Brand */}
                    <div className="max-w-md">

                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3"
                            aria-label="Velora Hotels home"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
                                <span className="hotel-display text-xl font-semibold">
                                    V
                                </span>
                            </div>

                            <div className="leading-none">
                                <span className="hotel-display block text-2xl font-semibold tracking-tight">
                                    Velora
                                </span>

                                <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                                    Hotels & Suites
                                </span>
                            </div>
                        </Link>

                        <p className="mt-6 text-sm leading-7 text-muted-foreground">
                            A refined hotel experience designed around comfort,
                            thoughtful hospitality, and memorable stays. Discover
                            beautifully appointed rooms and effortless service at Velora.
                        </p>

                        {/* Contact */}
                        <div className="mt-7 space-y-3">

                            <a
                                href="https://www.google.com/maps/dir/?api=1&destination=Sobujbag,+savar+bus+stand,+savar,+dhaka,+bangladesh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/loc flex items-start gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                title="Get Directions to Hotel Velora"
                            >
                                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary group-hover/loc:scale-110 transition-transform" />

                                <span>
                                    Sobujbag, Savar Bus Stand,
                                    <br />
                                    Savar, Dhaka, Bangladesh
                                </span>
                            </a>

                            <a
                                href="tel:+8801000000000"
                                className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                                <FiPhone className="h-4 w-4 text-primary" />
                                +880 1000 000 000
                            </a>

                            <a
                                href="mailto:hello@velorahotels.com"
                                className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                                <FiMail className="h-4 w-4 text-primary" />
                                hello@velorahotels.com
                            </a>
                        </div>

                        {/* Social */}
                        <div className="mt-7 flex items-center gap-2">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = social.icon;

                                return (
                                    <Link
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <Icon size={15} />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">

                        {/* Stay */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Stay
                            </h3>

                            <ul className="mt-5 space-y-3.5">
                                {FOOTER_LINKS.stay.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {link.label}

                                            <FiArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Hotel */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                The Hotel
                            </h3>

                            <ul className="mt-5 space-y-3.5">
                                {FOOTER_LINKS.hotel.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {link.label}

                                            <FiArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Guest */}
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Guest Services
                            </h3>

                            <ul className="mt-5 space-y-3.5">
                                {FOOTER_LINKS.guest.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {link.label}

                                            <FiArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------------ */}
                {/* Booking CTA                                                        */}
                {/* ------------------------------------------------------------------ */}

                <div className="mt-14 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="hotel-display text-2xl font-semibold sm:text-3xl">
                                Ready for your next stay?
                            </p>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-primary-foreground/75">
                                Explore our rooms and find a space designed for the way
                                you want to travel.
                            </p>
                        </div>

                        <Link
                            href="/rooms"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-background/90 hover:shadow-lg"
                        >
                            Explore Rooms
                            <FiArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* -------------------------------------------------------------------- */}
            {/* Copyright                                                            */}
            {/* -------------------------------------------------------------------- */}

            <div className="border-t border-border bg-background">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

                    <p className="text-center md:text-left">
                        © 2026 Velora Hotels & Suites. All rights reserved.
                    </p>

                    <div className="flex items-center justify-center gap-5 md:justify-end">
                        <Link
                            href="/terms"
                            className="transition-colors hover:text-foreground"
                        >
                            Terms & Conditions
                        </Link>

                        <Link
                            href="/privacy"
                            className="transition-colors hover:text-foreground"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}