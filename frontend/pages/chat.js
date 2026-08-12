import { useEffect, useState, useRef } from "react";
import { api } from "../lib/apiClient";

export default function Chat() {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [msg, setMsg] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    api.getThreads().then((d) => {
      setThreads(d.threads);
      if (d.threads[0]) setActiveId(d.threads[0].adId);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [activeId, threads]);

  const active = threads.find((t) => t.adId === activeId);

  async function handleSend(e) {
    e.preventDefault();
    if (!msg.trim() || !activeId) return;
    await api.sendMessage(activeId, msg.trim());
    const d = await api.getThreads();
    setThreads(d.threads);
    setMsg("");
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__row">
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>چت و تماس</span>
        </div>
      </header>
      {threads.length === 0 ? (
        <div className="empty"><p>هنوز گفتگویی ندارید.</p></div>
      ) : (
        <div className="chat">
          <div className="chat__list">
            {threads.map((t) => (
              <button key={t.adId} className={`chat__item ${t.adId === activeId ? "chat__item--active" : ""}`} onClick={() => setActiveId(t.adId)}>
                <b>{t.adTitle}</b>
              </button>
            ))}
          </div>
          <div className="chat__thread">
            <div className="chat__messages" ref={listRef}>
              {active?.messages.map((m, i) => <div key={i} className={`bubble ${m.from === "me" ? "bubble--me" : "bubble--them"}`}>{m.text}</div>)}
            </div>
            <form className="chat__input" onSubmit={handleSend}>
              <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="پیام..." />
              <button className="btn-primary" style={{ width: "auto", padding: "9px 16px" }} type="submit">ارسال</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
