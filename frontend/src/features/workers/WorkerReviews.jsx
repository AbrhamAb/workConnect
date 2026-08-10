export default function WorkerReviews({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Client Experiences
        </h2>

        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
          <p className="text-gray-500">
            No reviews yet. This worker has not received any customer reviews.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Client Experiences</h2>

        <p className="mt-1 text-sm text-gray-500">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Reviews */}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-gray-100 p-5 transition hover:shadow-sm"
          >
            {/* Top */}

            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {/* Avatar */}

                {review.profileImage ? (
                  <img
                    src={review.profileImage}
                    alt={review.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A362D] font-semibold text-white">
                    {review.initials}
                  </div>
                )}

                {/* Info */}

                <div>
                  <h3 className="font-semibold text-gray-900">{review.name}</h3>

                  <p className="text-sm text-gray-500">
                    {review.date} • {review.project}
                  </p>
                </div>
              </div>

              {/* Rating */}

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= review.rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Comment */}

            {review.comment && (
              <p className="mt-4 leading-7 text-gray-600">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
