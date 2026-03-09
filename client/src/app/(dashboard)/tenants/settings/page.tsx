"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
} from "@/state/api";
import { Settings } from "lucide-react";
import React from "react";

const TenantSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateTenant] = useUpdateTenantSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.userInfo.name,
    email: authUser?.userInfo.email,
    phoneNumber: authUser?.userInfo.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateTenant({ cognitoId: authUser?.cognitoInfo?.userId, ...data });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your profile and preferences
            </p>
          </div>
        </div>
        <SettingsForm
          initialData={initialData}
          onSubmit={handleSubmit}
          userType="tenant"
        />
      </div>
    </div>
  );
};

export default TenantSettings;
