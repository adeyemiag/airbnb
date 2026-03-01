"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useGetAgreementsQuery,
  useGetPaymentByApplicationQuery,
} from "@/state/api";
import {
  CircleCheckBig,
  Clock,
  CreditCard,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import { downloadAgreementAsPDF } from "@/lib/downloadAgreement";
import React, { useState } from "react";
import ViewAgreementModal from "./ViewAgreementModal";
import PaymentModal from "./PaymentModal";

// Wrapper to fetch payment per application
const PaymentAwareCard = ({
  application,
  agreement,
  authUser,
  onViewAgreement,
}: any) => {
  const { data: payment } = useGetPaymentByApplicationQuery(application.id);
  const [showPayment, setShowPayment] = useState(false);

  const hasAgreement = !!agreement;
  const agreementPending = agreement?.status === "Pending";
  const agreementSigned = agreement?.status === "Signed";
  const isPaid = payment?.paymentStatus === "Paid";
  const canPay =
    application.status === "Approved" && agreementSigned && !isPaid;

  return (
    <>
      <ApplicationCard
        key={application.id}
        application={application}
        userType="renter"
      >
        <div className="flex justify-between gap-5 w-full pb-4 px-4">
          {/* Status banner */}
          {application.status === "Approved" ? (
            <div className="bg-green-100 p-4 text-green-700 grow flex flex-wrap items-center gap-2">
              <CircleCheckBig className="w-5 h-5 flex-shrink-0" />
              <span>
                The property is being rented by you until{" "}
                {new Date(application.lease?.endDate).toLocaleDateString()}
              </span>
              {isPaid && (
                <span className="px-2 py-0.5 bg-green-700 text-white text-xs rounded-full">
                  ✓ Payment Received
                </span>
              )}
              {!isPaid && agreementSigned && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full animate-pulse">
                  💳 Payment Required
                </span>
              )}
            </div>
          ) : application.status === "Pending" ? (
            <div className="bg-yellow-100 p-4 text-yellow-700 grow flex flex-wrap items-center gap-2">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span>Your application is pending approval.</span>
              {hasAgreement && agreementPending && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full animate-pulse">
                  📋 Agreement waiting — please review!
                </span>
              )}
              {agreementSigned && (
                <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  Agreement Signed ✓
                </span>
              )}
            </div>
          ) : (
            <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Your application has been denied
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 flex-wrap justify-end">
            {/* Pay Now button */}
            {canPay && (
              <button
                className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-green-500 text-sm font-medium"
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </button>
            )}

            {/* View Agreement */}
            {hasAgreement && (
              <button
                className={`py-2 px-4 rounded-md flex items-center justify-center border text-sm
                  ${
                    agreementPending
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-primary-700 hover:text-primary-50"
                  }`}
                onClick={() => onViewAgreement(agreement)}
              >
                <FileText className="w-5 h-5 mr-2" />
                {agreementPending ? "Review Agreement" : "View Agreement"}
              </button>
            )}

            {/* Download Agreement */}
            <button
              className={`bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 ${!agreement ? "opacity-40 cursor-not-allowed" : ""}`}
              disabled={!agreement}
              onClick={() => agreement && downloadAgreementAsPDF(agreement)}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Agreement
            </button>
          </div>
        </div>
      </ApplicationCard>

      {/* Payment Modal */}
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
    <div className="dashboard-container ml-60 px-16 py-12">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      <div className="w-full">
        {applications?.map((application) => {
          const agreement = agreementMap.get(application.id);
          return (
            <PaymentAwareCard
              key={application.id}
              application={application}
              agreement={agreement}
              authUser={authUser}
              onViewAgreement={setViewAgreement}
            />
          );
        })}
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
