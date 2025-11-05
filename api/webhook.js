export default async function handler(req, res) {
  const MOLLIE_KEY = process.env.MOLLIE_SECRET_KEY;
  const paymentId = req.body?.id;

  try {
    // Get payment details from Mollie
    const paymentRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MOLLIE_KEY}` },
    });
    const payment = await paymentRes.json();

    // Only create subscription after successful initial payment
    if (payment.status === "paid" && payment.sequenceType === "first") {
      // Create a €49 monthly subscription starting in 30 days
      await fetch(`https://api.mollie.com/v2/customers/${payment.customerId}/subscriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MOLLIE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: { value: "49.00", currency: "EUR" },
          interval: "1 month",
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 30 days from now
          description: "Deepak Academy Monthly Subscription",
          webhookUrl: "https://did-int-sub.vercel.app/api/webhook",
        }),
      });
    }

    res.status(200).end(); // acknowledge webhook
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).end();
  }
}
