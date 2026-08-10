import { useState } from "react";
import { useRouter } from "next/router";
import { api, setToken, setStoredUser } from "../lib/apiClient";

export default function Verify() {
  const router = useRouter();
  const { phone } = router.query;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setError(""); setLoading(true);
    try {
      const data = await api.verifyOtp(phone, code);
      setToken(data.token);
      setStoredUser(data.user);
      router.push("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__brand"><h1>کد تأیید</h1></div>
      <div className="auth__card">
        <p>کد ۴ رقمی ارسال شده به <b dir="ltr">{phone}</b> را وارد کنید.</p>
        <div className="demo-code">
          اگر KAVENEGAR_API_KEY تنظیم نشده باشد، کد در کنسول سرور بک‌اند چاپ می‌شود.
        </div>
        <label className="form__field">
          <span>کد تأیید</span>
          <input dir="ltr" style={{ textAlign: "center", letterSpacing: 6, fontSize: 20 }} inputMode="numeric" maxLength={4}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
        </label>
        {error && <p className="form__error">{error}</p>}
        <button className="btn-primary" disabled={code.length !== 4 || loading} onClick={handleVerify}>
          {loading ? "در حال بررسی..." : "ورود به ویترین"}
        </button>
      </div>
    </div>
  );
}
