// app/contact/page.tsx
import { HolographicBackground } from "@/components/ui/HolographicBackground";
import { ContactContent } from "@/components/contact/ContactContent";

export const metadata = {
  title: "Contact | W-Pull",
  description: "Get in touch with the W-Pull team",
};

export default function ContactPage() {
  return (
    <HolographicBackground
      particles
      particleCount={25}
      hexGrid
      dataStreams
      accentColor="cyan"
    >
      <ContactContent />
    </HolographicBackground>
  );
}
