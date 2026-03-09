import { useGetPropertyQuery } from "@/state/api";
import { MapPin, Star } from "lucide-react";
import React from "react";

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <>Loading...</>;
  if (isError || !property) return <>Property not Found</>;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-1">
        {property.location?.country} / {property.location?.state} /{" "}
        <span className="font-semibold text-gray-600">
          {property.location?.city}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold my-5">{property.name}</h1>

      {/* Location + Rating */}
      <div className="flex justify-between items-center">
        <span className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-1 text-gray-700" />
          {property.location?.city}, {property.location?.state},{" "}
          {property.location?.country}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 mr-1 fill-current" />
            {property.averageRating.toFixed(1)} ({property.numberOfReviews}{" "}
            Reviews)
          </span>
          <span className="text-green-600">Verified Listing</span>
        </div>
      </div>

      {/* Key stats */}
      <div className="border border-primary-200 rounded-xl p-6 my-6">
        <div className="flex justify-between items-center gap-4 px-5">
          {[
            {
              label: "Monthly Rent",
              value: `₦${property.pricePerMonth.toLocaleString()}`,
            },
            { label: "Bedrooms", value: `${property.beds} bd` },
            { label: "Bathrooms", value: `${property.baths} ba` },
            {
              label: "Square Feet",
              value: `${property.squareFeet.toLocaleString()} sq ft`,
            },
          ].map(({ label, value }, i, arr) => (
            <React.Fragment key={label}>
              <div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="border-l border-gray-300 h-10" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Description — only from DB, no dummy text */}
      <div className="my-16">
        <h2 className="text-xl font-semibold mb-5">About {property.name}</h2>
        <p className="text-gray-500 leading-7 whitespace-pre-line">
          {property.description || "No description provided."}
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;
