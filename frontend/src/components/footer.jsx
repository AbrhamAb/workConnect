import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1A362D] text-white pt-16 pb-8 border-t border-emerald-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo Brand Segment */}
          <div className="space-y-4 md:col-span-2">
            <span className="text-2xl font-black tracking-tight text-white block">
              WorkConnect
            </span>
            <p className="text-emerald-100/70 text-sm max-w-sm leading-relaxed">
              The Digital Curator for Ethiopias top professional talent. We
              bridge the gap between skill and opportunity.
            </p>
            <div className="flex gap-3 pt-2">
              <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                <span className="text-xs">🌐</span>
              </button>
              <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                <span className="text-xs">✉️</span>
              </button>
            </div>
          </div>

          {/* Column Quick Links */}
          <div>
            <h5 className="font-bold text-sm tracking-wider uppercase text-emerald-300 mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2.5 text-sm font-medium text-emerald-100/80">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Find Work
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Hire Talent
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Safety Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column Corporate */}
          <div>
            <h5 className="font-bold text-sm tracking-wider uppercase text-emerald-300 mb-4">
              Company
            </h5>
            <ul className="space-y-2.5 text-sm font-medium text-emerald-100/80">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Context Line */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-medium text-emerald-100/50 gap-4">
          <span>© 2024 WorkConnect. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
