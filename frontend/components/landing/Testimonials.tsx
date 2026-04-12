"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "I described my bakery in 2 minutes and had a real website live the same afternoon. My customers actually found me on Google the next week.",
    author: "Priya Sharma",
    role: "Owner, Sweet Crumbs Bakery",
    initials: "PS",
  },
  {
    quote:
      "I've been putting off making a website for 3 years. VocalWeb got it done in the time it takes to have a conversation.",
    author: "Marcus Johnson",
    role: "Founder, MJ Auto Detailing",
    initials: "MJ",
  },
  {
    quote:
      "The website it created for my yoga studio looks better than anything my nephew made for me on Wix. I'm actually proud to share it.",
    author: "Anita Desai",
    role: "Instructor, Anita's Yoga Studio",
    initials: "AD",
  },
  {
    quote:
      "As someone who has zero tech skills, this felt like magic. I talked, it listened, and 10 seconds later I had a real website.",
    author: "David Chen",
    role: "Owner, Golden Gate Cleaners",
    initials: "DC",
  },
  {
    quote:
      "Tried other website builders. All too complicated. VocalWeb was the first one I didn't need to watch a tutorial for.",
    author: "Fatima Al-Hassan",
    role: "Owner, Nile Bridal Studio",
    initials: "FA",
  },
  {
    quote:
      "The design quality surprised me. Looks professional, clean, loads fast. My clients compliment the website regularly.",
    author: "Tom Okafor",
    role: "Founder, Okafor Plumbing",
    initials: "TO",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-4"
          >
            Testimonials
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-[36px] md:text-[44px] font-bold tracking-tight text-zinc-900"
          >
            Business owners love it.
          </motion.h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="break-inside-avoid bg-white border border-zinc-200 rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, si) => (
                  <svg key={si} width="12" height="12" viewBox="0 0 12 12" fill="#18181b">
                    <path d="M6 0l1.5 4h4l-3.3 2.4 1.3 4L6 8 2.5 10.4l1.3-4L0.5 4h4z" />
                  </svg>
                ))}
              </div>

              <p className="text-[14px] text-zinc-600 leading-relaxed mb-5">"{t.quote}"</p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-[11px] font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-zinc-900">{t.author}</div>
                  <div className="text-[11px] text-zinc-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
