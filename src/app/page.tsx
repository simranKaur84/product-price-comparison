"use client";

import { FormEvent, useRef, useState } from "react";

type ShoppingProduct = {
  id: number;
  name: string;
  retailer: string;
  price: number;
  displayPrice: string;
  link: string | null;
  thumbnail: string | null;
  condition: string | null;
  delivery: string | null;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [searchedFor, setSearchedFor] = useState("");
  const [products, setProducts] = useState<ShoppingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query || loading) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    setProducts([]);
    setSearchedFor(query);

    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to search products.");
      }
      setProducts(data.products);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error.message : "Unable to search products.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold">PriceCompare</h1>
          <p className="mt-3 text-gray-600">
            Search any product or model number to compare shopping listings.
          </p>
        </header>

        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <input
            id="product-search"
            type="search"
            maxLength={150}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try Sony WH-1000XM5 or a model number"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white p-4 shadow-sm outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !search.trim()}
            className="rounded-lg bg-blue-700 px-6 py-4 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Compare prices"}
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-500">
          Live shopping search results. Prices are listed from lowest to highest;
          different variants, conditions, shipping costs, and stock availability may affect comparisons.
        </p>

        <section className="mt-8 space-y-4" aria-live="polite">
          {loading ? (
            <p className="text-center text-gray-600">Searching retailers...</p>
          ) : error ? (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
          ) : searchedFor && products.length === 0 ? (
            <p className="text-center text-gray-600">
              No priced shopping listings found for &ldquo;{searchedFor}&rdquo;.
            </p>
          ) : products.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold">
                {products.length} results for &ldquo;{searchedFor}&rdquo; — lowest price first
              </h2>
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  {product.thumbnail && (
                    // Images come from shopping search and can have arbitrary hosts.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.thumbnail}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-28 w-28 shrink-0 rounded-lg object-contain"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{product.retailer}</p>
                    {product.condition && (
                      <p className="text-sm text-gray-500">
                        Condition: {product.condition}
                      </p>
                    )}
                    {product.delivery && (
                      <p className="text-sm text-gray-500">{product.delivery}</p>
                    )}
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="text-xl font-bold">{product.displayPrice}</p>
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-blue-700 underline"
                      >
                        View retailer listing
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </>
          ) : (
            <p className="text-center text-gray-500">
              Enter a product name or model number to see retailer listings.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
