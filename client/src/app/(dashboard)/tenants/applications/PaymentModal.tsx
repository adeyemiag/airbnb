"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVerifyPaymentMutation } from "@/state/api";
import React, { useEffect, useRef, useState } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  totalPrice: number;
  tenantEmail: string;
  tenantName: string;
  propertyName: string;
}

const PAYSTACK_PUBLIC_KEY = "pk_test_39e64ac1351bb68853f9dade90a0aa395b6a8392";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaymentModal = ({
  isOpen,
  onClose,
  applicationId,
  totalPrice,
  tenantEmail,
  tenantName,
  propertyName,
}: PaymentModalProps) => {
  const [verifyPayment, { isLoading }] = useVerifyPaymentMutation();
  const [scriptReady, setScriptReady] = useState(false);
  const attempts = useRef(0);

  useEffect(() => {
    const check = () => {
      if (window.PaystackPop) {
        setScriptReady(true);
        return;
      }
      attempts.current += 1;
      if (attempts.current > 20) return;
      setTimeout(check, 500);
    };

    if (!document.getElementById("paystack-js")) {
      const script = document.createElement("script");
      script.id = "paystack-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.head.appendChild(script);
    }

    check();
  }, []);

  const handlePayNow = () => {
    if (!window.PaystackPop) {
      alert("Payment system not ready. Please wait a moment and try again.");
      return;
    }

    const amountInKobo = Math.round(totalPrice * 100);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: tenantEmail,
      amount: amountInKobo,
      currency: "NGN",
      ref: `rentiful_${applicationId}_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Tenant Name",
            variable_name: "tenant_name",
            value: tenantName,
          },
          {
            display_name: "Property",
            variable_name: "property_name",
            value: propertyName,
          },
          {
            display_name: "Application ID",
            variable_name: "application_id",
            value: String(applicationId),
          },
        ],
      },
      // FIX: Paystack does not accept async callbacks — use .then() instead
      callback: (response: { reference: string }) => {
        verifyPayment({ reference: response.reference, applicationId })
          .then(() => onClose())
          .catch(() => onClose());
      },
      onClose: () => {},
    });

    handler.openIframe();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-semibold text-gray-700 mb-2">Payment Summary</p>
            <div className="flex justify-between text-gray-600">
              <span>Property</span>
              <span className="font-medium">{propertyName}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tenant</span>
              <span className="font-medium">{tenantName}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 text-base">
              <span>Total Amount</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-700 text-xs">
            🔒 Your payment is secured by Paystack. A popup will open to
            complete your payment.
          </div>

          {!scriptReady && (
            <p className="text-xs text-center text-gray-400 animate-pulse">
              Loading payment system...
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
              onClick={handlePayNow}
              disabled={isLoading || !scriptReady}
            >
              {isLoading
                ? "Verifying..."
                : `Pay ₦${totalPrice.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
