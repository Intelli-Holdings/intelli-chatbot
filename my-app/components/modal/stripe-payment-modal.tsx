"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Lock, Info, Shield } from 'lucide-react';

interface PaymentMethodFormProps {
  onSuccess: (paymentMethod: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSuccess,
  onCancel,
  loading,
}) => {
  
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [addressLine1, setAddressLine1] = useState('');
  const [activeTab, setActiveTab] = useState('card');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  
  // Google Pay states
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [googlePayLoading, setGooglePayLoading] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) { // MM/YY
      setExpiryDate(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  // Check if Google Pay is available
  useEffect(() => {
    const checkGooglePayAvailability = () => {
      // Simulate Google Pay availability check
      const isAvailable = typeof window !== 'undefined' && 
                         'PaymentRequest' in window &&
                         window.navigator.userAgent.includes('Chrome');
      setGooglePayAvailable(isAvailable);
    };
    
    checkGooglePayAvailability();
  }, []);

  const handleGooglePayPayment = async () => {
    setGooglePayLoading(true);
    setError(null);

    try {
      // Simulate Google Pay payment flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockGooglePayMethod = {
        id: `pm_google_${Date.now()}`,
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
        billing_details: {
          name: fullName || 'Google Pay User',
          address: {
            line1: addressLine1,
            country: country === 'Uganda' ? 'UG' : country,
          },
        },
        google_pay: true,
      };

      onSuccess(mockGooglePayMethod);
    } catch (err) {
      setError('Google Pay payment failed. Please try again.');
      setGooglePayLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate required fields
    if (!cardNumber || !expiryDate || !cvc || !fullName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate card number (basic check)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      setError('Please enter a valid card number');
      return;
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/');
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      setError('Please enter a valid expiry date');
      return;
    }

    // Validate CVC
    if (cvc.length < 3 || cvc.length > 4) {
      setError('Please enter a valid security code');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // For demo purposes, create a mock payment method
      const mockPaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        card: {
          brand: cardNumber.startsWith('4') ? 'visa' : 'mastercard',
          last4: cleanCardNumber.slice(-4),
          exp_month: parseInt(month),
          exp_year: parseInt(`20${year}`),
        },
        billing_details: {
          name: fullName,
          address: {
            line1: addressLine1,
            country: country === 'Uganda' ? 'UG' : country,
          },
        },
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSuccess(mockPaymentMethod);
      
    } catch (err) {
      setError('Failed to process payment method');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a Card</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Add your credit card details below for current Organization.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          CVC and postal codes must match the card issuer&apos;s records.
        </p>
      </div>

      {/* Payment Method Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card
          </TabsTrigger>
          <TabsTrigger value="googlepay" className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            Google Pay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Card Number</Label>
                <div className="mt-1 relative">
                  <Input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className="pr-20"
                    maxLength={19}
                  />
                  {/* Card Icons */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                  <div className="mt-1">
                    <Input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Security Code (CVC)
                    <div className="relative group">
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          3-digit code on back of card
                        </div>
                      </div>
                    </div>
                  </Label>
                  <div className="mt-1">
                    <Input
                      type="text"
                      value={cvc}
                      onChange={handleCvcChange}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 mr-2" />
                <p className="text-xs text-blue-800">
                  By providing your card info, you authorize Intelli Holdings to charge your card for future payments in accordance with the terms and conditions of using our software.
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
                Billing Information
              </h3>
              
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
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

              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                  Country or Region
                </Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter your country"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Enter your address"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
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
                disabled={processing || loading || !fullName.trim() || !cardNumber || !expiryDate || !cvc}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {processing || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>

            {/* Security Footer */}
            <div className="flex items-center justify-center pt-4 text-xs text-gray-500">
              <Lock className="w-3 h-3 mr-1" />
              Secured by Stripe
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Google Pay Not Available</h3>
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
                      Full Name
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

                  <div>
                    <Label htmlFor="googlePayCountry" className="text-sm font-medium text-gray-700">
                      Country or Region
                    </Label>
                    <Input
                      id="googlePayCountry"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter your country"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="googlePayAddress" className="text-sm font-medium text-gray-700">
                      Address Line 1
                    </Label>
                    <Input
                      id="googlePayAddress"
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="Enter your address"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Terms Notice for Google Pay */}
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex">
                    <Shield className="w-4 h-4 text-green-400 mt-0.5 mr-2" />
                    <p className="text-xs text-green-800">
                      By using Google Pay, you agree to Google&apos;s Terms of Service and acknowledge Intelli Holdings&apos; payment terms.
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Google Pay Button */}
                <div className="space-y-4">
                  <Button
                    onClick={handleGooglePayPayment}
                    disabled={googlePayLoading || loading || !fullName.trim()}
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
                  Secured by Google Pay
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
  onSuccess: (paymentMethod: any) => void;
  loading?: boolean;
}

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loading = false,
}) => {
  return (
    <Modal
      title=""
      description=""
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="p-6">
        <PaymentMethodForm
          onSuccess={onSuccess}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </Modal>
  );
};

export default StripePaymentModal;
