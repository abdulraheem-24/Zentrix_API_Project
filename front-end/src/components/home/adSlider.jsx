
import { useEffect, useMemo, useState } from "react";

import { useHeroProducts } from "../../hooks/useProducts";

import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";


// --------------------------------------
// Helpers
// --------------------------------------

const fmt = (n) =>
    "₹" + Number(n ?? 0).toLocaleString("en-IN");

const dp = (price, disc) =>
    Math.round(
        Number(price ?? 0) -
        (Number(price ?? 0) * Number(disc ?? 0)) / 100
    );


// --------------------------------------
// Advertisement design configuration
// --------------------------------------

const SLIDE_DESIGNS = {
    "ASUS Vivobook S16": {
        tagline: "Slim. Smart. Unstoppable.",
        subline:
            "Intel Core Ultra 5 · 16-inch FHD · AI-powered · 70Whr battery",
        badge: "Editor's Pick",
        bg: "from-violet-950 via-indigo-900 to-slate-900",
        accent: "#e0e7ff",
        pillBg: "bg-indigo-400/20",
        pillText: "text-indigo-200",
        dark: true,
    },

    "Nothing Headphone (1)": {
        tagline: "Hear everything.\nTune out the rest.",
        subline:
            "80h battery · KEF-tuned · Hybrid ANC · Hi-Res Audio",
        badge: "Trending Now",
        bg: "from-zinc-100 via-white to-gray-100",
        accent: "#111111",
        pillBg: "bg-black/8",
        pillText: "text-gray-700",
        dark: false,
    },

    "iPhone 17 Pro Max": {
        tagline: "Pro. Beyond all limits.",
        subline:
            "A19 Pro · 48MP Triple Camera · Titanium · Apple Intelligence",
        badge: "New Arrival",
        bg: "from-gray-950 via-zinc-900 to-neutral-900",
        accent: "#f4f4f5",
        pillBg: "bg-white/10",
        pillText: "text-zinc-200",
        dark: true,
    },
};


// --------------------------------------
// Hero Slider
// --------------------------------------

export default function HeroSlider({ navigate }) {

    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);

    const {
        data: products = [],
        isLoading,
        error,
    } = useHeroProducts();


    // --------------------------------------
    // Prepare advertisement slides
    // --------------------------------------

    const AD_SLIDES = useMemo(() => {

        if (!Array.isArray(products)) return [];

        return products
            .filter(product => SLIDE_DESIGNS[product.name])
            .map(product => ({
                ...product,
                ...SLIDE_DESIGNS[product.name],
            }));

    }, [products]);


    // --------------------------------------
    // Keep current slide within valid range
    // --------------------------------------

    useEffect(() => {

        if (current >= AD_SLIDES.length) {
            setCurrent(0);
        }

    }, [AD_SLIDES.length, current]);


    // --------------------------------------
    // Slide navigation
    // --------------------------------------

    const goTo = (index) => {

        if (
            fading ||
            index === current ||
            AD_SLIDES.length <= 1
        ) {
            return;
        }

        setFading(true);

        setTimeout(() => {
            setCurrent(index);
            setFading(false);
        }, 350);

    };


    const next = () => {

        if (AD_SLIDES.length <= 1) return;

        goTo((current + 1) % AD_SLIDES.length);

    };


    const prev = () => {

        if (AD_SLIDES.length <= 1) return;

        goTo(
            (current - 1 + AD_SLIDES.length) %
            AD_SLIDES.length
        );

    };


    // --------------------------------------
    // Automatic slider
    // --------------------------------------

    useEffect(() => {

        if (AD_SLIDES.length <= 1) return;

        const interval = setInterval(() => {

            setCurrent(prev =>
                (prev + 1) % AD_SLIDES.length
            );

        }, 5500);

        return () => clearInterval(interval);

    }, [AD_SLIDES.length]);


    // --------------------------------------
    // Loading state
    // --------------------------------------

    if (isLoading) {

        return (
            <div className="min-h-110 rounded-3xl bg-gray-100 animate-pulse flex items-center justify-center">

                <p className="text-gray-500 text-sm">
                    Loading featured products...
                </p>

            </div>
        );

    }


    // --------------------------------------
    // Error state
    // --------------------------------------

    if (error) {

        return (
            <div className="min-h-110 rounded-3xl bg-gray-100 flex items-center justify-center">

                <p className="text-red-500 text-sm">
                    Unable to load advertisement products.
                </p>

            </div>
        );

    }


    // --------------------------------------
    // Empty state
    // --------------------------------------

    if (!AD_SLIDES.length) {

        return null;

    }


    const s = AD_SLIDES[current] ?? AD_SLIDES[0];


    // --------------------------------------
    // Render
    // --------------------------------------

    return (

        <div
            className={`relative overflow-hidden rounded-3xl bg-linear-to-br ${s.bg}`}
            style={{ minHeight: 440 }}
        >

            {/* Grain overlay */}

            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                }}
            />


            {/* Main content */}

            <div
                className={`relative flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-10 gap-8 h-full transition-all duration-350 ${
                    fading
                        ? "opacity-0 scale-[0.99]"
                        : "opacity-100 scale-100"
                }`}
                style={{
                    minHeight: 440,
                    transition:
                        "opacity 0.35s ease, transform 0.35s ease",
                }}
            >

                {/* Text section */}

                <div className="flex-1 flex flex-col gap-5 z-10 max-w-lg">

                    <div className="flex items-center gap-3 flex-wrap">

                        <span
                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${s.pillBg} ${s.pillText}`}
                        >
                            {s.badge}
                        </span>

                        <span
                            className={`text-[10px] font-semibold uppercase tracking-widest opacity-50 ${s.pillText}`}
                        >
                            {s.brand}
                        </span>

                    </div>


                    <h2
                        className="text-4xl md:text-5xl font-black leading-tight tracking-tight whitespace-pre-line"
                        style={{ color: s.accent }}
                    >
                        {s.tagline}
                    </h2>


                    <p
                        className="text-sm opacity-55 max-w-xs leading-relaxed"
                        style={{ color: s.accent }}
                    >
                        {s.subline}
                    </p>


                    {/* Price */}

                    <div className="flex items-baseline gap-3 flex-wrap">

                        <span
                            className="text-3xl font-black"
                            style={{ color: s.accent }}
                        >
                            {fmt(dp(s.price, s.discount))}
                        </span>

                        {Number(s.discount) > 0 && (
                            <>
                                <span
                                    className="text-sm opacity-40 line-through"
                                    style={{ color: s.accent }}
                                >
                                    {fmt(s.price)}
                                </span>

                                <span className="text-xs font-black bg-green-500 text-white px-2.5 py-1 rounded-full">
                                    {s.discount}% OFF
                                </span>
                            </>
                        )}

                    </div>


                    {/* Shop button */}

                    <button
                        onClick={() =>
                            navigate(`/products/${s.id}`)
                        }
                        className="flex items-center gap-2 w-fit px-7 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                        style={{
                            background: s.accent,
                            color: s.dark ? "#111" : "#fff",
                        }}
                    >
                        Shop Now
                        <ArrowRight size={15} />
                    </button>

                </div>


                {/* Product image */}

                <div className="shrink-0 flex items-center justify-center w-full md:w-95 h-56 md:h-80">

                    {s.name === "iPhone 17 Pro Max" ? (

                        <div className="relative flex items-center justify-center w-full h-full rounded-4xl overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl p-6">

                            {/* Glow */}

                            <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-black/20 pointer-events-none" />

                            <img
                                src={s.image}
                                alt={s.name}
                                className="relative max-h-full max-w-full object-contain rounded-3xl transition-all duration-500"
                                style={{
                                    filter:
                                        "drop-shadow(0 30px 60px rgba(0,0,0,0.55))",
                                    opacity: fading ? 0 : 1,
                                    transform: fading
                                        ? "translateY(12px) scale(0.96)"
                                        : "translateY(0) scale(1)",
                                }}
                            />

                        </div>

                    ) : (

                        <img
                            src={s.image}
                            alt={s.name}
                            className="max-h-full max-w-full object-contain rounded-2xl"
                            style={{
                                filter:
                                    "drop-shadow(0 24px 48px rgba(0,0,0,0.4))",
                                transition:
                                    "opacity 0.35s ease, transform 0.35s ease",
                                opacity: fading ? 0 : 1,
                                transform: fading
                                    ? "translateY(12px)"
                                    : "translateY(0)",
                            }}
                        />

                    )}

                </div>

            </div>


            {/* Navigation arrows */}

            {AD_SLIDES.length > 1 && (

                <>
                    <button
                        onClick={prev}
                        aria-label="Previous slide"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 backdrop-blur-sm transition-all"
                        style={{ color: s.accent }}
                    >
                        <ChevronLeft size={20} />
                    </button>


                    <button
                        onClick={next}
                        aria-label="Next slide"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/30 backdrop-blur-sm transition-all"
                        style={{ color: s.accent }}
                    >
                        <ChevronRight size={20} />
                    </button>

                </>

            )}


            {/* Navigation dots */}

            {AD_SLIDES.length > 1 && (

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">

                    {AD_SLIDES.map((slide, index) => (

                        <button
                            key={slide.id}
                            onClick={() => goTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                                index === current
                                    ? "w-6 h-2"
                                    : "w-2 h-2 opacity-30"
                            }`}
                            style={{ background: s.accent }}
                        />

                    ))}

                </div>

            )}


            {/* Slide counter */}

            <div
                className="absolute top-5 right-8 text-xs font-bold opacity-30"
                style={{ color: s.accent }}
            >
                {String(current + 1).padStart(2, "0")}
                {" / "}
                {String(AD_SLIDES.length).padStart(2, "0")}
            </div>

        </div>

    );

}
