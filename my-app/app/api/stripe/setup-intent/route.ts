import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    let customer = customerId;

    // Create customer if not provided
    if (!customer) {
      const newCustomer = await stripe.customers.create({
        metadata: {
          // Add any relevant metadata
        },
      });
      customer = newCustomer.id;
    }

    // Create setup intent for future payments
    const setupIntent = await stripe.setupIntents.create({
      customer,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId: customer,
    });

  } catch (error) {
    console.error('Error creating setup intent:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}
