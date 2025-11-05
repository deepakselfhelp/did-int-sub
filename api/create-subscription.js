export default async function handler(req, res) {
  try {
    const MOLLIE_KEY = process.env.MOLLIE_SECRET_KEY;

    // Create a customer
    const customerResponse = await fetch("https://api.mollie.com/v2/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Deepak Student", email: "student@example.com" }),
    });
    const customer = await customerResponse.json();

    // Create the first payment (mandate)
    const paymentResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { value: "49.00", currency: "EUR" },
        description: "Deepak Academy Subscription",
        redirectUrl: "https://your-success-page.com",
        sequenceType: "first",
        customerId: customer.id,
      }),
    });
    const payment = await paymentResponse.json();

    res.status(200).json({ checkoutUrl: payment._links.checkout.href });
  } catch (err) {
    console.error("Mollie error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
