const axios = require("axios");
const config = require("../config");

async function sendOtp(phone, code) {
  if (!config.kavenegar.apiKey) {
    console.log(`\n📱 [حالت توسعه] کد تایید برای ${phone}: ${code}\n`);
    return { simulated: true };
  }

  const url = `https://api.kavenegar.com/v1/${config.kavenegar.apiKey}/verify/lookup.json`;
  const res = await axios.get(url, {
    params: {
      receptor: phone,
      token: code,
      template: config.kavenegar.template,
    },
  });
  return res.data;
}

module.exports = { sendOtp };
