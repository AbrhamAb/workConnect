import { Avatar } from "@/components/avatar";
import { useRef } from "react";

export default function ProfileHeader({ customer, onPhotoSelected }) {
  const fileInputRef = useRef(null);

  function handleButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (typeof onPhotoSelected === "function") {
      onPhotoSelected(file);
      return;
    }

    // Fallback: read as data URL (no-op) so the picker feels responsive
    const reader = new FileReader();
    reader.onload = () => {
      // no-op: caller didn't provide handler, you may replace this with upload logic
      console.log("photo selected (dataURL)");
    };
    reader.readAsDataURL(file);
  }
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left */}

        <div className="flex items-center gap-5">
          <Avatar src={customer.avatar} alt={customer.name} size="lg" />

          <div>
            <h2 className="text-3xl font-bold text-[#1A362D]">
              {customer.name}
            </h2>

            <p className="mt-1 text-gray-500">{customer.role}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#E8F5F1] px-3 py-1 text-sm font-semibold text-[#1A362D]">
                {customer.badge}
              </span>

              <span className="text-sm text-gray-500">
                Member since {customer.memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}

        <>
          <button
            type="button"
            onClick={handleButtonClick}
            className="rounded-xl bg-[#E8F5F1] px-5 py-3 font-semibold text-[#1A362D] transition hover:opacity-90"
          >
            Change Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      </div>
    </section>
  );
}
