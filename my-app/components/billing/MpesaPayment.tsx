"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BillingService } from "@/services/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, XCircle, Smartphone } from "lucide-react";
import type { Plan, BillingInterval } from "@/types/billing";

interface MpesaPaymentProps {
  plan: Plan;
  billingInterval: BillingInterval;
  organizationId: string;
}

type Step = "phone" | "waiting" | "success" | "failed";

const COUNTRY_OPTIONS = [
  { code: "KE", label: "Kenya (+254)", prefix: "+254" },
  { code: "TZ", label: "Tanzania (+255)", prefix: "+255" },
  { code: "UG", label: "Uganda (+256)", prefix: "+256" },
  { code: "RW", label: "Rwanda (+250)", prefix: "+250" },
];

export function MpesaPayment({ plan, billingInterval, organizationId }: MpesaPaymentProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("KE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const price = billingInterval === "yearly" ? plan.yearly_price : plan.monthly_price;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError("Enter your M-Pesa phone number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const result = await BillingService.createMpesaCheckout(organizationId, {
        plan_id: plan.id,
        billing_interval: billingInterval,
        phone_number: phoneNumber,
        country_code: countryCode,
      });

      setCheckoutRequestId(result.checkout_request_id);
      setStep("waiting");
      startPolling(result.checkout_request_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (requestId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes at 10s intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep("failed");
        setError("Payment timed out. Please try again.");
        return;
      }

      try {
        const status = await BillingService.pollMpesaStatus(organizationId, requestId);
        if (status.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("success");
        } else if (status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("failed");
          setError(status.message || "Payment was not completed");
        }
      } catch {
        // Continue polling on network errors
      }
    }, 10000);
  };

  if (step === "success") {
    return (
      <Card className="border border-border">
        <CardContent className="py-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <div>
            <p className="font-medium">Payment successful</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your {plan.name} subscription is now active.
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/billing")} className="w-full">
            Go to billing
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "waiting") {
    return (
      <Card className="border border-border">
        <CardContent className="py-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-muted-foreground animate-pulse" />
          </div>
          <div>
            <p className="font-medium">Check your phone</p>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your M-Pesa PIN to complete the payment of ${price}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for confirmation...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">M-Pesa Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Country</label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Phone number</label>
            <Input
              type="tel"
              placeholder="07XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{plan.name} ({billingInterval})</span>
            <span className="font-medium">${price}</span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={loading || !organizationId} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending STK push...
          </>
        ) : (
          `Pay $${price} with M-Pesa`
        )}
      </Button>

      {step === "failed" && (
        <Button variant="outline" onClick={() => { setStep("phone"); setError(""); }} className="w-full">
          Try again
        </Button>
      )}
    </div>
  );
}
