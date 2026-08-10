import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MapPin, User, MessageCircle, Phone } from "lucide-react";
import { api } from "../../lib/apiClient";

function formatPrice(n) { return n === null || n === undefined ? "توافقی" : new Intl.NumberFormat("fa-IR").format(n) + " تومان"; }

export default function AdDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [ad, setAd] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (id) api.getAd(id).then((d) => setAd(d.ad)).catch((e) => setError(e.message)); }, [id]);

  async function handleChat() {
    try {
      await api.sendMessage(id, "سلام، آگهی‌تون هنوز موجوده؟");
      router.push("/chat");
    } catch (e) {
      router.push("/login");
    }
  }

  if (error) return <div className="app"><div className="empty"><p>{error}</p></div></div>;
  if (!ad) return <div className="app"><p style={{ textAlign: "center", padding: 40 }}>در حال بارگذاری...</p></div>;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>جزئیات آگهی</span>
        </div>
      </header>
      <main className="feed" style={{ padding: "16px" }}>
        <h2>{ad.title}</h2>
        <div className="price-tag price-tag--lg">{formatPrice(ad.price)}</div>
        <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: "var(--ink-soft)", margin: "12px 0" }}>
          <span><MapPin size={14} /> {ad.city}</span>
          <span><User size={14} /> {ad.seller?.phone ? "کاربر ویترین" : "—"}</span>
        </div>
        <p style={{ lineHeight: 1.9, fontSize: 13.5 }}>{ad.description}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn-primary" onClick={handleChat}><MessageCircle size={16} /> چت با فروشنده</button>
          <button className="btn-secondary" onClick={() => setShowPhone((v) => !v)}>
            <Phone size={16} /> {showPhone ? ad.seller?.phone : "نمایش شماره تماس"}
          </button>
        </div>
      </main>
    </div>
  );
}
