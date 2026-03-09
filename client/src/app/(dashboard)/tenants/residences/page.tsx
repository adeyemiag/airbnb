"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api";
import { Home } from "lucide-react";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    },
  );
  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading residences</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <Header
          title="My Residences"
          subtitle="Properties you are currently renting"
        />

        {currentResidences && currentResidences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentResidences.map((property) => (
              <Card
                key={property.id}
                property={property}
                isFavorite={tenant?.favorites.includes(property.id) || false}
                onFavoriteToggle={() => {}}
                showFavoriteButton={false}
                propertyLink={`/tenants/residences/${property.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium">No residences yet</p>
            <p className="text-sm mt-1">
              Complete a payment to move a property here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Residences;
