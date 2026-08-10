import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/apiClient";

function formatPrice(n) { return n === null || n === undefined ? "توافقی" : new Intl.NumberFormat("fa-IR").format(n) + " تومان"; }

export default function MyAds() {
  const [ads, setAds] = useState([]);
  useEffect(() => { api.getMyAds().then((d) => setAds(d.ads)).catch(() => {}); }, []);

  async function handleDelete(id) {
    await api.deleteAd(id);
    setAds((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>آگهی‌های من</span>
        </div>
      </header>
      <main className="feed">
        {ads.length === 0 ? <div className="empty"><p>هنوز آگهی‌ای ثبت نکرده‌اید.</p></div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
            {ads.map((ad) => (
              <div key={ad.id} className="admin__row" style={{ margin: 0 }}>
                <Link href={`/ad/${ad.id}`} style={{ flex: 1 }}>
                  <b>{ad.title}</b><div className="price-tag" style={{ marginTop: 4 }}>{formatPrice(ad.price)}</div>
                </Link>
                <button className="btn-danger" style={{ width: "auto" }} onClick={() => handleDelete(ad.id)}>حذف</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
