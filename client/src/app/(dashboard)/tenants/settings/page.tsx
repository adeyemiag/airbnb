"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
} from "@/state/api";
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
    await updateTenant({
      cognitoId: authUser?.cognitoInfo?.userId,
      ...data,
    });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Tenant Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account preferences and personal information
          </p>
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
