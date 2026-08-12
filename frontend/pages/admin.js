import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { api } from "../lib/apiClient";

function formatPrice(n) { return n === null || n === undefined ? "توافقی" : new Intl.NumberFormat("fa-IR").format(n) + " تومان"; }

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [ads, setAds] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");

  function refresh() {
    api.adminStats().then(setStats).catch((e) => setError(e.message));
    api.adminAds().then((d) => setAds(d.ads)).catch(() => {});
    api.adminPendingPayments().then((d) => setPending(d.payments)).catch(() => {});
  }
  useEffect(refresh, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>پنل مدیریت</span>
        </div>
      </header>
      <main className="feed">
        {error && <p className="form__error" style={{ padding: "0 16px" }}>{error} (دسترسی فقط برای مدیر است)</p>}
        {stats && (
          <div className="admin__stats">
            <div className="admin__stat"><b>{stats.totalAds}</b><span>کل آگهی‌ها</span></div>
            <div className="admin__stat"><b>{stats.featuredAds}</b><span>آگهی ویژه</span></div>
            <div className="admin__stat"><b>{stats.totalUsers}</b><span>کاربران</span></div>
            <div className="admin__stat"><b>{stats.pendingPayments}</b><span>پرداخت در انتظار</span></div>
          </div>
        )}

        {pending.length > 0 && (
          <>
            <h3 className="section-heading">رسیدهای کارت‌به‌کارت در انتظار تایید</h3>
            {pending.map((p) => (
              <div key={p.id} className="admin__row">
                <span style={{ flex: 1 }}>{p.ad?.title} — {p.user.phone} — {formatPrice(p.amount)}</span>
                <button className="btn-primary" style={{ width: "auto" }} onClick={() => api.adminApprovePayment(p.id).then(refresh)}>تایید</button>
                <button className="btn-danger" style={{ width: "auto" }} onClick={() => api.adminRejectPayment(p.id).then(refresh)}>رد</button>
              </div>
            ))}
          </>
        )}

        <h3 className="section-heading">مدیریت آگهی‌ها</h3>
        {ads.map((ad) => (
          <div key={ad.id} className="admin__row">
            <span style={{ flex: 1 }}>{ad.title} — {ad.city}</span>
            <button className="profile__item" style={{ width: "auto", padding: 8, margin: 0 }} onClick={() => api.adminToggleFeature(ad.id).then(refresh)}>
              <Star size={16} fill={ad.featured ? "#C68A2E" : "none"} />
            </button>
            <button className="profile__item" style={{ width: "auto", padding: 8, margin: 0, color: "var(--rust)" }} onClick={() => api.adminDeleteAd(ad.id).then(refresh)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
