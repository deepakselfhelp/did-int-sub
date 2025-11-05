export default async function handler(req, res) {
  try {
    const MOLLIE_KEY = process.env.MOLLIE_SECRET_KEY;
    const { email } = req.body;

    // Create a customer in Mollie
    const customerRes = await fetch("https://api.mollie.com/v2/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Deepak Student", email }),
    });
    const customer = await customerRes.json();

    // Create the payment and attach email to metadata
    const paymentRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { value: "49.00", currency: "EUR" },
        description: "Deepak Academy Subscription",
        redirectUrl: "https://did-int-sub.vercel.app/success.html",
        cancelUrl: "https://did-int-sub.vercel.app/failed.html",
        webhookUrl: "https://did-int-sub.vercel.app/api/webhook",
        sequenceType: "first",
        customerId: customer.id,
        metadata: { email }, // 🟢 store user email
      }),
    });
    const payment = await paymentRes.json();

    res.status(200).json({ checkoutUrl: payment._links.checkout.href });
  } catch (err) {
    console.error("Mollie error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
