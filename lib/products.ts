export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  color: string;
  description: string;
  leadTime: string;
};

export const products: Product[] = [
  {
    id: "wireless-earbuds",
    name: "Wireless Earbuds Pro",
    category: "Audio",
    price: 28500,
    emoji: "🎧",
    color: "#e0f2fe",
    description: "Noise-reducing Bluetooth earbuds with a charging case and up to 24 hours of total battery life.",
    leadTime: "Arrives in about 3–5 weeks",
  },
  {
    id: "smart-watch",
    name: "Smart Watch Series X",
    category: "Wearables",
    price: 45000,
    emoji: "⌚",
    color: "#ede9fe",
    description: "Fitness tracking, heart-rate monitor, message alerts and a bright AMOLED display.",
    leadTime: "Arrives in about 3–5 weeks",
  },
  {
    id: "mini-projector",
    name: "Mini HD Projector",
    category: "Home",
    price: 120000,
    emoji: "📽️",
    color: "#fef3c7",
    description: "Portable projector for movies and presentations, with HDMI and USB inputs.",
    leadTime: "Arrives in about 4–6 weeks",
  },
  {
    id: "ring-light",
    name: "LED Ring Light Kit",
    category: "Creator",
    price: 18000,
    emoji: "💡",
    color: "#fce7f3",
    description: "Dimmable ring light with a tripod stand and phone holder, ideal for content creators.",
    leadTime: "Arrives in about 3–5 weeks",
  },
  {
    id: "portable-blender",
    name: "Portable USB Blender",
    category: "Kitchen",
    price: 22000,
    emoji: "🥤",
    color: "#dcfce7",
    description: "Rechargeable blender for smoothies on the go, with a leak-proof bottle.",
    leadTime: "Arrives in about 3–5 weeks",
  },
  {
    id: "mechanical-keyboard",
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 35000,
    emoji: "⌨️",
    color: "#ffedd5",
    description: "Compact RGB mechanical keyboard with hot-swappable switches and wireless mode.",
    leadTime: "Arrives in about 3–5 weeks",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}