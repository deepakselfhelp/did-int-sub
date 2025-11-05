export default async function handler(req, res) {
  const MOLLIE_KEY = process.env.MOLLIE_SECRET_KEY;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    const paymentId = req.body?.id;
    if (!paymentId) return res.status(400).end("Missing id");

    // 1️⃣ Get payment details from Mollie
    const r = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MOLLIE_KEY}` }
    });
    const payment = await r.json();

    if (payment.status === "paid") {
      const name = payment.metadata?.name || "Unknown";
      const email = payment.metadata?.email || "Unknown";
      const amount = payment.amount?.value + " " + payment.amount?.currency;

      const msg = `💰 *New Payment Received!*\n\n👤 Name: ${name}\n📧 Email: ${email}\n💳 Amount: ${amount}\n🕒 Status: ${payment.status}\n🔖 ID: ${payment.id}`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: msg,
          parse_mode: "Markdown"
        })
      });
    }

    res.status(200).end(); // acknowledge to Mollie
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).end();
  }
}
