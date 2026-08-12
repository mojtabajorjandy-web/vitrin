import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/apiClient";

const CATEGORIES = [
  { id: "car", label: "خودرو" }, { id: "estate", label: "املاک" }, { id: "digital", label: "دیجیتال" },
  { id: "home", label: "خانه و آشپزخانه" }, { id: "personal", label: "شخصی" }, { id: "job", label: "استخدام" },
  { id: "service", label: "خدمات" }, { id: "hobby", label: "سرگرمی" },
];
const CITIES = ["تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کرج", "اهواز", "قم", "رشت", "یزد"];
const BOOST_PLANS = [
  { id: "bump", label: "پله", desc: "بالای لیست دسته‌بندی", price: 15000 },
  { id: "featured", label: "آگهی ویژه", desc: "نشان ویژه + صفحه اول", price: 49000 },
  { id: "renew", label: "تمدید خودکار", desc: "تمدید ماهانه خودکار", price: 9000 },
];

export default function PostAd() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0].id, price: "", negotiable: false, city: CITIES[0], description: "" });
  const [boost, setBoost] = useState(null);
  const [payMethod, setPayMethod] = useState("card");
  const [bankInfo, setBankInfo] = useState(null);
  const [createdAdId, setCreatedAdId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handlePublish(withBoost) {
    setError(""); setLoading(true);
    try {
      const ad = await api.createAd({
        title: form.title, description: form.description, category: form.category, city: form.city,
        price: form.negotiable ? null : Number(form.price) || null, negotiable: form.negotiable,
      });
      setCreatedAdId(ad.ad.id);
      if (withBoost) {
        setStep(3);
        api.getBankInfo().then((d) => setBankInfo(d.card));
      } else {
        setStep(4);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    setLoading(true); setError("");
    try {
      if (payMethod === "gateway") {
        const res = await api.requestGatewayPayment(createdAdId, boost);
        window.location.href = res.paymentUrl;
        return;
      } else {
        await api.submitCardToCard(createdAdId, boost, "پرداخت توسط کاربر ثبت شد");
        setStep(4);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>ثبت آگهی</span>
        </div>
      </header>
      <main className="feed">
        {step === 1 && (
          <form className="form" onSubmit={(e) => { e.preventDefault(); if (!form.title || !form.description) { setError("عنوان و توضیحات را کامل کنید."); return; } setError(""); setStep(2); }}>
            <label className="form__field"><span>عنوان آگهی</span><input value={form.title} onChange={(e) => update("title", e.target.value)} /></label>
            <label className="form__field"><span>دسته‌بندی</span>
              <select value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="form__field"><span>شهر</span>
              <select value={form.city} onChange={(e) => update("city", e.target.value)}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <div className="form__field">
              <span>قیمت (تومان)</span>
              <input type="number" disabled={form.negotiable} value={form.price} onChange={(e) => update("price", e.target.value)} />
              <label className="checkbox"><input type="checkbox" checked={form.negotiable} onChange={(e) => update("negotiable", e.target.checked)} /><span>قیمت توافقی</span></label>
            </div>
            <label className="form__field"><span>توضیحات</span><textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} /></label>
            {error && <p className="form__error">{error}</p>}
            <button className="btn-primary" type="submit">ادامه</button>
          </form>
        )}

        {step === 2 && (
          <>
            <h2 className="section-heading" style={{ margin: "0 0 12px" }}>افزایش دیده‌شدن آگهی</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, padding: "0 16px" }}>
              <button className={`boost-item ${boost === null ? "boost-item--active" : ""}`} onClick={() => setBoost(null)}>
                <div className="boost-item__body"><b>ثبت رایگان</b><span>نمایش عادی</span></div><span className="boost-item__price">رایگان</span>
              </button>
              {BOOST_PLANS.map((p) => (
                <button key={p.id} className={`boost-item ${boost === p.id ? "boost-item--active" : ""}`} onClick={() => setBoost(p.id)}>
                  <div className="boost-item__body"><b>{p.label}</b><span>{p.desc}</span></div>
                  <span className="boost-item__price">{new Intl.NumberFormat("fa-IR").format(p.price)} تومان</span>
                </button>
              ))}
            </div>
            {error && <p className="form__error" style={{ padding: "0 16px" }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, padding: "0 16px" }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>بازگشت</button>
              <button className="btn-primary" disabled={loading} onClick={() => handlePublish(!!boost)}>
                {loading ? "..." : boost ? "ادامه به پرداخت" : "انتشار آگهی"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ padding: "0 16px" }}>
            <h2 className="section-heading" style={{ margin: "0 0 12px", padding: 0 }}>پرداخت</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button className={`chip ${payMethod === "gateway" ? "chip--active" : ""}`} onClick={() => setPayMethod("gateway")}>درگاه بین‌بانکی</button>
              <button className={`chip ${payMethod === "card" ? "chip--active" : ""}`} onClick={() => setPayMethod("card")}>کارت به کارت</button>
            </div>
            {payMethod === "card" && bankInfo && (
              <div className="card-info">
                <div className="card-info__row"><span>شماره کارت</span><b dir="ltr">{bankInfo.number}</b></div>
                <div className="card-info__row"><span>به نام</span><b>{bankInfo.owner}</b></div>
                <div className="card-info__row"><span>بانک</span><b>{bankInfo.bank}</b></div>
                <p className="card-info__hint">پس از واریز، روی «پرداخت کردم» بزنید. آگهی پس از تایید مدیریت ارتقا می‌یابد.</p>
              </div>
            )}
            {error && <p className="form__error">{error}</p>}
            <button className="btn-primary" style={{ marginTop: 12 }} disabled={loading} onClick={handlePay}>
              {loading ? "در حال پردازش..." : payMethod === "card" ? "پرداخت کردم" : "پرداخت با درگاه"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", padding: "30px 16px" }}>
            <h2>آگهی شما ثبت شد!</h2>
            <button className="btn-primary" onClick={() => router.push("/")}>بازگشت به خانه</button>
          </div>
        )}
      </main>
    </div>
  );
}
