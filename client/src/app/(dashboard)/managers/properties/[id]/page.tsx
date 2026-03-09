"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAgreementsQuery,
  useGetAuthUserQuery,
  useGetPaymentsQuery,
  useGetPropertyLeasesQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { downloadAgreementAsPDF } from "@/lib/downloadAgreement";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Mail,
  Phone,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const PropertyTenants = () => {
  const { id } = useParams();
  const propertyId = Number(id);

  const { data: authUser } = useGetAuthUserQuery();
  const { data: property, isLoading: propertyLoading } =
    useGetPropertyQuery(propertyId);
  const { data: leases, isLoading: leasesLoading } =
    useGetPropertyLeasesQuery(propertyId);
  const { data: payments, isLoading: paymentsLoading } =
    useGetPaymentsQuery(propertyId);
  const { data: agreements } = useGetAgreementsQuery(
    { userId: authUser?.cognitoInfo?.userId, userType: "manager" },
    { skip: !authUser?.cognitoInfo?.userId },
  );

  const agreementByTenant = new Map(
    (agreements ?? []).map((a) => [a.tenantCognitoId, a]),
  );

  if (propertyLoading || leasesLoading || paymentsLoading) return <Loading />;

  const getCurrentMonthPaymentStatus = (leaseId: number) => {
    const now = new Date();
    const match = payments?.find(
      (p) =>
        p.leaseId === leaseId &&
        new Date(p.dueDate).getMonth() === now.getMonth() &&
        new Date(p.dueDate).getFullYear() === now.getFullYear(),
    );
    return match?.paymentStatus || "Not Paid";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/managers/properties"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          scroll={false}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>

        <Header
          title={property?.name || "Property"}
          subtitle="Manage tenants and leases for this property"
        />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Tenants Overview
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {leases?.length ?? 0} active lease
                {leases?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export All
            </button>
          </div>

          {!leases || leases.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-base font-medium">No tenants yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leases.map((lease) => {
                const payStatus = getCurrentMonthPaymentStatus(lease.id);
                const isPaid = payStatus === "Paid";
                const agr = agreementByTenant.get(lease.tenantCognitoId);

                return (
                  <div
                    key={lease.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-5 px-6 py-5 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 sm:w-52">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-bold">
                          {lease.tenant.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {lease.tenant.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {lease.tenant.email}
                        </p>
                      </div>
                    </div>

                    {/* Lease period */}
                    <div className="sm:w-44">
                      <p className="text-xs text-gray-400">Lease Period</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(lease.startDate).toLocaleDateString()} –{" "}
                        {new Date(lease.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Rent */}
                    <div className="sm:w-32">
                      <p className="text-xs text-gray-400">Monthly Rent</p>
                      <p className="text-sm font-bold text-gray-900">
                        ₦{lease.rent.toLocaleString()}
                      </p>
                    </div>

                    {/* Payment status */}
                    <div className="sm:w-36">
                      <p className="text-xs text-gray-400 mb-1">This Month</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {payStatus}
                      </span>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-2 ml-auto">
                      <a
                        href={`tel:${lease.tenant.phoneNumber}`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${lease.tenant.email}`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <button
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors ${!agr ? "opacity-40 cursor-not-allowed" : ""}`}
                        disabled={!agr}
                        onClick={() => agr && downloadAgreementAsPDF(agr)}
                      >
                        <Download className="w-3.5 h-3.5" /> Agreement
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyTenants;
