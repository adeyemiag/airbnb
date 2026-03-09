"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useGetAgreementsQuery,
  useGetPaymentByApplicationQuery,
  useWithdrawApplicationMutation,
} from "@/state/api";
import { Check, CreditCard, Download, FileText, LogOut, X } from "lucide-react";
import { downloadAgreementAsPDF } from "@/lib/downloadAgreement";
import React, { useState } from "react";
import ViewAgreementModal from "./ViewAgreementModal";
import PaymentModal from "./PaymentModal";

const PaymentAwareCard = ({
  application,
  agreement,
  authUser,
  onViewAgreement,
}: any) => {
  const { data: payment } = useGetPaymentByApplicationQuery(application.id);
  const [showPayment, setShowPayment] = useState(false);
  const [withdrawApplication] = useWithdrawApplicationMutation();

  const hasAgreement = !!agreement;
  const agreementPending = agreement?.status === "Pending";
  const agreementSigned = agreement?.status === "Signed";
  const agreementRejected = agreement?.status === "Rejected";
  const isPaid = payment?.paymentStatus === "Paid";
  const canPay =
    application.status === "Approved" && agreementSigned && !isPaid;
  const canWithdraw = application.status === "Pending" && agreementRejected;

  return (
    <>
      <ApplicationCard application={application} userType="renter">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
          {/* Status strip */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {application.status === "Approved" && (
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Rented until{" "}
                {new Date(application.lease?.endDate).toLocaleDateString()}
              </span>
            )}
            {application.status === "Pending" && (
              <span className="text-amber-600 font-medium">
                Application under review
              </span>
            )}
            {application.status === "Denied" && (
              <span className="text-red-600 font-medium flex items-center gap-1.5">
                <X className="w-4 h-4" /> Application denied
              </span>
            )}
            {isPaid && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <Check className="w-3 h-3" /> Payment Received
              </span>
            )}
            {!isPaid &&
              agreementSigned &&
              application.status === "Approved" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">
                  💳 Payment Required
                </span>
              )}
            {hasAgreement && agreementPending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                📋 Review Agreement
              </span>
            )}
            {agreementSigned && !isPaid && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <Check className="w-3 h-3" /> Agreement Signed
              </span>
            )}
            {agreementRejected && application.status === "Pending" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                <X className="w-3 h-3" /> Agreement Rejected — Awaiting new
                agreement
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-wrap">
            {canPay && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors"
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="w-4 h-4" /> Pay Now
              </button>
            )}
            {hasAgreement && !agreementRejected && (
              <button
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                  agreementPending
                    ? "bg-primary-700 text-white border-primary-700 hover:bg-primary-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => onViewAgreement(agreement)}
              >
                <FileText className="w-4 h-4" />
                {agreementPending ? "Review Agreement" : "View Agreement"}
              </button>
            )}
            {canWithdraw && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to withdraw this application?",
                    )
                  ) {
                    withdrawApplication(application.id);
                  }
                }}
              >
                <LogOut className="w-4 h-4" /> Withdraw Application
              </button>
            )}
            <button
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors ${!agreement ? "opacity-40 cursor-not-allowed" : ""}`}
              disabled={!agreement}
              onClick={() => agreement && downloadAgreementAsPDF(agreement)}
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      </ApplicationCard>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          applicationId={application.id}
          totalPrice={application.totalPrice}
          tenantEmail={authUser?.userInfo?.email ?? ""}
          tenantName={authUser?.userInfo?.name ?? ""}
          propertyName={application.property?.name ?? ""}
        />
      )}
    </>
  );
};

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [viewAgreement, setViewAgreement] = useState<any>(null);

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery({
    userId: authUser?.cognitoInfo?.userId,
    userType: "tenant",
  });

  const { data: agreements } = useGetAgreementsQuery(
    { userId: authUser?.cognitoInfo?.userId, userType: "tenant" },
    { skip: !authUser?.cognitoInfo?.userId },
  );

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  const agreementMap = new Map(
    (agreements ?? []).map((a) => [a.applicationId, a]),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <Header
          title="My Applications"
          subtitle="Track and manage your property rental applications"
        />
        {applications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No applications yet</p>
            <p className="text-sm mt-1">
              Search for properties and apply to get started
            </p>
          </div>
        ) : (
          applications.map((application) => (
            <PaymentAwareCard
              key={application.id}
              application={application}
              agreement={agreementMap.get(application.id)}
              authUser={authUser}
              onViewAgreement={setViewAgreement}
            />
          ))
        )}
      </div>

      {viewAgreement && (
        <ViewAgreementModal
          isOpen={!!viewAgreement}
          onClose={() => setViewAgreement(null)}
          agreement={viewAgreement}
        />
      )}
    </div>
  );
};

export default Applications;
