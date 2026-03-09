import { Bath, Bed, Heart, House, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Card = ({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: CardProps) => {
  const [imgSrc, setImgSrc] = useState(
    property.photoUrls?.[0] || "/placeholder.jpg",
  );

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full mb-5">
      <div className="relative">
        <div className="w-full h-52 relative">
          <Image
            src={imgSrc}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          {property.isPetsAllowed && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Pets OK
            </span>
          )}
          {property.isParkingIncluded && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Parking
            </span>
          )}
        </div>
        {showFavoriteButton && (
          <button
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-sm transition-colors"
            onClick={onFavoriteToggle}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"}`}
            />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-base font-bold text-gray-900 leading-tight">
            {propertyLink ? (
              <Link
                href={propertyLink}
                className="hover:text-primary-700 transition-colors"
                scroll={false}
              >
                {property.name}
              </Link>
            ) : (
              property.name
            )}
          </h2>
          <div className="flex items-center gap-1 text-sm ml-2 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-gray-700">
              {property.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {property?.location?.address}, {property?.location?.city}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            ₦{property.pricePerMonth.toLocaleString()}
            <span className="text-gray-400 text-xs font-normal"> /mo</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-gray-400 text-xs mt-3 pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {property.beds} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            {property.baths} ba
          </span>
          <span className="flex items-center gap-1">
            <House className="w-3.5 h-3.5" />
            {property.squareFeet} sqft
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;
