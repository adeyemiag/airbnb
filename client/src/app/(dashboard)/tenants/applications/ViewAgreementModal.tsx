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
  const totalPrice = application?.totalPrice?.toFixed(2) ?? "—";

  const handleAccept = async () => {
    await updateStatus({ id: agreement.id, status: "Signed" });
    onClose();
  };

  const handleReject = async () => {
    await updateStatus({ id: agreement.id, status: "Rejected" });
    onClose();
  };

  const isSigned = agreement.status === "Signed";
  const isRejected = agreement.status === "Rejected";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rental Agreement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Status banner */}
          {isSigned && (
            <div className="bg-green-100 text-green-700 rounded-md p-3 text-sm font-medium">
              ✅ You have signed this agreement.
            </div>
          )}
          {isRejected && (
            <div className="bg-red-100 text-red-700 rounded-md p-3 text-sm font-medium">
              ❌ You rejected this agreement.
            </div>
          )}

          {/* Agreement details */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
            <p className="font-semibold text-gray-700 mb-2">
              Agreement Details
            </p>
            <div className="flex justify-between text-gray-600">
              <span>Property</span>
              <span className="font-medium">{property?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Location</span>
              <span className="font-medium">
                {property?.location?.city}, {property?.location?.country}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Check-in</span>
              <span className="font-medium">{startDate}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Check-out</span>
              <span className="font-medium">{endDate}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total Price</span>
              <span>₦{totalPrice}</span>
            </div>
          </div>

          {/* Custom terms from manager */}
          {agreement.customTerms && (
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-semibold text-gray-700 mb-2">
                Additional Terms from Manager
              </p>
              <p className="text-gray-600 whitespace-pre-wrap">
                {agreement.customTerms}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Agreement sent on {new Date(agreement.sentAt).toLocaleDateString()}
            {agreement.signedAt &&
              ` · Signed on ${new Date(agreement.signedAt).toLocaleDateString()}`}
          </p>

          {/* Checkbox + actions — only shown if still pending */}
          {!isSigned && !isRejected && (
            <>
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(val) => setAgreed(!!val)}
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
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-primary-700 text-white"
                  onClick={handleAccept}
                  disabled={!agreed || isLoading}
                >
                  {isLoading ? "Saving..." : "Accept Agreement"}
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
