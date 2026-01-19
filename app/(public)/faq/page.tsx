// app/faq/page.tsx
import { HolographicBackground } from "@/components/ui/HolographicBackground";
import { FAQContent } from "@/components/faq/FAQcontent";

export const metadata = {
  title: "FAQ | W-Pull",
  description: "Frequently asked questions about W-Pull card system",
};

export default function FAQPage() {
  return (
    <HolographicBackground
      particles
      particleCount={25}
      hexGrid
      dataStreams
      accentColor="cyan"
    >
      <FAQContent />
    </HolographicBackground>
  );
}
