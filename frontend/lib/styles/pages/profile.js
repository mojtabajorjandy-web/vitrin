import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { User, ShieldCheck, LogOut, Settings, CreditCard } from "lucide-react";
import { getStoredUser, clearToken } from "../lib/apiClient";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getStoredUser()); }, []);

  function handleLogout() { clearToken(); router.push("/login"); }

  if (!user) return (
    <div className="app"><div className="empty"><p>ابتدا وارد حساب خود شوید.</p>
      <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => router.push("/login")}>ورود</button>
    </div></div>
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>ویترین من</span>
        </div>
      </header>
      <main className="feed">
        <div className="profile__card">
          <User size={26} />
          <div><b dir="ltr">{user.phone}</b><div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{user.isAdmin ? "مدیر ویترین" : "کاربر ویترین"}</div></div>
        </div>
        {user.isAdmin && (
          <button className="profile__item" onClick={() => router.push("/admin")}><ShieldCheck size={18} /> پنل مدیریت</button>
        )}
        <button className="profile__item"><Settings size={18} /> تنظیمات حساب</button>
        <button className="profile__item"><CreditCard size={18} /> تاریخچه پرداخت‌ها</button>
        <button className="profile__item" style={{ color: "var(--rust)" }} onClick={handleLogout}><LogOut size={18} /> خروج از حساب</button>
      </main>
    </div>
  );
}
