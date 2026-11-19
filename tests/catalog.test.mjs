import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(
  readFileSync(new URL("../data/catalog.json", import.meta.url), "utf8")
);

test("offline catalog has unique product and offer identifiers", () => {
  assert.ok(catalog.products.length >= 20);
  assert.ok(catalog.listings.length >= 60);
  assert.equal(new Set(catalog.products.map((p) => p.id)).size, catalog.products.length);
  assert.equal(new Set(catalog.listings.map((o) => o.id)).size, catalog.listings.length);
});

test("all offers reference existing products and retailers", () => {
  const products = new Set(catalog.products.map((p) => p.id));
  const retailers = new Set(catalog.retailers.map((r) => r.id));
  for (const offer of catalog.listings) {
    assert.ok(products.has(offer.productId), `Unknown product: ${offer.id}`);
    assert.ok(retailers.has(offer.retailerId), `Unknown retailer: ${offer.id}`);
    assert.equal(offer.currency, "CAD");
    assert.ok(Number.isFinite(offer.price) && offer.price >= 0);
    assert.equal(typeof offer.inStock, "boolean");
    assert.ok(
      offer.shippingCost === null ||
        (Number.isFinite(offer.shippingCost) && offer.shippingCost >= 0)
    );
  }
});

test("baseline supports searching names, models, and categories", () => {
  const find = (term) =>
    catalog.products.filter((p) =>
      `${p.name} ${p.model} ${p.category}`.toLowerCase().includes(term.toLowerCase())
    );

  assert.ok(find("WH-1000XM5").some((p) => p.id === 1));
  assert.ok(find("iPhone").length >= 2);
  assert.ok(find("Gaming").length >= 2);
  assert.deepEqual(find("NO_SUCH_PRODUCT_123"), []);
});

test("current baseline sorts advertised prices, not total cost", () => {
  const offers = catalog.listings
    .filter((offer) => offer.productId === 1)
    .sort((a, b) => a.price - b.price);

  assert.ok(offers.length >= 3);
  assert.deepEqual(
    offers.map((o) => o.price),
    offers.map((o) => o.price).sort((a, b) => a - b)
  );
});

test("catalog deliberately includes unresolved comparison edge cases", () => {
  assert.ok(catalog.listings.some((o) => o.retailerModel === "A3090-256"));
  assert.ok(catalog.listings.some((o) => o.retailerModel === "WH-1000XM4" && o.productId === 1));
  assert.ok(catalog.listings.some((o) => o.condition === "refurbished"));
  assert.ok(catalog.listings.some((o) => o.shippingCost === null));
  assert.ok(catalog.listings.some((o) => o.inStock === false));
  assert.ok(
    catalog.listings.some((offer) =>
      catalog.listings.some(
        (other) =>
          other.id !== offer.id &&
          other.productId === offer.productId &&
          other.retailerId === offer.retailerId
      )
    )
  );
});
