import { useRef, useState } from "react";

import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { fileToDataUrl } from "@/services/api.service";

export function UploadPortfolioCard({ onUpload, submitting = false }) {
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [error, setError] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    try {
      setError("");
      const dataUrl = await fileToDataUrl(file);
      setImageUrl(dataUrl);
      setSelectedFileName(file.name);
    } catch (err) {
      setError(err.message || "Unable to read the selected image.");
      setImageUrl("");
      setSelectedFileName("");
    } finally {
      event.target.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const value = imageUrl.trim();

    if (!value) {
      setError("Please choose or add an image before uploading.");
      return;
    }

    onUpload?.(value);
    setImageUrl("");
    setSelectedFileName("");
    setError("");
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

        <div className="mt-6 flex w-full max-w-md flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Choose Photo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600">
            {selectedFileName || "No photo selected yet"}
          </div>
        </div>

        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Or paste an image URL"
          className="mt-6 w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#1A362D]"
        />

        <Button type="submit" className="mt-6" disabled={submitting}>
          {submitting ? "Uploading..." : "Upload Photos"}
        </Button>

        {error ? (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-gray-400">
            Choose a local photo or paste an image URL
          </p>
        )}
      </form>
    </Card>
  );
}
