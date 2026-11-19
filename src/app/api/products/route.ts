import { NextResponse } from "next/server";
import { products } from "@/lib/products";

export async function GET(request:Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();

    const results = search 
    ? products.filter((product) =>  
        `${product.name} ${product.model}`
          .toLowerCase()
          .includes(search)
        ) : products;

    return NextResponse.json({
    success: true,
    count: results.length,
    products: results,
  });
}