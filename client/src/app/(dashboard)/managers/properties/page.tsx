"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import { Building2 } from "lucide-react";
import React from "react";

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading properties</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Header
            title="My Properties"
            subtitle="View and manage your property listings"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <Building2 className="w-4 h-4 text-primary-600" />
            <span>
              <span className="font-bold text-gray-800">
                {managerProperties?.length ?? 0}
              </span>{" "}
              properties
            </span>
          </div>
        </div>

        {!managerProperties || managerProperties.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium">No properties yet</p>
            <p className="text-sm mt-1">
              Add your first property to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {managerProperties.map((property) => (
              <Card
                key={property.id}
                property={property}
                isFavorite={false}
                onFavoriteToggle={() => {}}
                showFavoriteButton={false}
                propertyLink={`/managers/properties/${property.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
