"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Agreement, useUpdateAgreementStatusMutation } from "@/state/api";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import React, { useState } from "react";

interface ViewAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement;
}

const ViewAgreementModal = ({
  isOpen,
  onClose,
  agreement,
}: ViewAgreementModalProps) => {
  const [agreed, setAgreed] = useState(false);
  const [updateStatus, { isLoading }] = useUpdateAgreementStatusMutation();

  const application = agreement.application;
  const property = application?.property;
  const startDate = application?.startDate
    ? new Date(application.startDate).toLocaleDateString()
    : "—";
  const endDate = application?.endDate
    ? new Date(application.endDate).toLocaleDateString()
    : "—";
  const totalPrice = application?.totalPrice?.toLocaleString() ?? "—";

  const isSigned = agreement.status === "Signed";
  const isRejected = agreement.status === "Rejected";

  const rows = [
    { label: "Property", value: property?.name ?? "—" },
    {
      label: "Location",
      value: property?.location
        ? `${property.location.city}, ${property.location.country}`
        : "—",
    },
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
              Rental Agreement
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 text-sm mt-2">
          {isSigned && (
            <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 rounded-xl p-3 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> You have signed
              this agreement.
            </div>
          )}
          {isRejected && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-600 rounded-xl p-3 text-sm font-medium">
              <XCircle className="w-5 h-5 flex-shrink-0" /> You rejected this
              agreement.
            </div>
          )}

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

          {agreement.customTerms && (
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Additional Terms
              </p>
              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                {agreement.customTerms}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Sent on {new Date(agreement.sentAt).toLocaleDateString()}
            {agreement.signedAt &&
              ` · Signed on ${new Date(agreement.signedAt).toLocaleDateString()}`}
          </p>

          {!isSigned && !isRejected && (
            <>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(val) => setAgreed(!!val)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="agree"
                  className="text-sm text-gray-700 cursor-pointer leading-snug"
                >
                  I have read and agree to the terms of this rental agreement,
                  including the stay dates and total price stated above.
                </label>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                  onClick={async () => {
                    await updateStatus({
                      id: agreement.id,
                      status: "Rejected",
                    });
                    onClose();
                  }}
                  disabled={isLoading}
                >
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-primary-700 text-white rounded-xl hover:bg-primary-600"
                  onClick={async () => {
                    await updateStatus({ id: agreement.id, status: "Signed" });
                    onClose();
                  }}
                  disabled={!agreed || isLoading}
                >
                  {isLoading ? "Saving..." : "Accept & Sign"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAgreementModal;
