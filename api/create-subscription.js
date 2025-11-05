export default async function handler(req, res) {
  try {
    const MOLLIE_KEY = process.env.MOLLIE_SECRET_KEY;
    const { name, email } = req.body;

    // 1️⃣ Create a customer
    const cust = await fetch("https://api.mollie.com/v2/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });
    const customer = await cust.json();

    // 2️⃣ Create a payment
    const pay = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: { value: "49.00", currency: "EUR" },
        description: "Deepak Academy Pro Membership",
        redirectUrl: "https://did-int-sub.vercel.app/success.html",
        webhookUrl: "https://did-int-sub.vercel.app/api/webhook",
        customerId: customer.id,
        metadata: { name, email }
      })
    });

    const payment = await pay.json();
    res.status(200).json({ checkoutUrl: payment._links.checkout.href });
  } catch (err) {
    console.error("Create payment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
