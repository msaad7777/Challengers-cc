import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey);
}

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    // Parse items from metadata
    let items: { name: string; amount: number }[] = [];
    try {
      if (session.metadata?.items) {
        items = JSON.parse(session.metadata.items);
      }
    } catch (e) {
      // If parsing fails, try to get items from line_items
      if (session.line_items?.data) {
        items = session.line_items.data.map((item) => ({
          name: item.description || 'Payment',
          amount: (item.amount_total || 0) / 100,
        }));
      }
    }

    const paymentDetails = {
      id: session.id,
      amount: session.amount_total || 0,
      currency: session.currency || 'cad',
      customerEmail: session.customer_email || session.customer_details?.email || '',
      customerName: session.metadata?.customer_name || session.customer_details?.name || '',
      items: items,
      created: session.created,
      status: session.payment_status,
    };

    return NextResponse.json(paymentDetails);
  } catch (error) {
    console.error('Error fetching payment details:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}
