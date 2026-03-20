"use client";

import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetAuthUserQuery,
  useGetPropertyQuery,
  useGetApplicationsQuery,
  useGetAgreementsQuery,
  useGetPaymentsQuery,
  useGetPropertyLeasesQuery,
} from "@/state/api";
import {
  AlertTriangle,
  ArrowDownToLine,
  Check,
  Clock,
  Download,
  FileText,
  MapPin,
  Phone,
  Mail,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { downloadAgreementAsPDF } from "@/lib/downloadAgreement";

// Countdown hook
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
    graceExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const graceEnd = new Date(targetDate.getTime() + 12 * 60 * 60 * 1000);

    const tick = () => {
      const now = new Date();
      const diffToEnd = targetDate.getTime() - now.getTime();
      const diffToGrace = graceEnd.getTime() - now.getTime();

      if (diffToGrace <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
          graceExpired: true,
        });
        return;
      }
      if (diffToEnd <= 0) {
        // In grace period
        const h = Math.floor(diffToGrace / (1000 * 60 * 60));
        const m = Math.floor((diffToGrace % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffToGrace % (1000 * 60)) / 1000);
        setTimeLeft({
          hours: h,
          minutes: m,
          seconds: s,
          expired: true,
          graceExpired: false,
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: false,
          graceExpired: false,
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

const ExpiryBanner = ({ endDate }: { endDate: Date }) => {
  const countdown = useCountdown(endDate);
  if (!countdown || !countdown.expired) return null;

  return (
    <div
      className={`w-full mb-6 rounded-2xl p-4 flex items-center gap-4 border ${
        countdown.graceExpired
          ? "bg-red-50 border-red-300 text-red-800"
          : "bg-orange-50 border-orange-300 text-orange-800"
      }`}
    >
      {countdown.graceExpired ? (
        <X className="w-6 h-6 shrink-0 text-red-600" />
      ) : (
        <AlertTriangle className="w-6 h-6 shrink-0 text-orange-500" />
      )}
      <div className="flex-1">
        {countdown.graceExpired ? (
          <>
            <p className="font-bold text-red-700">
              Lease Expired — Property Lost
            </p>
            <p className="text-sm">
              Your grace period has ended. Please contact your manager to
              discuss renewal.
            </p>
          </>
        ) : (
          <>
            <p className="font-bold">⚠️ Lease Expired — Grace Period Active</p>
            <p className="text-sm">
              Your lease has ended. You have a 12-hour grace period to renew or
              you will lose access to this property.
            </p>
          </>
        )}
      </div>
      {!countdown.graceExpired && (
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-orange-200 shrink-0">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="font-mono font-bold text-lg text-orange-700">
            {String(countdown.hours).padStart(2, "0")}:
            {String(countdown.minutes).padStart(2, "0")}:
            {String(countdown.seconds).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
};

const Residence = () => {
  const { id } = useParams();
  const { data: authUser } = useGetAuthUserQuery();

  const { data: property, isLoading: propLoading } = useGetPropertyQuery(
    Number(id),
  );
  const { data: leases, isLoading: leasesLoading } = useGetPropertyLeasesQuery(
    Number(id),
    {
      skip: !id,
    },
  );
  const { data: applications } = useGetApplicationsQuery(
    { userId: authUser?.cognitoInfo?.userId, userType: "tenant" },
    { skip: !authUser?.cognitoInfo?.userId },
  );
  const { data: agreements } = useGetAgreementsQuery(
    { userId: authUser?.cognitoInfo?.userId, userType: "tenant" },
    { skip: !authUser?.cognitoInfo?.userId },
  );

  const currentLease = leases?.find(
    (l) => l.tenantCognitoId === authUser?.cognitoInfo?.userId,
  );

  const { data: payments, isLoading: paymentsLoading } = useGetPaymentsQuery(
    currentLease?.id || 0,
    { skip: !currentLease?.id },
  );

  const application = applications?.find((a) => a.propertyId === Number(id));
  const agreement = agreements?.find(
    (a) => a.applicationId === application?.id,
  );

  if (propLoading || leasesLoading) return <Loading />;
  if (!property)
    return <div className="p-8 text-gray-500">Property not found.</div>;

  const endDate = currentLease ? new Date(currentLease.endDate) : null;
  const manager = (property as any).manager;
  const photoUrl = property.photoUrls?.[0];

  return (
    <div className="min-h-screen bg-gray-50/50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Expiry Banner */}
        {endDate && <ExpiryBanner endDate={endDate} />}

        {/* Property Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-6">
            {/* Photo */}
            <div className="w-48 h-36 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No photo
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  Active Lease
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {property.name}
                </h2>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location?.city}, {property.location?.country}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ₦
                {currentLease?.rent?.toLocaleString() ??
                  property.pricePerMonth.toLocaleString()}
                <span className="text-sm font-normal text-gray-500"> / mo</span>
              </div>
            </div>
          </div>

          <hr className="my-5 border-gray-100" />

          {/* Lease dates */}
          {currentLease && (
            <div className="flex flex-wrap gap-6 text-sm mb-5">
              <div>
                <p className="text-gray-400 mb-0.5">Start Date</p>
                <p className="font-semibold">
                  {new Date(currentLease.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-gray-400 mb-0.5">End Date</p>
                <p
                  className={`font-semibold ${endDate && endDate < new Date() ? "text-red-600" : ""}`}
                >
                  {new Date(currentLease.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="w-px bg-gray-200" />
              <div>
                <p className="text-gray-400 mb-0.5">Monthly Rent</p>
                <p className="font-semibold">
                  ₦{currentLease.rent.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {manager && (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {manager.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{manager.name}</p>
                  <div className="flex gap-3 text-gray-500 text-xs mt-0.5">
                    {manager.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {manager.phoneNumber}
                      </span>
                    )}
                    {manager.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {manager.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {agreement && (
              <button
                onClick={() => downloadAgreementAsPDF(agreement)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Agreement
              </button>
            )}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Billing History
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Your previous payment receipts
              </p>
            </div>
          </div>

          {paymentsLoading ? (
            <p className="text-gray-400 text-sm py-6 text-center">
              Loading payments...
            </p>
          ) : !payments || payments.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No billing history yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="h-14">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        Invoice #{payment.id} —{" "}
                        {new Date(payment.paymentDate).toLocaleString(
                          "default",
                          { month: "short", year: "numeric" },
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          payment.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.paymentStatus === "Paid" && (
                          <Check className="w-3 h-3" />
                        )}
                        {payment.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₦{payment.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <button className="inline-flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <ArrowDownToLine className="w-3.5 h-3.5" /> Download
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Residence;
