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
import { FileText } from "lucide-react";
import React, { useState } from "react";

interface SendAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application & { property?: any; tenant?: any };
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
  const totalPrice = application.totalPrice?.toLocaleString() ?? "—";

  const handleSend = async () => {
    await createAgreement({
      applicationId: application.id,
      customTerms: customTerms.trim() || undefined,
    });
    onClose();
  };

  const rows = [
    { label: "Property", value: application.property?.name },
    { label: "Tenant", value: application.tenant?.name },
    { label: "Check-in", value: startDate },
    { label: "Check-out", value: endDate },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-700" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Send Agreement
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 text-sm mt-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-400 text-xs">Total Price</span>
              <span className="font-bold text-gray-900 text-base">
                ₦{totalPrice}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Additional Terms{" "}
              <span className="font-normal normal-case text-gray-400">
                (optional)
              </span>
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
              rows={4}
              placeholder="Add any special conditions or requirements..."
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 border border-gray-100">
            📋 The tenant will review and sign this agreement before you can
            approve their application.
          </p>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary-700 text-white rounded-xl hover:bg-primary-600"
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
