import { NextResponse } from "next/server";

type ShoppingResult = {
  title?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  product_link?: string;
  link?: string;
  thumbnail?: string;
  second_hand_condition?: string;
  delivery?: string;
};

type ShoppingResponse = {
  shopping_results?: ShoppingResult[];
  error?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search")?.trim() ?? "";

  if (!query || query.length > 150) {
    return NextResponse.json(
      { error: "Enter a product name or model number (up to 150 characters)." },
      { status: 400 }
    );
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Shopping search is not configured. Set SERPAPI_KEY on the server." },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    gl: "ca",
    hl: "en",
    api_key: apiKey,
  });

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Shopping search is temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as ShoppingResponse;
    if (data.error) {
      return NextResponse.json(
        { error: "Shopping search was rejected by the provider." },
        { status: 502 }
      );
    }

    const products = (Array.isArray(data.shopping_results) ? data.shopping_results : [])
      .filter(
        (item) =>
          typeof item.title === "string" &&
          typeof item.extracted_price === "number" &&
          Number.isFinite(item.extracted_price) &&
          item.extracted_price >= 0 &&
          typeof item.price === "string" &&
          item.price.length > 0
      )
      .map((item, index) => ({
        id: index,
        name: item.title!,
        retailer: item.source || "Retailer not specified",
        price: item.extracted_price!,
        displayPrice: item.price!,
        link: item.product_link || item.link || null,
        thumbnail: item.thumbnail || null,
        condition: item.second_hand_condition || null,
        delivery: item.delivery || null,
      }))
      .sort((a, b) => a.price - b.price);

    return NextResponse.json({
      success: true,
      query,
      count: products.length,
      products,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not retrieve shopping results. Please try again." },
      { status: 502 }
    );
  }
}
