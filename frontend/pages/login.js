import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/apiClient";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = /^09\d{9}$/.test(phone);

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      await api.sendOtp(phone);
      router.push(`/verify?phone=${phone}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__brand">
        <span className="auth__mark">و</span>
        <h1>ویترین</h1>
        <p>بازار آنلاین خرید و فروش، مخصوص همه‌ی ایران</p>
      </div>
      <div className="auth__card">
        <label className="form__field">
          <span>شماره موبایل</span>
          <input dir="ltr" style={{ textAlign: "right" }} inputMode="numeric" maxLength={11}
            placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
        </label>
        {error && <p className="form__error">{error}</p>}
        <button className="btn-primary" disabled={!valid || loading} onClick={handleSubmit}>
          {loading ? "در حال ارسال..." : "دریافت کد تأیید"}
        </button>
        <p className="auth__note">با ورود، قوانین و مقررات ویترین را می‌پذیرید.</p>
      </div>
    </div>
  );
}
