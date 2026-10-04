import { Umbrella, Sunrise, Mountain, Trees, Waves, Gem, Flame, Leaf, Building2 } from "lucide-react";

export const CATEGORIES = [
  { value: "Beach", label: "Beach", icon: Umbrella },
  { value: "Amazing views", label: "Amazing views", icon: Sunrise },
  { value: "Mountain", label: "Mountains", icon: Mountain },
  { value: "Countryside", label: "Countryside", icon: Trees },
  { value: "Pools", label: "Pools", icon: Waves },
  { value: "Luxury", label: "Luxury", icon: Gem },
  { value: "Trending", label: "Trending", icon: Flame },
  { value: "Nature", label: "Nature", icon: Leaf },
  { value: "City", label: "Cities", icon: Building2 },
];
export const SORT_OPTIONS = [
  { value: "", label: "Recommended" }, { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" }, { value: "rating", label: "Top rated" },
];
export const FILTER_KEYS = ["location", "max_price", "guests", "min_rating", "sort"];
