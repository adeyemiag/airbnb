"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useGetAgreementsQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import { CircleCheckBig, Download, File, Hospital, Send } from "lucide-react";
import { downloadAgreementAsPDF } from "@/lib/downloadAgreement";
import Link from "next/link";
import React, { useState } from "react";
import SendAgreementModal from "./SendAgreementModal";

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState("all");
  const [sendAgreementApplication, setSendAgreementApplication] =
    useState<any>(null);

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    { userId: authUser?.cognitoInfo?.userId, userType: "manager" },
    { skip: !authUser?.cognitoInfo?.userId },
  );

  const { data: agreements } = useGetAgreementsQuery(
    { userId: authUser?.cognitoInfo?.userId, userType: "manager" },
    { skip: !authUser?.cognitoInfo?.userId },
  );

  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  const handleStatusChange = async (id: number, status: string) => {
    await updateApplicationStatus({ id, status });
  };

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;
    return application.status.toLowerCase() === activeTab;
  });

  const agreementMap = new Map(
    (agreements ?? []).map((a) => [a.applicationId, a]),
  );

  return (
    <div className="dashboard-container flex flex-col w-full pt-12 pb-12">
      <div className="w-full max-w-6xl mx-auto transform translate-x-36 px-8">
        <Header
          title="Applications"
          subtitle="View and manage applications for your properties"
        />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full my-5"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="denied">Denied</TabsTrigger>
          </TabsList>

          {["all", "pending", "approved", "denied"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-5 w-full">
              {filteredApplications
                .filter(
                  (application) =>
                    tab === "all" || application.status.toLowerCase() === tab,
                )
                .map((application) => {
                  const agreement = agreementMap.get(application.id);
                  const agreementSent = !!agreement;
                  const agreementSigned = agreement?.status === "Signed";
                  const agreementRejected = agreement?.status === "Rejected";

                  return (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      userType="manager"
                    >
                      <div className="flex justify-between gap-5 w-full pb-4 px-4">
                        <div
                          className={`p-4 grow ${
                            application.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : application.status === "Denied"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <File className="w-5 h-5 flex-shrink-0" />
                            <span>
                              Application submitted on{" "}
                              {new Date(
                                application.applicationDate,
                              ).toLocaleDateString()}
                              .
                            </span>
                            <CircleCheckBig className="w-5 h-5 flex-shrink-0" />
                            <span className="font-semibold">
                              {application.status === "Approved" &&
                                "This application has been approved."}
                              {application.status === "Denied" &&
                                "This application has been denied."}
                              {application.status === "Pending" &&
                                "This application is pending review."}
                            </span>
                            {agreementSigned && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                Agreement Signed ✓
                              </span>
                            )}
                            {agreementSent &&
                              !agreementSigned &&
                              !agreementRejected && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Agreement Sent — Awaiting Tenant
                                </span>
                              )}
                            {agreementRejected && (
                              <span className="px-2 py-0.5 bg-red-200 text-red-700 text-xs rounded-full">
                                Agreement Rejected by Tenant
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap justify-end">
                          <Link
                            href={`/managers/properties/${application.property.id}`}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50"
                            scroll={false}
                          >
                            <Hospital className="w-5 h-5 mr-2" />
                            Property Details
                          </Link>

                          {application.status === "Pending" &&
                            !agreementSent && (
                              <button
                                className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-blue-500"
                                onClick={() =>
                                  setSendAgreementApplication(application)
                                }
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Agreement
                              </button>
                            )}

                          {application.status === "Pending" &&
                            agreementSigned && (
                              <>
                                <button
                                  className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-500"
                                  onClick={() =>
                                    handleStatusChange(
                                      application.id,
                                      "Approved",
                                    )
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-500"
                                  onClick={() =>
                                    handleStatusChange(application.id, "Denied")
                                  }
                                >
                                  Deny
                                </button>
                              </>
                            )}

                          {application.status === "Approved" && (
                            <button
                              className={`bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 ${!agreement ? "opacity-40 cursor-not-allowed" : ""}`}
                              disabled={!agreement}
                              onClick={() =>
                                agreement && downloadAgreementAsPDF(agreement)
                              }
                            >
                              <Download className="w-5 h-5 mr-2" />
                              Download Agreement
                            </button>
                          )}

                          {application.status === "Denied" && (
                            <button className="bg-gray-800 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-secondary-500 hover:text-primary-50">
                              Contact User
                            </button>
                          )}
                        </div>
                      </div>
                    </ApplicationCard>
                  );
                })}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {sendAgreementApplication && (
        <SendAgreementModal
          isOpen={!!sendAgreementApplication}
          onClose={() => setSendAgreementApplication(null)}
          application={sendAgreementApplication}
        />
      )}
    </div>
  );
};

export default Applications;
