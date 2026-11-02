import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Star, Zap, Shield, Truck, Headphones,
  Smartphone, Laptop, Watch,
} from "lucide-react";
import { useAllProducts, useProducts } from "../hooks/useProducts";
import HeroSlider from "../components/home/adSlider";
import SectionHeader from "../components/home/sectionHeader";
import MiniCard from "../components/home/miniCard";




// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Phones",    icon: Smartphone, count: 10, desc: "Flagships & foldables",     bg: "bg-blue-50",    iconColor: "text-blue-600",    hoverBg: "hover:bg-blue-600"    },
  { name: "Laptop",    icon: Laptop,     count: 10, desc: "Gaming & productivity",     bg: "bg-violet-50",  iconColor: "text-violet-600",  hoverBg: "hover:bg-violet-600"  },
  { name: "Audio",     icon: Headphones, count: 5,  desc: "Earbuds & headphones",      bg: "bg-amber-50",   iconColor: "text-amber-600",   hoverBg: "hover:bg-amber-600"   },
  { name: "Wearables", icon: Watch,      count: 5,  desc: "Smartwatches & more",       bg: "bg-emerald-50", iconColor: "text-emerald-600", hoverBg: "hover:bg-emerald-600" },
];


const BRANDS = ["Apple", "Samsung", "Sony", "OnePlus", "ASUS", "Lenovo", "Google", "Nothing"];

const TRUST = [
  { icon: Truck,       title: "Free Delivery",     desc: "On all orders"             },
  { icon: Shield,      title: "2 Year Warranty",   desc: "On all products"           },
  { icon: Zap,         title: "Fast Dispatch",     desc: "Same day shipping"         },
  { icon: Headphones,  title: "24/7 Support",      desc: "Always here for you"       },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const dp  = (price, disc) => Math.round(price - (price * disc) / 100);



// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {


  const { data , isLoading , error } = useAllProducts();


  const FEATURED = data?.filter(product => product.featured).slice(0,4);

  const TOP_PHONES = data?.filter(product => product.rating > 4.8 && product.category === "Phones" && product.featured).slice(0,4);

  const TOP_LAPTOPS = data?.filter(product => product.rating > 4.7 && product.category === "Laptop" && product.featured).slice(0,3).reverse();



  const navigate = useNavigate();


  if (isLoading) {
    return (
      <div>Loading....</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">

        {/* Hero */}
        <HeroSlider navigate={navigate} />

        {/* Trust */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section>
          <SectionHeader title="Shop by Category" sub="Find exactly what you're looking for"
            link="View all" onClick={() => navigate("/Products")} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ name, icon: Icon, count, desc, bg, iconColor, hoverBg }) => (
              <button key={name}
                onClick={() => navigate(`/Products?category=${name}`)}
                className={`group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${hoverBg} hover:text-white hover:border-transparent`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} group-hover:bg-white/20 transition-all duration-300`}>
                  <Icon size={26} className={`${iconColor} group-hover:text-white transition-colors duration-300`} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">{name}</p>
                  <p className="text-xs opacity-60 mt-0.5">{count} products · {desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section>
          <SectionHeader title="Featured Products" sub="Handpicked just for you"
            link="See all" onClick={() => navigate("/Products")} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED.map((p) => <MiniCard key={p.id} product={p} navigate={navigate} />)}
          </div>
        </section>

        {/* Promo banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-8 md:px-16 py-12">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 15% 60%, rgba(99,102,241,0.25) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(6,182,212,0.2) 0%, transparent 50%)" }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <span className="inline-block text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 rounded-full">
                Limited Time
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Upgrade Your<br />Tech Game Today.
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                30+ premium products. Unbeatable prices. Free delivery on every order.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <p className="text-gray-500 text-sm">Deals starting from</p>
              <p className="text-4xl font-black text-white">₹4,999</p>
              <button onClick={() => navigate("/Products")}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-gray-900 text-sm font-black hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                Shop All <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Top Phones */}
        <section>
          <SectionHeader title="Top Phones" sub="Latest flagships & bestsellers"
            link="All Phones" onClick={() => navigate("/Products?category=Phones")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TOP_PHONES.map((p) => <MiniCard key={p.id} product={p} navigate={navigate} />)}
          </div>
        </section>

        {/* Top Laptops */}
        <section>
          <SectionHeader title="Top Laptops" sub="Work hard, game harder"
            link="All Laptops" onClick={() => navigate("/Products?category=Laptop")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TOP_LAPTOPS.map((p) => <MiniCard key={p.id} product={p} navigate={navigate} />)}
          </div>
        </section>

        {/* Brands */}
        <section>
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">
            Trusted Brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {BRANDS.map((brand) => (
              <div key={brand}
                className="px-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <span className="text-sm font-bold text-gray-600">{brand}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xl font-black text-gray-900">
            <span className="italic">Z</span>entrix
          </p>
          <p className="text-sm text-gray-400">© 2026 Zentrix. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            {["Privacy", "Terms", "Support"].map((t) => (
              <span key={t} className="hover:text-black cursor-pointer transition-colors">{t}</span>
            ))}
          </div>
        </footer>

      </div>
    </div>
  );
}