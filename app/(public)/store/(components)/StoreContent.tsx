"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "./ProductCardSkeleton";
import { SerializedProduct } from "@/types/product";
import { Package } from "lucide-react";

interface StoreContentProps {
  products: SerializedProduct[];
  hasFilters: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

export function StoreContent({ products, hasFilters }: StoreContentProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [displayProducts, setDisplayProducts] = useState(products);
  const [key, setKey] = useState(searchParams.toString());

  // Detect when searchParams change (filter applied)
  useEffect(() => {
    const currentKey = searchParams.toString();

    if (currentKey !== key) {
      setIsLoading(true);
      setKey(currentKey);
    }
  }, [searchParams, key]);

  // Update products when they change from server
  useEffect(() => {
    setDisplayProducts(products);
    setIsLoading(false);
  }, [products]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ProductGridSkeleton count={12} />
      </motion.div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <Package className="h-16 w-16 text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-zinc-300">No products found</h3>
        <p className="mt-1 text-zinc-500">
          {hasFilters
            ? "Try adjusting your filters"
            : "Check back later for new items"}
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            custom={index}
            className="h-full"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
