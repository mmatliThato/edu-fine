
export interface VatProduct {
  id: number;
  name: string;
  emoji: string;
  price: number;
  category: string;
}

export const vatProducts: VatProduct[] = [
  {
    id: 1,
    name: 'School Bag',
    emoji: '🎒',
    price: 150,
    category: 'School',
  },
  {
    id: 2,
    name: 'Headphones',
    emoji: '🎧',
    price: 180,
    category: 'Electronics',
  },
  {
    id: 3,
    name: 'Notebook',
    emoji: '📓',
    price: 40,
    category: 'School',
  },
  {
    id: 4,
    name: 'Sneakers',
    emoji: '👟',
    price: 200,
    category: 'Clothing',
  },
  {
    id: 5,
    name: 'Backpack',
    emoji: '🧳',
    price: 120,
    category: 'Accessories',
  },
  {
    id: 6,
    name: 'Water Bottle',
    emoji: '🥤',
    price: 60,
    category: 'Accessories',
  },
];
