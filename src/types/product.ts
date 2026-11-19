
export interface Product {
  id: number;
  name: string;
  model: string;
  category: string;
}

export interface Retailer {
  id: number;
  name: string;
  website: string;
}

export interface ProductListing {
  id: number;
  productId: number;
  retailerId: number;
  retailerProductName: string;
  price: number;
  currency: string;
  inStock: boolean;
  productUrl: string;
}
