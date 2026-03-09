"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVerifyPaymentMutation } from "@/state/api";
import { CreditCard, Lock } from "lucide-react";
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
      alert("Payment system not ready. Please try again.");
      return;
    }
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: tenantEmail,
      amount: Math.round(totalPrice * 100),
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
      <DialogContent className="bg-white max-w-md rounded-2xl border border-gray-100 shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-700" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Complete Payment
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 text-sm mt-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Payment Summary
            </p>
            {[
              { label: "Property", value: propertyName },
              { label: "Tenant", value: tenantName },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-400 text-xs">Total Amount</span>
              <span className="font-bold text-gray-900 text-xl">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-700 text-xs">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>Your payment is secured and encrypted by Paystack</span>
          </div>

          {!scriptReady && (
            <p className="text-xs text-center text-gray-400 animate-pulse">
              Initializing payment system...
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-gray-200 text-gray-600"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
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
