# PriceCompare

An offline product catalog and advertised-price comparison demo using Next.js, TypeScript, and a local JSON fixture.

## Existing functionality

- Search product name, model number, or category.
- Display each product's assigned retailer offers sorted by advertised item price (ascending).
- Display whether each offer is in stock.
- Run without external shopping APIs, API keys, or a database server.

The catalog in `data/catalog.json` contains 20 products, four fictional retailers, and 68 synthetic offers. Names and prices are sample data, not real-time prices or purchasing recommendations.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Baseline checks

```bash
npm test
npm run lint
npm run build
```

The tests in `tests/catalog.test.mjs` verify data integrity, search examples, sorting by listed price, and that several deliberate edge cases are present. They do **not** certify future cross-retailer matching or total-cost comparison correctness; those require new focused tests.

## Key files

- `data/catalog.json`: products, retailers, and synthetic listings.
- `src/app/api/products/route.ts`: search, ID-based offer joining, and advertised-price sorting.
- `src/app/page.tsx`: search input and results display.
- `src/types/product.ts`: product, retailer, and offer shapes.
- `tests/catalog.test.mjs`: offline baseline checks.

## Known limitations

Listings are assigned to catalog products by `productId` without verifying `retailerModel` or product variants. The baseline ignores `condition` and `shippingCost`, does not deduplicate merchant offers, and sorts out-of-stock items along with in-stock items. This is intentional: the fixture includes incorrectly matched variants, refurbished items, duplicate retailer listings, unknown shipping amounts, and unavailable offers to demonstrate those shortcomings. The application does not yet identify a genuinely comparable lowest-cost in-stock offer.

The matching, exclusion, total-cost, and recommendation behaviors have **not** been implemented.
