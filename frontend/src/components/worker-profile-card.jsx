import { Card } from "./card";
import { Avatar } from "./avatar";
import { Button } from "./button";

export function WorkerProfileCard({
  name,
  specialty,
  location,
  rating,
  avatar,
  coverImage,
  isVerified,
}) {
  return (
    <Card
      noPadding
      className="hover:shadow-md transition-shadow group flex flex-col h-full"
    >
      {/* Cover Showcase Frame */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={coverImage}
          alt={`${name} cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isVerified && (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-[9px] font-extrabold tracking-wider px-2 py-1 rounded flex items-center gap-1 shadow-sm">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a.75.75 0 00-.708.523L4.547 7.15H1.5a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75h3.047l1.012 3.172a.75.75 0 001.416 0l1.012-3.172H11.5a.75.75 0 00.75-.75V7.9a.75.75 0 00-.75-.75H8.267l-1.012-3.172a.75.75 0 00-.988-.523z"
                clipRule="evenodd"
              />
            </svg>
            VERIFIED
          </span>
        )}
      </div>

      {/* Main Core Elements Block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2 mb-4">
          <div className="flex gap-3">
            <Avatar
              src={avatar}
              size="md"
              className="border border-white shadow-sm"
            />
            <div>
              <h4 className="font-bold text-gray-900 group-hover:text-[#1A362D] transition-colors line-clamp-1">
                {name}
              </h4>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                {specialty}
              </p>
              <div className="flex items-center text-xs text-gray-500 gap-1 mt-1">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span className="line-clamp-1">{location}</span>
              </div>
            </div>
          </div>

          {/* Rating Status Component Frame */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
              <svg
                className="w-3 h-3 text-amber-500 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[11px] font-bold text-amber-700">
                {rating}
              </span>
            </div>
            {/* Wishlist Heart Icon Action Button */}
            <button className="p-1.5 text-gray-300 hover:text-rose-500 rounded-full hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4 stroke-current fill-none"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          className="rounded-xl font-bold bg-[#1A362D] mt-2"
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}
