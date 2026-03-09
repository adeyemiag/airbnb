"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from "@/state/api";
import { Heart } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50/50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <Header
          title="Saved Properties"
          subtitle="Properties you've bookmarked for later"
        />

        {favoriteProperties && favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favoriteProperties.map((property) => (
              <Card
                key={property.id}
                property={property}
                isFavorite={true}
                onFavoriteToggle={() => {}}
                showFavoriteButton={false}
                propertyLink={`/search/${property.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium">No saved properties</p>
            <p className="text-sm mt-1">
              Browse properties and save ones you like
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
