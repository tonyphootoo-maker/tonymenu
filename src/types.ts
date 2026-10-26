export interface MenuPage {
  id: string;
  title: string;
  category?: string;
  imageUrl: string;
  description?: string;
  createdAt: number;
}

export interface RestaurantConfig {
  restaurantName: string;
  tagline: string;
  logoUrl?: string;
  lineId: string;
  phone: string;
  adminPin: string;
  accentColor: string;
}
