import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import data from "../../../../data/retailers/listings.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const matches = products.filter((product) =>
    `${product.name} ${product.model} ${product.category}`
      .toLowerCase()
      .includes(search)
  );

  const results = matches.map((product) => {
    const offers = data.listings
      .filter((listing) => listing.productId === product.id)
      .map((listing) => ({
        ...listing,
        retailer: data.retailers.find(
          (retailer) => retailer.id === listing.retailerId
        )?.name ?? "Unknown retailer",
      }))
      .sort((a, b) => a.price - b.price);

    return { ...product, offers };
  });

  return NextResponse.json({
    success: true,
    count: results.length,
    products: results,
  });
}
