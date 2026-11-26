import { NextRequest, NextResponse } from 'next/server';

const PLAN_CONFIG = {
  monthly_regular: {
    name: 'DriveCost Pro Monthly',
    amount: 9900, // ₹99 in paise
    period: 'monthly',
    interval: 1,
    total_count: 120,
  },
  monthly_promo: {
    name: 'DriveCost Pro Monthly (25% Welcome Offer)',
    amount: 7400, // ₹74 in paise
    period: 'monthly',
    interval: 1,
    total_count: 120,
  },
  yearly_regular: {
    name: 'DriveCost Pro Annual',
    amount: 99900, // ₹999 in paise
    period: 'yearly',
    interval: 1,
    total_count: 10,
  },
  yearly_promo: {
    name: 'DriveCost Pro Annual (25% Welcome Offer)',
    amount: 74900, // ₹749 in paise
    period: 'yearly',
    interval: 1,
    total_count: 10,
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay server credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const billingCycle = body?.billingCycle === 'monthly' ? 'monthly' : 'yearly';
    const isOfferActivated = Boolean(body?.isOfferActivated);

    const planKey = `${billingCycle}_${isOfferActivated ? 'promo' : 'regular'}` as keyof typeof PLAN_CONFIG;
    const config = PLAN_CONFIG[planKey];

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

    // 1. Find existing matching plan or create one
    const plansRes = await fetch('https://api.razorpay.com/v1/plans?count=50', {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });

    if (!plansRes.ok) {
      const errText = await plansRes.text();
      return NextResponse.json({ error: `Failed to fetch Razorpay plans: ${errText}` }, { status: 502 });
    }

    const plansData = await plansRes.json();
    let planId: string | undefined = plansData?.items?.find(
      (p: any) =>
        p?.period === config.period &&
        p?.interval === config.interval &&
        p?.item?.amount === config.amount &&
        p?.item?.currency === 'INR'
    )?.id;

    if (!planId) {
      const createPlanRes = await fetch('https://api.razorpay.com/v1/plans', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: config.period,
          interval: config.interval,
          item: {
            name: config.name,
            amount: config.amount,
            currency: 'INR',
            description: `${config.name} AutoPay Subscription`,
          },
        }),
      });

      if (!createPlanRes.ok) {
        const errText = await createPlanRes.text();
        return NextResponse.json({ error: `Failed to create Razorpay plan: ${errText}` }, { status: 502 });
      }

      const createdPlan = await createPlanRes.json();
      planId = createdPlan.id;
    }

    // 2. Create Razorpay Subscription
    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: config.total_count,
        quantity: 1,
        customer_notify: 1,
      }),
    });

    if (!subRes.ok) {
      const errText = await subRes.text();
      return NextResponse.json({ error: `Failed to create Razorpay subscription: ${errText}` }, { status: 502 });
    }

    const subscription = await subRes.json();

    return NextResponse.json({
      subscription_id: subscription.id,
      plan_id: planId,
      key: keyId,
    });
  } catch (err: any) {
    console.error('Razorpay subscription route error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
