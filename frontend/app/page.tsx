import dynamic from "next/dynamic";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";

// Skeleton fallbacks for below-fold sections while JS loads
function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`w-full ${height} bg-white animate-pulse`} />;
}

// Lazy load everything below the fold — not needed for initial paint
const HowItWorks = dynamic(
  () => import("@/components/landing/HowItWorks").then((m) => ({ default: m.HowItWorks })),
  { ssr: false, loading: () => <SectionSkeleton height="h-72" /> }
);

const Features = dynamic(
  () => import("@/components/landing/Features").then((m) => ({ default: m.Features })),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const Testimonials = dynamic(
  () => import("@/components/landing/Testimonials").then((m) => ({ default: m.Testimonials })),
  { ssr: false, loading: () => <SectionSkeleton height="h-72" /> }
);

const Pricing = dynamic(
  () => import("@/components/landing/Pricing").then((m) => ({ default: m.Pricing })),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const Footer = dynamic(
  () => import("@/components/landing/Footer").then((m) => ({ default: m.Footer })),
  { ssr: false, loading: () => <SectionSkeleton height="h-32" /> }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
