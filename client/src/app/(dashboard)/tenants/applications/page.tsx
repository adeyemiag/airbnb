"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useGetAgreementsQuery,
} from "@/state/api";
import {
  CircleCheckBig,
  Clock,
  Download,
  FileText,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import ViewAgreementModal from "./ViewAgreementModal";

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
          const hasAgreement = !!agreement;
          const agreementPending = agreement?.status === "Pending";
          const agreementSigned = agreement?.status === "Signed";

          return (
            <ApplicationCard
              key={application.id}
              application={application}
              userType="renter"
            >
              <div className="flex justify-between gap-5 w-full pb-4 px-4">
                {/* Status banner */}
                {application.status === "Approved" ? (
                  <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                    <CircleCheckBig className="w-5 h-5 mr-2" />
                    The property is being rented by you until{" "}
                    {new Date(application.lease?.endDate).toLocaleDateString()}
                  </div>
                ) : application.status === "Pending" ? (
                  <div className="bg-yellow-100 p-4 text-yellow-700 grow flex flex-wrap items-center gap-2">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span>Your application is pending approval.</span>
                    {/* Agreement notification */}
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
                <div className="flex gap-2">
                  {/* View Agreement button — show if agreement exists */}
                  {hasAgreement && (
                    <button
                      className={`py-2 px-4 rounded-md flex items-center justify-center border text-sm
                        ${
                          agreementPending
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-500"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-primary-700 hover:text-primary-50"
                        }`}
                      onClick={() => setViewAgreement(agreement)}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      {agreementPending ? "Review Agreement" : "View Agreement"}
                    </button>
                  )}

                  <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50">
                    <Download className="w-5 h-5 mr-2" />
                    Download Agreement
                  </button>
                </div>
              </div>
            </ApplicationCard>
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
