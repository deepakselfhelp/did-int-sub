export const config = {
  api: {
    bodyParser: false, // we’ll handle raw body manually
  },
};

export default async function handler(req, res) {
  const MOLLIE_KEY = process.env.MOLLIE_SECRET_KEY;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    // 1️⃣ Read raw body
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const bodyStr = Buffer.concat(buffers).toString();

    // 2️⃣ Mollie sends body as "id=tr_xxx"
    const paymentId = bodyStr.replace("id=", "").trim();
    if (!paymentId) return res.status(400).end("No payment id");

    // 3️⃣ Fetch payment details
    const r = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MOLLIE_KEY}` },
    });
    const payment = await r.json();

    // 4️⃣ If successful, send Telegram alert
    if (payment.status === "paid") {
      const name = payment.metadata?.name || "Unknown";
      const email = payment.metadata?.email || "Unknown";
      const amount = payment.amount?.value + " " + payment.amount?.currency;

      const msg = `💰 *New Payment Received!*\n\n👤 Name: ${name}\n📧 Email: ${email}\n💳 Amount: ${amount}\n🕒 Status: ${payment.status}\n🔖 ID: ${payment.id}`;

      const telegramResp = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: msg,
            parse_mode: "Markdown",
          }),
        }
      );

      console.log("Telegram status:", telegramResp.status);
    }

    res.status(200).end(); // always reply 200 to Mollie
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).end();
  }
}
