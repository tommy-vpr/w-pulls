import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddToCartButton } from "./(components)/AddToCartButton";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      isActive: true,
    },
  });

  if (!product) notFound();

  return (
    <div className="bg-amber-200">
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>${product.price.toString()}</p>

      <AddToCartButton productId={product.id} />
    </div>
  );
}
