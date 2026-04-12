import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2C5.5 2 4 3 4 5v2c0 1.7 1.3 3 3 3s3-1.3 3-3V5c0-2-1.5-3-3-3z" fill="white" />
                  <path d="M2 7c0 2.8 2.2 5 5 5s5-2.2 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="7" y1="12" x2="7" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-[14px] text-zinc-900">VocalWeb</span>
            </div>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              The simplest way for small business owners to get online. Just speak, and your website appears.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-12 text-[13px]">
            <div>
              <div className="font-semibold text-zinc-900 mb-3">Product</div>
              <ul className="space-y-2">
                {["Features", "Pricing", "Changelog"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-zinc-400 hover:text-zinc-700 transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-zinc-900 mb-3">Company</div>
              <ul className="space-y-2">
                {["About", "Blog", "Contact"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-zinc-400 hover:text-zinc-700 transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-zinc-900 mb-3">Legal</div>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Cookies"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-zinc-400 hover:text-zinc-700 transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-zinc-400">
            © {new Date().getFullYear()} VocalWeb. All rights reserved.
          </p>
          <p className="text-[12px] text-zinc-400">
            Made with care for small business owners everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
