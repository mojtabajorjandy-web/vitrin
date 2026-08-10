import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, MapPin, Plus, Home as HomeIcon, MessageCircle, Bookmark, User,
  Lamp, Smartphone, Car, Building2, Shirt, Gamepad2, Wrench, Briefcase
} from "lucide-react";
import { api } from "../lib/apiClient";

const CATEGORIES = [
  { id: "home", label: "خانه و آشپزخانه", icon: Lamp, bg: "var(--cat-1-bg)", fg: "var(--cat-1-fg)" },
  { id: "digital", label: "کالای دیجیتال", icon: Smartphone, bg: "var(--cat-2-bg)", fg: "var(--cat-2-fg)" },
  { id: "car", label: "وسایل نقلیه", icon: Car, bg: "var(--cat-3-bg)", fg: "var(--cat-3-fg)" },
  { id: "estate", label: "املاک", icon: Building2, bg: "var(--cat-4-bg)", fg: "var(--cat-4-fg)" },
  { id: "personal", label: "وسایل شخصی", icon: Shirt, bg: "var(--cat-5-bg)", fg: "var(--cat-5-fg)" },
  { id: "hobby", label: "سرگرمی و فراغت", icon: Gamepad2, bg: "var(--cat-6-bg)", fg: "var(--cat-6-fg)" },
  { id: "service", label: "خدمات", icon: Wrench, bg: "var(--cat-7-bg)", fg: "var(--cat-7-fg)" },
  { id: "job", label: "استخدام و کاریابی", icon: Briefcase, bg: "var(--cat-8-bg)", fg: "var(--cat-8-fg)" },
];

function formatPrice(n) {
  if (n === null || n === undefined) return "توافقی";
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export default function Home() {
  const [ads, setAds] = useState([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getAds({ ...(category !== "all" ? { category } : {}), ...(query ? { q: query } : {}) })
      .then((data) => setAds(data.ads))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, query]);

  const showGrid = category !== "all" || query.trim();

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span className="location-chip"><MapPin size={16} /> سراسر ایران</span>
          <span className="brand-mini"><span className="brand-mini__mark">V</span></span>
        </div>
        <div className="search">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در همهٔ آگهی‌ها" />
        </div>
      </header>

      {!showGrid && (
        <nav className="category-grid" aria-label="دسته‌بندی‌ها">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button key={c.id} className="category-item" onClick={() => setCategory(c.id)}>
                <span className="category-item__icon" style={{ background: c.bg }}>
                  <Icon size={24} strokeWidth={1.8} color={c.fg} />
                </span>
                <span className="category-item__label">{c.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {showGrid && (
        <nav className="chips" style={{ padding: "14px 16px" }}>
          <button className="chip chip--active" onClick={() => { setCategory("all"); setQuery(""); }}>بازگشت به همه</button>
        </nav>
      )}

      <main className="feed">
        {error && <p className="form__error" style={{ margin: "0 16px" }}>{error} (آیا بک‌اند در حال اجراست؟)</p>}
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--ink-soft)", padding: 30 }}>در حال بارگذاری...</p>
        ) : ads.length === 0 ? (
          <div className="empty"><p>آگهی‌ای پیدا نشد.</p></div>
        ) : showGrid ? (
          <div className="grid">
            {ads.map((ad) => (
              <Link key={ad.id} href={`/ad/${ad.id}`} className="ad-card">
                <div className="ad-card__media">
                  <span>🗂️</span>
                  {ad.featured && <span className="ad-card__badge">ویژه</span>}
                </div>
                <div className="ad-card__body">
                  <h3 className="ad-card__title">{ad.title}</h3>
                  <div className="price-tag">{formatPrice(ad.price)}</div>
                  <div className="ad-card__meta">
                    <span><MapPin size={11} /> {ad.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="feed-list">
            {ads.map((ad) => (
              <Link key={ad.id} href={`/ad/${ad.id}`} className="feed-card">
                <div className="feed-card__media">
                  <span>🗂️</span>
                  {ad.boostType && (
                    <span className="feed-card__badge">
                      {ad.boostType === "featured" ? "⭐ ویژه" : ad.boostType === "bump" ? "پله شده" : "تمدید‌شده"}
                    </span>
                  )}
                </div>
                <h3 className="feed-card__title">{ad.title}</h3>
                <div className="price-tag">{formatPrice(ad.price)}</div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Link href="/post-ad" className="fab-center"><Plus size={24} /></Link>

      <nav className="bottom-nav">
        <Link href="/" className="bottom-nav__item bottom-nav__item--active"><HomeIcon size={20} /><span>آگهی‌ها</span></Link>
        <Link href="/saved" className="bottom-nav__item"><Bookmark size={20} /><span>نشان‌ها</span></Link>
        <span className="bottom-nav__spacer" />
        <Link href="/chat" className="bottom-nav__item">
          <span className="bottom-nav__dot" /><MessageCircle size={20} /><span>چت و تماس</span>
        </Link>
        <Link href="/profile" className="bottom-nav__item"><User size={20} /><span>ویترین من</span></Link>
      </nav>
    </div>
  );
}
