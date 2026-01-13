import { Carousel3D } from "@/components/layout/Carousel3D";
import { PackCard } from "@/components/packs/pack-card";
import { PACK_CONFIGS } from "@/lib/packs/config";
import Image from "next/image";

const images = [
  "https://storage.googleapis.com/wms-order-images/products/1767645340065-diamond-charizard.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767651621814-gardevoir.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767651649416-xerneas.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767650295753-mega-lucario.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767649995705-mega-venusaur.webp",
  "https://storage.googleapis.com/wms-order-images/products/1767645628625-mega-heracross.webp",
];

export default function PacksPage() {
  return (
    <div className="min-h-screen bg-accent-foreground">
      <Carousel3D
        images={images}
        width={160}
        height={240}
        depth={400}
        duration={30}
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          {/* <div className="flex justify-center">
            <Image src="/images/w.webp" alt="w-pull" width="100" height="100" />
          </div> */}
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose your pack and reveal your mystery card. Higher tier packs
            have better odds for rare pulls!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PACK_CONFIGS.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-gray-300">
          <p>
            All sales are final. Products are randomly selected based on pack
            odds.
          </p>
        </div>
      </div>
    </div>
  );
}
