"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Lock, Info, Shield, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethodData {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: {
    name: string;
    address: {
      line1?: string;
      country?: string;
    };
  };
}

interface PaymentMethodFormProps {
  onSuccess: (paymentMethod: PaymentMethodData) => void;
  onCancel: () => void;
  loading: boolean;
  customerId?: string;
}

// Card styling for Stripe Elements
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSuccess,
  onCancel,
  loading,
  customerId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('US');
  const [addressLine1, setAddressLine1] = useState('');
  const [activeTab, setActiveTab] = useState('card');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  
  // Google Pay states
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [googlePayLoading, setGooglePayLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  const processSetupIntent = useCallback(async (paymentMethodId: string) => {
    try {
      // Attach payment method to customer and retrieve details
      const response = await fetch('/api/stripe/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          customerId: customerId,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to save payment method');
      }

      onSuccess({
        id: data.paymentMethod.id,
        type: data.paymentMethod.type,
        card: data.paymentMethod.card,
        billing_details: data.paymentMethod.billing_details,
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save payment method');
    }
  }, [customerId, onSuccess]);

  // Initialize setup intent and payment request
  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Create setup intent
        const response = await fetch('/api/stripe/setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: customerId,
          }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        setClientSecret(data.clientSecret);

        // Initialize Google Pay if Stripe is loaded
        if (stripe) {
          const pr = stripe.paymentRequest({
            country: 'US',
            currency: 'usd',
            total: {
              label: 'Setup Payment Method',
              amount: 0, // $0 for setup
            },
            requestPayerName: true,
            requestPayerEmail: false,
          });

          // Check if Google Pay is available
          pr.canMakePayment().then((result) => {
            if (result && result.googlePay) {
              setGooglePayAvailable(true);
              setPaymentRequest(pr);
            }
          });

          // Handle payment method creation
          pr.on('paymentmethod', async (ev) => {
            setGooglePayLoading(true);
            
            try {
              const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
                clientSecret!,
                {
                  payment_method: ev.paymentMethod.id,
                }
              );

              if (stripeError) {
                ev.complete('fail');
                throw new Error(stripeError.message);
              }

              ev.complete('success');
              
              // Process the setup intent
              await processSetupIntent(setupIntent.payment_method as string);
              
            } catch (err) {
              ev.complete('fail');
              setError(err instanceof Error ? err.message : 'Google Pay failed');
              setGooglePayLoading(false);
            }
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    };

    if (stripe) {
      initializePayment();
    }
  }, [stripe, customerId, clientSecret, processSetupIntent]);

  const handleCardSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      setError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card information');
      return;
    }

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: fullName,
          address: {
            line1: addressLine1,
            country: country,
          },
        },
      });

      if (createError) {
        throw new Error(createError.message);
      }

      // Confirm setup intent
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Process the setup intent
      await processSetupIntent(paymentMethod.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
      setProcessing(false);
    }
  };

  const handleGooglePayClick = () => {
    if (paymentRequest && !fullName.trim()) {
      setError('Please enter your full name before using Google Pay');
      return;
    }
    
    setError(null);
    paymentRequest?.show();
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Payment Method</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Add a secure payment method for billing and subscriptions.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your payment information is encrypted and securely stored.
        </p>
      </div>

      {/* Payment Method Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card
          </TabsTrigger>
          <TabsTrigger value="googlepay" className="flex items-center gap-2" disabled={!googlePayAvailable}>
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            Google Pay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="mt-6">
          <form onSubmit={handleCardSubmit} className="space-y-6">
            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Billing Information
              </h3>
              
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country *
                  </Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="UG">Uganda</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="KE">Kenya</option>
                    <option value="TZ">Tanzania</option>
                    <option value="RW">Rwanda</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Card Details
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Card Information *
                  <div className="relative group">
                    <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        Enter card number, expiry, and CVC
                      </div>
                    </div>
                  </div>
                </Label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md">
                  <CardElement
                    options={cardElementOptions}
                    onChange={(event) => {
                      setCardComplete(event.complete);
                      if (event.error) {
                        setError(event.error.message);
                      } else {
                        setError(null);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 mr-2" />
                <p className="text-xs text-blue-800">
                  Your payment information is encrypted and securely processed by Stripe. 
                  We never store your card details on our servers.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing || loading}
                className="px-6"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={processing || loading || !cardComplete || !fullName.trim() || !clientSecret}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {processing || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Payment Method'
                )}
              </Button>
            </div>

            {/* Security Footer */}
            <div className="flex items-center justify-center pt-4 text-xs text-gray-500">
              <Lock className="w-3 h-3 mr-1" />
              Secured by Stripe • PCI DSS Compliant
            </div>
          </form>
        </TabsContent>

        <TabsContent value="googlepay" className="mt-6">
          <div className="space-y-6">
            {!googlePayAvailable ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Google Pay Unavailable</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Google Pay is not available in your browser or region. Please use the Card option instead.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('card')}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Use Card Instead
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Google Pay Header */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">G</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Pay with Google Pay</h3>
                  <p className="text-sm text-gray-600">
                    Quick and secure payment using your saved Google Pay methods
                  </p>
                </div>

                {/* Billing Information for Google Pay */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Billing Information
                  </h4>
                  
                  <div>
                    <Label htmlFor="googlePayFullName" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="googlePayFullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                {/* Security Notice for Google Pay */}
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex">
                    <Shield className="w-4 h-4 text-green-400 mt-0.5 mr-2" />
                    <p className="text-xs text-green-800">
                      Google Pay provides additional security layers and fraud protection for your transactions.
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Google Pay Button */}
                <div className="space-y-4">
                  <Button
                    onClick={handleGooglePayClick}
                    disabled={googlePayLoading || loading || !fullName.trim() || !paymentRequest}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center gap-3"
                  >
                    {googlePayLoading || loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">G</span>
                        </div>
                        Pay with Google Pay
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={onCancel}
                      disabled={googlePayLoading || loading}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                {/* Security Footer */}
                <div className="flex items-center justify-center pt-4 text-xs text-gray-500">
                  <Lock className="w-3 h-3 mr-1" />
                  Secured by Google Pay & Stripe
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: PaymentMethodData) => void;
  loading?: boolean;
  customerId?: string;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loading = false,
  customerId,
}) => {
  return (
    <Modal
      title=""
      description=""
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="p-6">
        <Elements stripe={stripePromise}>
          <PaymentMethodForm
            onSuccess={onSuccess}
            onCancel={onClose}
            loading={loading}
            customerId={customerId}
          />
        </Elements>
      </div>
    </Modal>
  );
};

export default StripePaymentModal;
