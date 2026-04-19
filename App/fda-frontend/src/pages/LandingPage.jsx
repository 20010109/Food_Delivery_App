import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuSearch,
  LuMapPin,
  LuClock,
  LuShieldCheck,
  LuStar,
  LuBike,
  LuUtensils,
  LuChevronRight,
  LuInstagram,
  LuFacebook,
  LuTwitter,
  LuArrowRight,
} from "react-icons/lu";
import "./styles/tailwind.css";
import logoMerged from "../assets/Grubero-logo-merge-updated.png";
import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";

const slides = [slide1, slide2, slide3];

const CATEGORIES = [
  { emoji: "🍔", label: "Burgers" },
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🍗", label: "Chicken" },
  { emoji: "🌮", label: "Tacos" },
  { emoji: "🍜", label: "Noodles" },
  { emoji: "🥗", label: "Salads" },
  { emoji: "🍦", label: "Desserts" },
  { emoji: "☕", label: "Coffee" },
];

const STEPS = [
  {
    icon: <LuMapPin className="w-8 h-8 text-red-600" />,
    title: "Set Your Location",
    desc: "Enter your delivery address and we'll find the best restaurants near you.",
  },
  {
    icon: <LuUtensils className="w-8 h-8 text-red-600" />,
    title: "Choose Your Meal",
    desc: "Browse hundreds of menus from top-rated restaurants and pick what you crave.",
  },
  {
    icon: <LuBike className="w-8 h-8 text-red-600" />,
    title: "Fast Delivery",
    desc: "Sit back and relax. Your order arrives fresh at your doorstep in under an hour.",
  },
];

const STATS = [
  { value: "500+", label: "Restaurants" },
  { value: "50k+", label: "Happy Customers" },
  { value: "< 60 min", label: "Average Delivery" },
  { value: "4.8★", label: "App Rating" },
];

const TESTIMONIALS = [
  {
    name: "Maria Santos",
    review: "Grubero is a game changer! My food arrives hot and on time every single time.",
    rating: 5,
  },
  {
    name: "James Reyes",
    review: "Huge selection of restaurants. I love how easy it is to find something new to try.",
    rating: 5,
  },
  {
    name: "Ana Cruz",
    review: "Super fast delivery and the app is so smooth. Highly recommend to everyone!",
    rating: 4,
  },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Auto-advance hero carousel
  useEffect(() => {
    const t = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/explore${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <img
            src={logoMerged}
            alt="Grubero"
            className="h-9 w-auto object-contain cursor-pointer"
            onClick={() => scrollTo("home")}
          />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", id: "home" },
              { label: "How It Works", id: "how-it-works" },
              { label: "Categories", id: "categories" },
              { label: "About", id: "about" },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition ${
                  scrolled
                    ? "text-gray-700 hover:text-red-600"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className={`text-sm font-semibold px-5 py-2 rounded-full transition ${
                scrolled
                  ? "text-gray-700 hover:text-red-600"
                  : "text-white hover:text-white/80"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-semibold px-5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Slideshow background */}
        {slides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
          <span className="inline-block bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Free Delivery on Your First Order
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Delicious Food,<br />
            <span className="text-red-400">Delivered Fast.</span>
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Order from hundreds of top-rated local restaurants and get your
            favourite meals delivered fresh to your door in under an hour.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-full shadow-xl overflow-hidden max-w-xl mx-auto"
          >
            <LuSearch className="ml-5 text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisines…"
              className="flex-1 py-4 px-3 text-gray-800 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-4 text-sm transition shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick CTAs */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition"
            >
              Get Started <LuArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full backdrop-blur-sm transition"
            >
              Explore Restaurants
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide ? "bg-red-500 w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-red-400">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-red-600 font-semibold uppercase tracking-widest text-sm mb-3">
            Simple & Fast
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            How Grubero Works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-14">
            Getting your favourite food delivered has never been easier. Three
            simple steps stand between you and a great meal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map(({ icon, title, desc }, idx) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition relative"
              >
                <span className="absolute top-5 right-5 text-5xl font-extrabold text-gray-100 select-none">
                  {idx + 1}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-red-600 font-semibold uppercase tracking-widest text-sm mb-3">
              Browse by Type
            </p>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Featured Categories
            </h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {CATEGORIES.map(({ emoji, label }) => (
              <button
                key={label}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(label)}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-red-300 hover:bg-red-50 transition group"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-red-600 transition">
                  {label}
                </span>
              </button>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 text-red-600 font-semibold hover:gap-3 transition-all"
            >
              View all restaurants <LuChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY GRUBERO ────────────────────────────────────── */}
      <section id="about" className="py-20 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-red-400 font-semibold uppercase tracking-widest text-sm mb-3">
              Why Choose Us
            </p>
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              More Than Just Food Delivery
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Grubero connects you with the best local restaurants, ensuring
              every order is fresh, punctual, and exactly what you ordered.
            </p>
            <div className="space-y-6">
              {[
                {
                  icon: <LuClock className="text-red-400" size={22} />,
                  title: "Lightning-Fast Delivery",
                  desc: "Our riders are stationed near top restaurants so your food arrives in under an hour.",
                },
                {
                  icon: <LuShieldCheck className="text-red-400" size={22} />,
                  title: "Safe & Secure Payments",
                  desc: "Pay with confidence using our encrypted, fraud-protected checkout.",
                },
                {
                  icon: <LuStar className="text-red-400" size={22} />,
                  title: "Top-Rated Restaurants",
                  desc: "Every partner restaurant is reviewed by real customers — only the best make the list.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image from slide */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-96">
            <img
              src={slide2}
              alt="Grubero delivery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-white font-bold text-sm">🛵 Your order is on the way!</p>
              <p className="text-gray-300 text-xs mt-1">Estimated arrival: 22 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-red-600 font-semibold uppercase tracking-widest text-sm mb-3">
            Happy Customers
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-14">
            What People Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, review, rating }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-left hover:shadow-md transition"
              >
                <div className="flex mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <LuStar
                      key={i}
                      size={16}
                      className="text-red-500 fill-red-500"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  "{review}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                    {name[0]}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-20 bg-red-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to Order?
          </h2>
          <p className="text-white/80 mb-10 text-lg">
            Join thousands of happy customers. Sign up today and get free
            delivery on your first order.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition text-sm"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition text-sm"
            >
              Explore Restaurants
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src={logoMerged}
              alt="Grubero"
              className="h-9 w-auto object-contain mb-4"
            />
            <p className="text-sm leading-relaxed">
              Bringing you the best local food, fast and fresh, right at your doorstep.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="hover:text-white transition"><LuInstagram size={18} /></a>
              <a href="#" className="hover:text-white transition"><LuFacebook size={18} /></a>
              <a href="#" className="hover:text-white transition"><LuTwitter size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["Home", "Explore", "Login", "Sign Up"].map((l) => (
                <li key={l}>
                  <button
                    onClick={() => navigate(`/${l.toLowerCase().replace(" ", "")}`)}
                    className="hover:text-white transition"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About Us", "Careers", "Press", "Blog"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@grubero.com</li>
              <li>+63 912 345 6789</li>
              <li>Cebu, Philippines</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
          &copy; 2026 Grubero. All rights reserved.
        </div>
      </footer>

    </div>
  );
}