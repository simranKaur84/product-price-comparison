"use client";

import { useEffect, useState } from "react";
import type { Product, ProductListing } from "@/types/product";

type Offer = ProductListing & { retailer: string };
type ProductWithOffers = Product & { offers: Offer[] };

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Unable to load products.");
        const result = await response.json();
        if (!Array.isArray(result.products)) throw new Error("Invalid catalog response.");
        setProducts(result.products);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : "Unable to load products.");
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    const timer = setTimeout(loadProducts, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 text-center">
          <h1 className="text-4xl font-bold">PriceCompare</h1>
          <p className="mt-3 text-gray-600">
            Search our catalog by name, model number, or category.
          </p>
        </header>

        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          maxLength={150}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Try headphones, WH-1000XM5, iPhone, or gaming..."
          className="w-full rounded-lg border border-gray-300 bg-white p-4 shadow-sm outline-none focus:border-blue-500"
        />
        <p className="mt-3 text-sm text-gray-500">
          Offline demonstration catalog. All retailer names and prices are fictional.
        </p>

        <section className="mt-8 space-y-5" aria-live="polite">
          {loading ? (
            <p className="text-center text-gray-600">Searching catalog...</p>
          ) : error ? (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products found.</p>
          ) : (
            <>
              <h2 className="text-sm font-medium text-gray-600">
                {products.length} product{products.length === 1 ? "" : "s"} found
              </h2>
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Model: {product.model} · {product.category}
                  </p>
                  <h4 className="mt-5 font-medium">Retailer prices — lowest first</h4>
                  {product.offers.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">No offers available.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-gray-100">
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
                          <span className="text-lg font-semibold">
                            {new Intl.NumberFormat("en-CA", {
                              style: "currency",
                              currency: offer.currency,
                            }).format(offer.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
