import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from "@/lib/logger";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined. Please add your Stripe secret key to the environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethodId, customerId } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Attach payment method to customer
    if (customerId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    }

    // Retrieve the payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return NextResponse.json({
      success: true,
      paymentMethod,
    });

  } catch (error) {
    logger.error('Error in payment method API', { error: error instanceof Error ? error.message : String(error) });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Retrieve customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods.data,
    });

  } catch (error) {
    logger.error('Error retrieving payment methods', { error: error instanceof Error ? error.message : String(error) });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('paymentMethodId');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    });

  } catch (error) {
    logger.error('Error removing payment method', { error: error instanceof Error ? error.message : String(error) });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}
