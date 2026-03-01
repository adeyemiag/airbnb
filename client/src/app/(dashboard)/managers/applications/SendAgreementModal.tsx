"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateAgreementMutation } from "@/state/api";
import { Application } from "@/types/prismaTypes";
import React, { useState } from "react";

interface SendAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application & {
    property?: any;
    tenant?: any;
  };
}

const SendAgreementModal = ({
  isOpen,
  onClose,
  application,
}: SendAgreementModalProps) => {
  const [customTerms, setCustomTerms] = useState("");
  const [createAgreement, { isLoading }] = useCreateAgreementMutation();

  const startDate = new Date(application.startDate).toLocaleDateString();
  const endDate = new Date(application.endDate).toLocaleDateString();
  const totalPrice = application.totalPrice?.toFixed(2) ?? "—";

  const handleSend = async () => {
    await createAgreement({
      applicationId: application.id,
      customTerms: customTerms.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Agreement to Tenant</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Auto-generated summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-semibold text-gray-700 mb-2">
              Auto-generated Agreement Summary
            </p>
            <div className="flex justify-between text-gray-600">
              <span>Property</span>
              <span className="font-medium">{application.property?.name}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tenant</span>
              <span className="font-medium">{application.tenant?.name}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Check-in</span>
              <span className="font-medium">{startDate}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Check-out</span>
              <span className="font-medium">{endDate}</span>
            </div>
            <div className="flex justify-between text-gray-700 font-bold border-t border-gray-200 pt-2">
              <span>Total Price</span>
              <span>${totalPrice}</span>
            </div>
          </div>

          {/* Custom terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Terms{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={5}
              placeholder="Enter any additional terms or conditions for the tenant..."
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-400">
            Once sent, the tenant will see this agreement and must accept it
            before you can approve their application.
          </p>

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
              className="flex-1 bg-primary-700 text-white"
              onClick={handleSend}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Agreement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendAgreementModal;
