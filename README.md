# PriceCompare

Search Google Shopping listings for a product name or model number and display retailer offers from lowest listed price to highest.

## Setup

Requires Node.js and npm.

```bash
npm install
```

Create a local `.env.local` file in the project root:

```dotenv
SERPAPI_KEY=your_serpapi_api_key
```

Get an API key at https://serpapi.com/. Never commit your key. The existing `.gitignore` excludes `.env*` files.

Start the application:

```bash
npm run dev
```

Open http://localhost:3000 and search for a product by name or model number. Click **Compare prices** to request live results. Searches are sent only when submitted, not on every keystroke.

The backend endpoint is `GET /api/products?search=Sony%20WH-1000XM5`.

To check the project:

```bash
npm run lint
npm run build
```

## How it works

- The Next.js server calls SerpApi's `google_shopping` engine with Canadian locale settings.
- Results with a numeric extracted price are sorted in ascending order and returned to the browser.
- The page displays each listing's name, retailer, quoted price, thumbnail, and link when available.
- Missing API configuration and upstream errors are shown explicitly. No sample products or fake fallback prices are returned.

**Limitations:** Shopping search results may include different variants, conditions, bundles, or inaccurate product matches. Listed prices may omit shipping and taxes. Prices and retailer availability are not independently verified by this application. SerpApi needs network access, an active API key, and available request quota.
