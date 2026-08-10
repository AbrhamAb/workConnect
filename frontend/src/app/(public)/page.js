import Link from "next/link";
import { HeroSearch } from "@/components/hero-search";
import { CategoryCard } from "@/components/category-card";
import { WorkerProfileCard } from "@/components/worker-profile-card";
import { Footer } from "@/components/footer";

export default function WorkerBrowsingPage() {
  const categories = [
    {
      label: "Electrician",
      icon: <span className="text-lg font-bold">⚡</span>,
    },
    {
      label: "Plumber",
      icon: <span className="text-lg font-bold">🪠</span>,
    },
    {
      label: "Mechanic",
      icon: <span className="text-lg font-bold">🔧</span>,
    },
    {
      label: "Carpenter",
      icon: <span className="text-lg font-bold">🪚</span>,
    },
    {
      label: "Cleaner",
      icon: <span className="text-lg font-bold">🧹</span>,
    },
    {
      label: "Painter",
      icon: <span className="text-lg font-bold">🎨</span>,
    },
  ];

  const featuredWorkers = [
    {
      id: 1,
      name: "Abebe Kebede",
      specialty: "Expert Plumber",
      location: "Bole, Addis Ababa",
      rating: "4.9",
      avatar: "/api/placeholder/100/100",
      coverImage: "/api/placeholder/600/400",
      isVerified: true,
    },
    {
      id: 2,
      name: "Abebe Kebede",
      specialty: "Expert Plumber",
      location: "Bole, Addis Ababa",
      rating: "4.9",
      avatar: "/api/placeholder/100/100",
      coverImage: "/api/placeholder/600/400",
      isVerified: true,
    },
    {
      id: 3,
      name: "Abebe Kebede",
      specialty: "Expert Plumber",
      location: "Bole, Addis Ababa",
      rating: "4.9",
      avatar: "/api/placeholder/100/100",
      coverImage: "/api/placeholder/600/400",
      isVerified: true,
    },
  ];

  return (
    <div className="bg-[#f9f9f9] space-y-12">
      {/* Authentication Actions */}
      <div className="flex justify-end items-center gap-3 pt-6">
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#1A362D] hover:text-[#1A362D]"
        >
          Log In
        </Link>

        <Link
          href="/register-customer"
          className="rounded-lg bg-[#1A362D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#25483d]"
        >
          Join as Customer
        </Link>

        <Link
          href="/register-worker"
          className="rounded-lg border border-[#1A362D] px-5 py-2 text-sm font-semibold text-[#1A362D] transition hover:bg-[#E8F5F1]"
        >
          Become a Worker
        </Link>
      </div>

      {/* Hero */}
      <HeroSearch />

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#B8860B] uppercase block mb-1">
              Curated Services
            </span>

            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Browse by Category
            </h2>
          </div>

          <Link
            href="/login"
            className="text-sm font-bold text-[#B8860B] hover:underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <Link key={index} href="/login" className="block">
              <CategoryCard label={cat.label} icon={cat.icon} />
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Workers */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-extrabold tracking-widest text-[#B8860B] uppercase block mb-1">
            Top Talent
          </span>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Featured Workers Near You
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredWorkers.map((worker) => (
            <Link key={worker.id} href="/login" className="block h-full">
              <WorkerProfileCard
                name={worker.name}
                specialty={worker.specialty}
                location={worker.location}
                rating={worker.rating}
                avatar={worker.avatar}
                coverImage={worker.coverImage}
                isVerified={worker.isVerified}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mx-[-1rem] sm:mx-[-1.5rem] lg:mx-[-2rem] mb-[-2rem]">
        <Footer />
      </div>
    </div>
  );
}
