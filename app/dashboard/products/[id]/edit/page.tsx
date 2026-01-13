import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { getProductByIdAction } from "@/app/actions/product.actions";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const result = await getProductByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ProductForm mode="edit" product={result.data} />
    </div>
  );
}
