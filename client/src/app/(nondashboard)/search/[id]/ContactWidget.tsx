import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery, useGetPropertyQuery } from "@/state/api";
import { Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ContactWidget = ({ propertyId, onOpenModal }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: property } = useGetPropertyQuery(propertyId);
  const router = useRouter();

  const manager = property?.manager;

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-white border border-primary-200 rounded-2xl p-7 h-fit min-w-[300px]">
      {/* Manager contact */}
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
        Contact Manager
      </p>

      {manager ? (
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-700 font-bold text-sm">
                {manager.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {manager.name}
              </p>
              <p className="text-xs text-gray-400">Property Manager</p>
            </div>
          </div>

          {manager.phoneNumber && (
            <a
              href={`tel:${manager.phoneNumber}`}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center p-2 bg-primary-900 rounded-full">
                <Phone className="text-primary-50 w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-bold text-primary-800">
                  {manager.phoneNumber}
                </p>
              </div>
            </a>
          )}

          {manager.email && (
            <a
              href={`mailto:${manager.email}`}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center p-2 bg-primary-900 rounded-full">
                <Mail className="text-primary-50 w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-bold text-primary-800">
                  {manager.email}
                </p>
              </div>
            </a>
          )}
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm mb-4">
          Loading contact info...
        </div>
      )}

      <Button
        className="w-full bg-primary-700 text-white hover:bg-primary-600 rounded-xl"
        onClick={handleButtonClick}
      >
        {authUser ? "Submit Application" : "Sign In to Apply"}
      </Button>
    </div>
  );
};

export default ContactWidget;
