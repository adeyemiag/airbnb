"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    },
  );

  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 },
  );

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading favorites</div>;

  return (
    <div className="dashboard-container ml-60 px-16 py-12">
      <Header
        title="Favorited Properties"
        subtitle="Browse and manage your saved property listings"
      />

      {/* No stretch + slightly right positioned */}
      <div className="mt-8 ml-12">
        {favoriteProperties && favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favoriteProperties.map((property) => (
              <Card
                key={property.id}
                property={property}
                isFavorite={true}
                onFavoriteToggle={() => {}}
                showFavoriteButton={false}
                propertyLink={`/tenants/residences/${property.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <p className="text-gray-500 text-lg">
              You don&apos;t have any favorited properties
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
