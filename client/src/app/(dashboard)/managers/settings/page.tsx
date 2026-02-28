"use client";

import SettingsForm from "@/components/SettingsForm";
import {
  useGetAuthUserQuery,
  useUpdateManagerSettingsMutation,
} from "@/state/api";
import React from "react";

const ManagerSettings = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const [updateManager] = useUpdateManagerSettingsMutation();

  if (isLoading) return <>Loading...</>;

  const initialData = {
    name: authUser?.userInfo.name,
    email: authUser?.userInfo.email,
    phoneNumber: authUser?.userInfo.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    await updateManager({
      cognitoId: authUser?.cognitoInfo?.userId,
      ...data,
    });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Manager Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account preferences and personal information
          </p>
        </div>
        <SettingsForm
          initialData={initialData}
          onSubmit={handleSubmit}
          userType="manager"
        />
      </div>
    </div>
  );
};

export default ManagerSettings;
