"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
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
  if (error) return <div>Error loading manager properties</div>;

  return (
    <div className="dashboard-container flex flex-col w-full pt-12 pb-12">
      <div className="w-full max-w-6xl mx-auto transform translate-x-36">
        {/* Header */}
        <div className="text-left mb-6">
          <Header
            title="My Properties"
            subtitle="View and manage your property listings"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {managerProperties?.map((property) => (
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

        {/* No properties */}
        {(!managerProperties || managerProperties.length === 0) && (
          <p className="mt-4">You don&lsquo;t manage any properties</p>
        )}
      </div>
    </div>
  );
};

export default Properties;
