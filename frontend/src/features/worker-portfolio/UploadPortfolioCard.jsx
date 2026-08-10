import { useState } from "react";

import { Card } from "@/components/card";
import { Button } from "@/components/button";

export function UploadPortfolioCard({ onUpload, submitting = false }) {
  const [imageUrl, setImageUrl] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!imageUrl.trim()) {
      return;
    }

    onUpload?.(imageUrl.trim());
    setImageUrl("");
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 p-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5F1]">
          <svg
            className="h-8 w-8 text-[#1A362D]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 4v12m0-12l-4 4m4-4l4 4"
            />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#1A362D]">
          Upload Portfolio Photos
        </h2>

        <p className="mt-2 max-w-lg text-gray-500">
          Add clear photos of your completed work to help customers understand
          the quality of your services.
        </p>

        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://example.com/project.jpg"
          className="mt-6 w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1A362D]"
        />

        <Button type="submit" className="mt-6" disabled={submitting}>
          {submitting ? "Uploading..." : "Upload Photos"}
        </Button>

        <p className="mt-3 text-sm text-gray-400">
          Paste an image URL • Multiple items supported
        </p>
      </form>
    </Card>
  );
}
