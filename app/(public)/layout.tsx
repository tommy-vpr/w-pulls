import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-950">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
