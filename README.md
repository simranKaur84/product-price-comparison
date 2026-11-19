# PriceCompare

A small offline product price comparison application using Next.js, TypeScript, and local JSON data.

## Features

- Search the catalog by product name, model number, or category.
- Display sample retailer offers for each product in ascending price order.
- Show in-stock and out-of-stock offer labels.
- Work without any live shopping API, credentials, or database server.

The demo catalog in `data/catalog.json` contains 20 products and 60 sample offers from four fictional retailers. All prices are synthetic and are not current market quotes.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run lint
npm run build
```

## Project structure

- `src/app/page.tsx` — product search and retailer offer display.
- `src/app/api/products/route.ts` — local catalog search API.
- `data/catalog.json` — products, retailers, and sample offers.
- `src/types/product.ts` — shared product and listing types.

## Current limitations

Offers are linked to catalog products by internal IDs. There is no independent reconciliation of conflicting retailer model numbers or product variants, shipping and tax calculation, duplicate offer management, or currency normalization. The listed price sorting is a basic demonstration, not a reliable final purchasing recommendation.
