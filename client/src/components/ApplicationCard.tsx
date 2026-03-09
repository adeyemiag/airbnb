import { Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrls?.[0] || "/placeholder.jpg",
  );

  const statusConfig = {
    Approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Approved",
    },
    Denied: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Denied",
    },
    Pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Pending",
    },
  };
  const status =
    statusConfig[application.status as keyof typeof statusConfig] ||
    statusConfig.Pending;
  const contactPerson =
    userType === "manager" ? application.tenant : application.manager;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 mb-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-0">
        {/* Image */}
        <div className="relative w-full lg:w-56 h-48 lg:h-auto flex-shrink-0">
          <Image
            src={imgSrc}
            alt={application.property.name}
            fill
            className="object-cover lg:rounded-l-2xl"
            sizes="(max-width: 1024px) 100vw, 224px"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:rounded-l-2xl" />
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Property info */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {application.property.name}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.bg} ${status.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {application.property.location.city},{" "}
                {application.property.location.country}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₦{application.property.pricePerMonth.toLocaleString()}
              <span className="text-sm font-normal text-gray-400"> / mo</span>
            </p>
          </div>

          {/* Lease dates */}
          <div className="lg:w-52 p-5 flex flex-col justify-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Lease Info
            </p>
            {[
              {
                label: "Start",
                value: new Date(
                  application.lease?.startDate,
                ).toLocaleDateString(),
              },
              {
                label: "End",
                value: new Date(
                  application.lease?.endDate,
                ).toLocaleDateString(),
              },
              {
                label: "Next Payment",
                value: new Date(
                  application.lease?.nextPaymentDate,
                ).toLocaleDateString(),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-700">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="lg:w-56 p-5 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              {userType === "manager" ? "Tenant" : "Manager"}
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-bold text-sm">
                  {contactPerson?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                {contactPerson?.name}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                <span>{contactPerson?.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{contactPerson?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-100 bg-gray-50/50">{children}</div>
    </div>
  );
};

export default ApplicationCard;
