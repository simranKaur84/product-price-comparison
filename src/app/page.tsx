"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";

type Offer = {
  id: number;
  retailer: string;
  retailerProductName: string;
  price: number;
  currency: string;
  inStock: boolean;
  productUrl: string;
};

type ProductWithOffers = Product & { offers: Offer[] };

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data.products);
      } catch {
        if (controller.signal.aborted) return;
        setError("Unable to load products.");
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [search]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold">PriceCompare</h1>
          <p className="mt-3 text-gray-600">
            Search products by name or model number and compare sample retailer prices.
          </p>
        </header>

        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Enter product name or model number..."
          className="w-full rounded-lg border border-gray-300 bg-white p-4 shadow-sm outline-none focus:border-blue-500"
        />

        <p className="mt-3 text-sm text-gray-500">
          Demonstration prices only — not current retailer quotes.
        </p>

        <section className="mt-8 space-y-6" aria-live="polite">
          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : error ? (
            <p role="alert" className="text-center text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products found.</p>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Model: {product.model} · {product.category}
                </p>

                <h3 className="mt-5 font-medium">Retailer offers — lowest to highest</h3>
                {product.offers.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No retailer offers available.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-gray-100">
                    {product.offers.map((offer) => (
                      <li
                        key={offer.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <div>
                          <p className="font-medium">{offer.retailer}</p>
                          <p className="text-sm text-gray-500">
                            {offer.inStock ? "In stock" : "Out of stock"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {new Intl.NumberFormat("en-CA", {
                              style: "currency",
                              currency: offer.currency,
                            }).format(offer.price)}
                          </p>
                          {offer.productUrl && (
                            <a
                              href={offer.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-700 underline"
                            >
                              View offer
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
