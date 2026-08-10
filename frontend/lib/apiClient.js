const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("vitrine_token");
}

export function setToken(token) {
  if (typeof window !== "undefined") window.localStorage.setItem("vitrine_token", token);
}

export function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem("vitrine_token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("vitrine_user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  if (typeof window !== "undefined") window.localStorage.setItem("vitrine_user", JSON.stringify(user));
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "خطایی رخ داد.");
  return data;
}

export const api = {
  sendOtp: (phone) => request("/auth/send-otp", { method: "POST", body: { phone } }),
  verifyOtp: (phone, code) => request("/auth/verify-otp", { method: "POST", body: { phone, code } }),

  getAds: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/ads${qs ? "?" + qs : ""}`);
  },
  getAd: (id) => request(`/ads/${id}`),
  getMyAds: () => request("/ads/mine/list", { auth: true }),
  createAd: (payload) => request("/ads", { method: "POST", body: payload, auth: true }),
  deleteAd: (id) => request(`/ads/${id}`, { method: "DELETE", auth: true }),

  getThreads: () => request("/chat/threads", { auth: true }),
  getMessages: (adId) => request(`/chat/${adId}/messages`, { auth: true }),
  sendMessage: (adId, text) => request(`/chat/${adId}/messages`, { method: "POST", body: { text }, auth: true }),

  getBankInfo: () => request("/payments/bank-info"),
  requestGatewayPayment: (adId, boostType) =>
    request("/payments/gateway/request", { method: "POST", body: { adId, boostType }, auth: true }),
  submitCardToCard: (adId, boostType, note) =>
    request("/payments/card-to-card", { method: "POST", body: { adId, boostType, note }, auth: true }),

  adminStats: () => request("/admin/stats", { auth: true }),
  adminAds: () => request("/admin/ads", { auth: true }),
  adminToggleFeature: (id) => request(`/admin/ads/${id}/feature`, { method: "PATCH", auth: true }),
  adminDeleteAd: (id) => request(`/admin/ads/${id}`, { method: "DELETE", auth: true }),
  adminPendingPayments: () => request("/admin/payments/pending", { auth: true }),
  adminApprovePayment: (id) => request(`/admin/payments/${id}/approve`, { method: "POST", auth: true }),
  adminRejectPayment: (id) => request(`/admin/payments/${id}/reject`, { method: "POST", auth: true }),
};
