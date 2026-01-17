import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Shield, Truck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";
import { AddToCartButton } from "./(components)/AddToCartButton";
import { ProductImageZoom } from "./(components)/ProductImageZoom";
import { RelatedProducts } from "./(components)/RelatedProducts";
import { MetalTierBadge } from "../(components)/Metaltierbadge";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const tierColors: Record<string, string> = {
  COMMON: "#78ff7c",
  UNCOMMON: "#b1ffb5",
  RARE: "#7cc8ff",
  ULTRA_RARE: "#ffd97c",
  SECRET_RARE: "#ff7cff",
  BANGER: "#ff7c7c",
  GRAIL: "#ffd700",
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!product) notFound();

  const tierConfig = getTierConfig(product.tier);
  const tierColor = tierColors[product.tier] || "#78ff7c";

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [{ category: product.category }, { tier: product.tier }],
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#020603] relative pt-12">
      {/* Scanline Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgba(120,255,124,0.05) 0px,
            rgba(120,255,124,0.05) 1px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 3px
          )`,
          mixBlendMode: "screen",
        }}
      />

      {/* Starfield Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,.6), transparent 60%),
            radial-gradient(1.5px 1.5px at 70% 20%, rgba(255,255,255,.5), transparent 60%),
            radial-gradient(1.2px 1.2px at 40% 80%, rgba(255,255,255,.4), transparent 60%),
            radial-gradient(1.2px 1.2px at 85% 65%, rgba(255,255,255,.35), transparent 60%)
          `,
          backgroundColor: "#000",
        }}
      />

      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Breadcrumbs */}
        <nav
          className="flex items-center gap-2 text-sm font-mono text-[#3de14d] mb-8"
          style={{ textShadow: "0 0 0.5px rgba(120,255,124,.35)" }}
        >
          <Link
            href="/store"
            className="hover:text-[#78ff7c] transition-colors"
          >
            STORE
          </Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <Link
                href={`/store?category=${product.category}`}
                className="hover:text-[#78ff7c] transition-colors"
              >
                {product.category.replace(/_/g, " ")}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-[#eafbe0] truncate max-w-[200px]">
            {product.title}
          </span>
        </nav>

        {/* Back Button (Mobile) */}
        <Link
          href="/store"
          className="inline-flex items-center gap-2 font-mono text-[#3de14d] hover:text-[#78ff7c] transition-colors mb-6 sm:hidden"
          style={{ textShadow: "0 0 0.5px rgba(120,255,124,.35)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO STORE
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div>
            <ProductImageZoom
              src={product.imageUrl}
              alt={product.title}
              tierColor={tierColor}
            />
          </div>

          {/* Right Column - Details */}
          <div className="flex flex-col">
            {/* Tier Badge */}
            <div className="mb-4">
              {/* <span
                className="inline-flex items-center rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border"
                style={{
                  color: tierColor,
                  background: `linear-gradient(180deg, ${tierColor}15, ${tierColor}08)`,
                  borderColor: `${tierColor}60`,
                  boxShadow: `inset 0 0 12px ${tierColor}20, 0 0 12px ${tierColor}25`,
                  textShadow: `0 0 8px ${tierColor}60`,
                }}
              >
                {tierConfig.label}
              </span> */}
              <MetalTierBadge label={tierConfig.label} tier={product.tier} />
            </div>

            {/* Title */}
            <h1
              className="font-['Oxanium',monospace] font-bold text-2xl sm:text-3xl lg:text-4xl text-[#eafbe0] mb-4"
              style={{ textShadow: "0 0 0.5px rgba(120,255,124,.35)" }}
            >
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-3xl sm:text-4xl font-bold font-mono text-[#78ff7c]"
                style={{ textShadow: "0 0 8px rgba(120,255,124,.5)" }}
              >
                ${product.price.toString()}
              </span>
              {product.inventory > 0 && product.inventory <= 5 && (
                <span
                  className="text-sm font-mono text-[#ff5b5b]"
                  style={{ textShadow: "0 0 4px rgba(255,91,91,.4)" }}
                >
                  ONLY {product.inventory} LEFT!
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2
                  className="text-sm font-mono font-bold text-[#78ff7c] uppercase tracking-wider mb-2"
                  style={{ textShadow: "0 0 4px rgba(120,255,124,.3)" }}
                >
                  Description
                </h2>
                <p
                  className="font-mono text-[#eafbe0] leading-relaxed"
                  style={{ textShadow: "0 0 0.5px rgba(120,255,124,.35)" }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details Panel */}
            <div className="relative mb-8">
              <div
                className="relative p-4 overflow-hidden"
                style={{
                  // BL + TR notch (matches your ask)
                  clipPath:
                    "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                  background:
                    "linear-gradient(180deg, rgba(7,20,9,.85), rgba(3,10,5,.85))",
                  boxShadow: "inset 0 0 30px rgba(120,255,124,.08)",
                  border: "1px solid rgba(120,255,124,.25)",
                }}
              >
                {/* TR notch bar (little 45deg detail like your CSS) */}
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top: 10,
                    right: -8,
                    width: 26,
                    height: 3,
                    background: "rgba(120,255,124,.6)",
                    transform: "rotate(45deg)",
                    boxShadow: "0 0 6px rgba(120,255,124,.35)",
                  }}
                />

                {/* BL notch bar */}
                <div
                  className="pointer-events-none absolute"
                  style={{
                    bottom: 10,
                    left: -8,
                    width: 26,
                    height: 3,
                    background: "rgba(120,255,124,.35)",
                    transform: "rotate(45deg)",
                  }}
                />

                {/* content */}
                <h2
                  className="text-sm font-mono font-bold text-[#78ff7c] uppercase tracking-wider mb-3"
                  style={{ textShadow: "0 0 4px rgba(120,255,124,.3)" }}
                >
                  Details
                </h2>

                <dl className="space-y-2 font-mono text-sm">
                  {product.sku && (
                    <div className="flex justify-between">
                      <dt className="text-[#3de14d]">SKU</dt>
                      <dd className="text-[#eafbe0]">{product.sku}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-[#3de14d]">CATEGORY</dt>
                    <dd className="text-[#eafbe0]">
                      {product.category?.replace(/_/g, " ") || "UNCATEGORIZED"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#3de14d]">TIER</dt>
                    <dd
                      style={{
                        color: tierColor,
                        textShadow: `0 0 4px ${tierColor}50`,
                      }}
                    >
                      {tierConfig.label}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#3de14d]">AVAILABILITY</dt>
                    <dd
                      className={cn(
                        "font-bold",
                        product.inventory > 0
                          ? "text-[#78ff7c]"
                          : "text-[#ff5b5b]"
                      )}
                      style={{
                        textShadow:
                          product.inventory > 0
                            ? "0 0 4px rgba(120,255,124,.4)"
                            : "0 0 4px rgba(255,91,91,.4)",
                      }}
                    >
                      {product.inventory > 0 ? "IN STOCK" : "OUT OF STOCK"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mb-8">
              <AddToCartButton
                productId={product.id}
                disabled={product.inventory <= 0}
              />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgba(120,255,124,.25)]">
              {[
                { icon: Shield, label: "AUTHENTIC" },
                { icon: Truck, label: "FAST SHIP" },
                { icon: Package, label: "SECURE" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div
                    className="p-2 rounded-full border border-[rgba(120,255,124,.35)]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(12,28,15,.95), rgba(6,16,9,.95))",
                      boxShadow: "inset 0 0 10px rgba(120,255,124,.1)",
                    }}
                  >
                    <Icon
                      className="w-5 h-5 text-[#3de14d]"
                      style={{
                        filter: "drop-shadow(0 0 2px rgba(120,255,124,.4))",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono text-[#3de14d] uppercase tracking-wider"
                    style={{ textShadow: "0 0 0.5px rgba(120,255,124,.35)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[rgba(120,255,124,.25)]">
            <h2
              className="font-['Oxanium',monospace] font-bold text-xl text-[#78ff7c] mb-6 uppercase tracking-wider"
              style={{ textShadow: "0 0 6px rgba(120,255,124,.4)" }}
            >
              You May Also Like
            </h2>
            <RelatedProducts products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
