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
import { Check, Download, ExternalLink, Send, X } from "lucide-react";
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

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  const filteredApplications = applications.filter((app) =>
    activeTab === "all" ? true : app.status.toLowerCase() === activeTab,
  );

  const agreementMap = new Map(
    (agreements ?? []).map((a) => [a.applicationId, a]),
  );

  const tabs = ["all", "pending", "approved", "denied"];
  const tabCounts = tabs.reduce(
    (acc, tab) => {
      acc[tab] =
        tab === "all"
          ? applications.length
          : applications.filter((a) => a.status.toLowerCase() === tab).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <Header
          title="Applications"
          subtitle="Review and manage rental applications for your properties"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg capitalize text-sm font-medium data-[state=active]:bg-primary-700 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2"
              >
                {tab}
                <span className="ml-2 text-xs bg-gray-100 data-[state=active]:bg-primary-600 px-1.5 py-0.5 rounded-full">
                  {tabCounts[tab]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-medium">No applications found</p>
                  <p className="text-sm mt-1">
                    Applications will appear here once tenants apply
                  </p>
                </div>
              ) : (
                filteredApplications.map((application) => {
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
                        {/* Status info */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span>
                            Applied{" "}
                            {new Date(
                              application.applicationDate,
                            ).toLocaleDateString()}
                          </span>
                          {agreementSigned && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                              <Check className="w-3 h-3" /> Agreement Signed
                            </span>
                          )}
                          {agreementSent &&
                            !agreementSigned &&
                            !agreementRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Awaiting Tenant Signature
                              </span>
                            )}
                          {agreementRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              <X className="w-3 h-3" /> Agreement Rejected
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href={`/managers/properties/${application.property.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            scroll={false}
                          >
                            <ExternalLink className="w-4 h-4" /> Property
                          </Link>

                          {application.status === "Pending" &&
                            !agreementSent && (
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-xl hover:bg-primary-600 transition-colors"
                                onClick={() =>
                                  setSendAgreementApplication(application)
                                }
                              >
                                <Send className="w-4 h-4" /> Send Agreement
                              </button>
                            )}

                          {application.status === "Pending" &&
                            agreementSigned && (
                              <>
                                <button
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors"
                                  onClick={() =>
                                    updateApplicationStatus({
                                      id: application.id,
                                      status: "Approved",
                                    })
                                  }
                                >
                                  <Check className="w-4 h-4" /> Approve
                                </button>
                                <button
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors"
                                  onClick={() =>
                                    updateApplicationStatus({
                                      id: application.id,
                                      status: "Denied",
                                    })
                                  }
                                >
                                  <X className="w-4 h-4" /> Deny
                                </button>
                              </>
                            )}

                          {application.status === "Approved" && (
                            <button
                              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors ${!agreement ? "opacity-40 cursor-not-allowed" : ""}`}
                              disabled={!agreement}
                              onClick={() =>
                                agreement && downloadAgreementAsPDF(agreement)
                              }
                            >
                              <Download className="w-4 h-4" /> Download
                              Agreement
                            </button>
                          )}
                        </div>
                      </div>
                    </ApplicationCard>
                  );
                })
              )}
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
