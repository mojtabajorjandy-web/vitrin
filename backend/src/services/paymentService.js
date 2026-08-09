const axios = require("axios");
const config = require("../config");

const BASE = () =>
  config.zarinpal.sandbox
    ? "https://sandbox.zarinpal.com/pg/v4/payment"
    : "https://api.zarinpal.com/pg/v4/payment";

async function requestPayment({ amount, description, mobile }) {
  if (!config.zarinpal.merchantId) {
    return {
      simulated: true,
      authority: "SIMULATED-" + Date.now(),
      paymentUrl: `${config.zarinpal.callbackUrl}?Authority=SIMULATED-${Date.now()}&Status=OK`,
    };
  }

  const res = await axios.post(`${BASE()}/request.json`, {
    merchant_id: config.zarinpal.merchantId,
    amount,
    description,
    callback_url: config.zarinpal.callbackUrl,
    metadata: { mobile },
  });

  const authority = res.data?.data?.authority;
  const sandboxPrefix = config.zarinpal.sandbox ? "sandbox" : "www";
  return {
    simulated: false,
    authority,
    paymentUrl: `https://${sandboxPrefix}.zarinpal.com/pg/StartPay/${authority}`,
  };
}

async function verifyPayment({ authority, amount }) {
  if (String(authority).startsWith("SIMULATED-")) {
    return { simulated: true, success: true, refId: authority };
  }

  const res = await axios.post(`${BASE()}/verify.json`, {
    merchant_id: config.zarinpal.merchantId,
    amount,
    authority,
  });

  const code = res.data?.data?.code;
  return { simulated: false, success: code === 100 || code === 101, refId: res.data?.data?.ref_id };
}

module.exports = { requestPayment, verifyPayment };
