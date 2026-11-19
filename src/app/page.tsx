
"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
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

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError("Unable to load products.");
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [search]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            PriceCompare
          </h1>

          <p className="mt-3 text-gray-600">
            Search products by name or model number.
          </p>
        </header>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter product name or model number..."
          className="w-full rounded-lg border border-gray-300 bg-white p-4 shadow-sm outline-none focus:border-blue-500"
        />

        <section className="mt-8 space-y-4">
          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : error ? (
            <p role="alert" className="text-center text-red-600">
              {error}
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">
              No products found.
            </p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">
                  {product.name}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Model: {product.model}
                </p>

                <p className="text-sm text-gray-600">
                  Category: {product.category}
                </p>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
