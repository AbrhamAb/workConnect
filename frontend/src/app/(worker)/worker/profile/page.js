"use client";

import { useEffect, useMemo, useState } from "react";

import { WorkerProfileHeader } from "@/features/worker-profile/WorkerProfileHeader";
import { AccountInformationCard } from "@/features/worker-profile/AccountInformationCard";
import { ProfessionalProfileCard } from "@/features/worker-profile/ProfessionalProfileCard";
import { PortfolioCard } from "@/features/worker-profile/PortfolioCard";
import { SecurityCard } from "@/features/worker-profile/SecurityCard";
import { DangerZoneCard } from "@/features/worker-profile/DangerZoneCard";
import { Card } from "@/components/card";

import { getCurrentWorkerProfileData } from "@/services/worker.service";

export default function WorkerProfilePage() {
  const [worker, setWorker] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadWorkerProfile() {
      try {
        setLoading(true);
        setError("");

        const profileData = await getCurrentWorkerProfileData();

        if (!profileData) {
          throw new Error(
            "You need to be signed in as a worker to view this profile.",
          );
        }

        if (mounted) {
          setWorker(profileData.worker);
          setPortfolioItems(profileData.portfolio);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load your profile right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWorkerProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const profileData = useMemo(() => {
    if (!worker) {
      return null;
    }

    return {
      fullName: worker.fullName,
      email: worker.email,
      phone: worker.phone,
      profileImage: worker.profileImage || "/api/placeholder/200/200",
      primarySkill: worker.primarySkill || "Skilled professional",
      experience: worker.experience || 0,
      city: worker.city || "Addis Ababa",
      skills: worker.skills || [],
      bio:
        worker.bio ||
        "This professional is ready to help with your next project.",
      verified: worker.verified || false,
      availability: worker.availability === "available" ? "Available" : "Busy",
      rating: worker.rating || 0,
      totalReviews: worker.totalReviews || 0,
      portfolioCount: portfolioItems.length,
    };
  }, [worker, portfolioItems]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A362D]">
          Profile & Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your account information and professional profile.
        </p>
      </div>

      {loading ? (
        <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          Loading your profile...
        </Card>
      ) : error ? (
        <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          {error}
        </Card>
      ) : profileData ? (
        <>
          <WorkerProfileHeader worker={profileData} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AccountInformationCard
              worker={profileData}
              onWorkerUpdated={setWorker}
            />

            <ProfessionalProfileCard
              worker={profileData}
              onWorkerUpdated={setWorker}
            />
          </div>

          <PortfolioCard portfolioCount={profileData.portfolioCount} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SecurityCard />
            <DangerZoneCard />
          </div>
        </>
      ) : (
        <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          No worker profile data is available yet.
        </Card>
      )}
    </div>
  );
}
