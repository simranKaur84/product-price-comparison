import { NextResponse } from "next/server";
import catalog from "../../../../data/catalog.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();

  if (search.length > 150) {
    return NextResponse.json(
      { error: "Search terms must be 150 characters or fewer." },
      { status: 400 }
    );
  }

  const products = catalog.products
    .filter((product) =>
      `${product.name} ${product.model} ${product.category}`
        .toLowerCase()
        .includes(search)
    )
    .map((product) => ({
      ...product,
      offers: catalog.listings
        .filter((listing) => listing.productId === product.id)
        .map((listing) => ({
          ...listing,
          retailer:
            catalog.retailers.find((retailer) => retailer.id === listing.retailerId)
              ?.name ?? "Unknown retailer",
        }))
        .sort((a, b) => a.price - b.price),
    }));

  return NextResponse.json({ success: true, count: products.length, products });
}
