import Razorpay from 'razorpay';

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      amount,
      campaignId,
      fullName,
      email,
      mobile,
      address,
      nationality,
      donationType,
      panNumber,
      taxBenefitOptIn,
      source,
    } = body;

    if (!amount || !fullName || !email || !mobile || !nationality) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1️⃣ Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 2️⃣ Create order in Razorpay
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR', // Change to INR or your currency
      receipt: `receipt_${Date.now()}`,
      notes: {
        full_name: fullName,
        email: email,
        phone: mobile,
        address: address,
        nationality: nationality,
        campaign_id: campaignId,
        selected_amount: amount,
        donation_type: donationType || 'one_time',
        pan_number: panNumber || '',
        tax_benefit_opt_in: taxBenefitOptIn ? 'true' : 'false',
        source: source || 'website',
      },
    };

    const order = await razorpay.orders.create(options);

    return new Response(JSON.stringify({ orderId: order.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Razorpay error:', err);
    return new Response(JSON.stringify({ message: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
