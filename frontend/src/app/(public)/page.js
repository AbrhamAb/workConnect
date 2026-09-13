import Link from "next/link";
import { Footer } from "@/components/footer";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M5 10.5 8.2 14 15 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M4 10h11M11 5.5 15.5 10 11 14.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 19 6v5.2c0 4.6-2.8 7.8-7 9.3-4.2-1.5-7-4.7-7-9.3V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.7 12 2.1 2.1 4.5-4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 20c.7-3.4 3-5.2 6.5-5.2s5.8 1.8 6.5 5.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 11h16M10 11v2h4v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m12 3.8 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L12 3.8Z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#FAFAF8] text-gray-900">
      {/* Navigation - Changed to sticky for proper scroll-mt behavior */}
      <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-[#FAFAF8]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A362D] text-sm font-black text-white">
              W
            </div>

            <span className="text-xl font-black tracking-tight text-[#1A362D]">
              WorkConnect
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1A362D]"
            >
              How it works
            </a>

            <a
              href="#customers"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1A362D]"
            >
              For customers
            </a>

            <a
              href="#workers"
              className="text-sm font-medium text-gray-600 transition hover:text-[#1A362D]"
            >
              For workers
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:block"
            >
              Log in
            </Link>

            <Link
              href="/register-customer"
              className="rounded-xl bg-[#1A362D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#25483D] sm:px-5"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#E6F0EC] blur-3xl" />
            <div className="absolute -left-40 top-72 h-[24rem] w-[24rem] rounded-full bg-[#F1EEE5] blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D8E4DF] bg-white/80 px-3.5 py-2 text-xs font-bold text-[#1A362D] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A362D]" />
                Connecting people with skilled professionals
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-[-0.04em] text-[#142A23] sm:text-6xl lg:text-7xl">
                Find the right
                <span className="block text-[#1A362D]">
                  professional for the job.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
                WorkConnect makes it easier to discover skilled local
                professionals, understand their experience, and connect with the
                right person for your next job.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register-customer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A362D] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1A362D]/10 transition hover:-translate-y-0.5 hover:bg-[#25483D]"
                >
                  Find a professional
                  <ArrowIcon />
                </Link>

                <Link
                  href="/register-worker"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-[#1A362D] transition hover:border-[#1A362D] hover:bg-[#F4F8F6]"
                >
                  Join as a worker
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="text-[#1A362D]">
                    <CheckIcon />
                  </span>
                  Skilled professionals
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-[#1A362D]">
                    <CheckIcon />
                  </span>
                  Verified profiles
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-[#1A362D]">
                    <CheckIcon />
                  </span>
                  Simple and practical
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="relative rounded-[2rem] bg-[#1A362D] p-3 shadow-2xl shadow-[#1A362D]/15">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-[#F2F5F2] p-5 sm:p-7">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D9E7E1]" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                          WorkConnect
                        </p>
                        <p className="mt-1 text-lg font-black text-[#142A23]">
                          Built around people.
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1A362D] shadow-sm">
                        <SearchIcon />
                      </div>
                    </div>

                    <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDEAE5] text-lg font-black text-[#1A362D]">
                          AK
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-gray-900">
                            Skilled professional
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Experienced & reliable
                          </p>
                        </div>

                        <div className="hidden items-center gap-1 rounded-lg bg-[#F7F2DF] px-2.5 py-1.5 text-xs font-bold text-[#80691D] sm:flex">
                          <StarIcon />
                          4.9
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#EEF4F1] px-3 py-1.5 text-xs font-semibold text-[#1A362D]">
                          Plumbing
                        </span>
                        <span className="rounded-full bg-[#EEF4F1] px-3 py-1.5 text-xs font-semibold text-[#1A362D]">
                          Electrical
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                          + more
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0EC] text-[#1A362D]">
                          <ShieldIcon />
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-900">
                          Trusted profiles
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Information that helps you choose confidently.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3EFE1] text-[#80691D]">
                          <UserIcon />
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-900">
                          People first
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          A straightforward way to connect.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5EFEA] text-[#1A362D]">
                    <CheckIcon />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Simple to get started
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Create an account and get going
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intro / value proposition */}
        <section className="border-y border-gray-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A711C]">
                  One simple idea
                </p>

                <h2 className="mt-3 max-w-lg text-3xl font-black tracking-tight text-[#142A23] sm:text-4xl">
                  Better connections between customers and skilled workers.
                </h2>
              </div>

              <p className="max-w-2xl text-base leading-7 text-gray-600 lg:ml-auto">
                Finding someone for a job should not mean relying entirely on
                word of mouth or searching through scattered information.
                WorkConnect brings professionals and customers together in one
                straightforward platform.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 bg-[#FAFAF8] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A711C]">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#142A23] sm:text-4xl">
                Simple from start to finish.
              </h2>

              <p className="mt-4 text-base leading-7 text-gray-600">
                Whether you need a professional or want to offer your skills,
                WorkConnect keeps the process clear and focused.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Create your account",
                  description:
                    "Choose whether you're looking for a professional or offering your own skills.",
                },
                {
                  number: "02",
                  title: "Find the right match",
                  description:
                    "Explore professional profiles, skills, experience, ratings, and other useful information.",
                },
                {
                  number: "03",
                  title: "Connect and get started",
                  description:
                    "Send a service request and move forward with the professional you've chosen.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/40 sm:p-7"
                >
                  <span className="text-sm font-black text-[#1A362D]">
                    {step.number}
                  </span>

                  <div className="my-6 h-px bg-gray-100" />

                  <h3 className="text-lg font-black text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-[#1A362D] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D9C98A]">
                  Why WorkConnect
                </p>

                <h2 className="mt-3 max-w-md text-3xl font-black tracking-tight sm:text-4xl">
                  Everything you need to make a better connection.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/65 sm:text-base">
                  WorkConnect focuses on the information and tools that matter
                  when customers and skilled professionals need to work
                  together.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: <SearchIcon />,
                    title: "Discover professionals",
                    description:
                      "Search and explore professionals based on their skills, experience, and location.",
                  },
                  {
                    icon: <ShieldIcon />,
                    title: "Professional profiles",
                    description:
                      "See useful information about a worker before deciding who to contact.",
                  },
                  {
                    icon: <StarIcon />,
                    title: "Ratings and reviews",
                    description:
                      "Learn from previous customer experiences through ratings and reviews.",
                  },
                  {
                    icon: <BriefcaseIcon />,
                    title: "Showcase your work",
                    description:
                      "Workers can build professional profiles and showcase their previous work.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition hover:bg-white/[0.09]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                      {feature.icon}
                    </div>

                    <h3 className="mt-5 text-base font-bold">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Customers */}
        <section
          id="customers"
          className="scroll-mt-20 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-[2rem] bg-[#F2F5F2] p-5 sm:p-7">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DDEAE5] font-bold text-[#1A362D]">
                        W
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Find someone you can trust
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Explore skills, experience, and reviews
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {[
                        "Browse professionals by service",
                        "Compare profiles and experience",
                        "Save professionals you like",
                        "Send a service request",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl bg-[#F7F9F7] px-4 py-3 text-sm font-medium text-gray-700"
                        >
                          <span className="text-[#1A362D]">
                            <CheckIcon />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A711C]">
                  For customers
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#142A23] sm:text-4xl">
                  Find the skills you need, without the guesswork.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
                  Explore professionals, learn about their experience, see
                  reviews, and choose someone who fits your needs. WorkConnect
                  gives you the information to make a more confident decision.
                </p>

                <Link
                  href="/register-customer"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1A362D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#25483D]"
                >
                  Join as a customer
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Workers */}
        <section
          id="workers"
          className="scroll-mt-20 bg-[#F4F5F1] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8A711C]">
                  For workers
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#142A23] sm:text-4xl">
                  Put your skills in front of people who need them.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
                  Create a professional profile, showcase your experience and
                  previous work, build your reputation through reviews, and
                  receive service requests from customers.
                </p>

                <Link
                  href="/register-worker"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#1A362D] bg-[#1A362D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#25483D]"
                >
                  Become a WorkConnect worker
                  <ArrowIcon />
                </Link>
              </div>

              <div>
                <div className="rounded-[2rem] bg-[#1A362D] p-5 shadow-xl shadow-[#1A362D]/10 sm:p-7">
                  <div className="rounded-2xl bg-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DDEAE5] text-lg font-black text-[#1A362D]">
                        W
                      </div>

                      <div>
                        <p className="text-base font-black text-gray-900">
                          Your professional profile
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Let your work speak for itself.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-[#F5F7F5] p-4">
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="mt-2 text-lg font-black text-[#1A362D]">
                          4.9
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F5F7F5] p-4">
                        <p className="text-xs text-gray-500">Reviews</p>
                        <p className="mt-2 text-lg font-black text-[#1A362D]">
                          24
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F5F7F5] p-4">
                        <p className="text-xs text-gray-500">Jobs</p>
                        <p className="mt-2 text-lg font-black text-[#1A362D]">
                          38
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-4">
                      <p className="text-xs font-semibold text-gray-500">
                        Your skills
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {["Electrical", "Installation", "Repair"].map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-[#EAF1ED] px-3 py-1.5 text-xs font-semibold text-[#1A362D]"
                            >
                              {skill}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#1A362D] px-6 py-14 text-center sm:px-12 sm:py-16">
              <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/[0.05]" />
              <div className="absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-white/[0.05]" />

              <div className="relative mx-auto max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D9C98A]">
                  Get started with WorkConnect
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Whether you need a hand or have a skill, there is a place for
                  you here.
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                  Join WorkConnect and become part of a simpler way for
                  customers and skilled professionals to connect.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/register-customer"
                    className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#1A362D] transition hover:bg-gray-100"
                  >
                    Register as customer
                  </Link>

                  <Link
                    href="/register-worker"
                    className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
                  >
                    Register as worker
                  </Link>
                </div>

                <p className="mt-6 text-xs text-white/45">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-white/75 underline underline-offset-4 hover:text-white"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
