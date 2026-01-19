// app/support/page.tsx
import { HolographicBackground } from "@/components/ui/HolographicBackground";
import { SupportContent } from "@/components/support/SupportContent";

export const metadata = {
  title: "Support | W-Pull",
  description: "W-Pull support center and help resources",
};

export default function SupportPage() {
  return (
    <HolographicBackground
      particles
      particleCount={25}
      hexGrid
      dataStreams
      accentColor="cyan"
    >
      <SupportContent />
    </HolographicBackground>
  );
}
