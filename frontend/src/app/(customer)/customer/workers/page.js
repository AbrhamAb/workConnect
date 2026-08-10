"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { Card } from "@/components/card";

import { getWorkers } from "@/services/worker.service";

import {
  getCurrentCustomerFavorites,
  toggleFavorite,
} from "@/services/favorite.service";

const categories = [
  "All",
  "Favorites",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mason",
  "Welder",
];

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [workerData, favorites] = await Promise.all([
          getWorkers(),
          getCurrentCustomerFavorites(),
        ]);

        if (!mounted) {
          return;
        }

        setWorkers(workerData);

        setFavoriteIds(new Set(favorites.map((favorite) => favorite.workerId)));
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load workers right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleFavoriteToggle(workerId) {
    try {
      const favorited = await toggleFavorite(workerId);

      setFavoriteIds((current) => {
        const next = new Set(current);

        if (favorited) {
          next.add(workerId);
        } else {
          next.delete(workerId);
        }

        return next;
      });
    } catch (err) {
      console.error(err);
    }
  }

  const displayedWorkers = useMemo(() => {
    let filtered = [...workers];

    const query = search.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((worker) => {
        return (
          worker.fullName?.toLowerCase().includes(query) ||
          worker.primarySkill?.toLowerCase().includes(query) ||
          worker.city?.toLowerCase().includes(query) ||
          worker.skills?.some((skill) => skill.toLowerCase().includes(query))
        );
      });
    }

    if (selectedCategory !== "All" && selectedCategory !== "Favorites") {
      filtered = filtered.filter(
        (worker) => worker.primarySkill === selectedCategory,
      );
    }

    if (selectedCategory === "Favorites") {
      filtered = filtered.filter((worker) => favoriteIds.has(worker.id));
    }

    return filtered.map((worker) => ({
      id: worker.id,
      name: worker.fullName,
      skill: worker.primarySkill,
      location: worker.city,
      rating: worker.rating || 0,
      verified: worker.verified,
      image: worker.profileImage || "/api/placeholder/150/150",
      favorite: favoriteIds.has(worker.id),
    }));
  }, [workers, search, selectedCategory, favoriteIds]);
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">
          Find Skilled Workers
        </h1>

        <p className="mt-2 text-gray-500">
          Browse trusted professionals and hire the right person for your
          project.
        </p>
      </section>

      <section>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 shadow-sm outline-none transition focus:border-[#1A362D]"
          />
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const active = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[#1A362D] text-white"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Card className="col-span-full rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
            Loading workers...
          </Card>
        ) : error ? (
          <Card className="col-span-full rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
            {error}
          </Card>
        ) : displayedWorkers.length === 0 ? (
          <Card className="col-span-full rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
            {selectedCategory === "Favorites"
              ? "You haven't added any favorite workers yet."
              : "No workers match your search yet."}
          </Card>
        ) : (
          displayedWorkers.map((worker) => (
            <div
              key={worker.id}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar src={worker.image} alt={worker.name} size="lg" />

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {worker.name}
                    </h2>

                    <p className="text-sm text-gray-500">{worker.skill}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {worker.verified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Verified
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleFavoriteToggle(worker.id)}
                    className="text-2xl leading-none transition hover:scale-110"
                    aria-label={
                      worker.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    {worker.favorite ? "❤️" : "🤍"}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rating</p>

                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>

                    <span className="font-medium">
                      {worker.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Location</p>

                  <p className="font-medium text-gray-900">{worker.location}</p>
                </div>
              </div>

              <Link href={`/customer/workers/${worker.id}`}>
                <button className="mt-6 w-full rounded-xl bg-[#1A362D] py-3 font-medium text-white transition hover:opacity-90">
                  View Full Profile
                </button>
              </Link>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
