export type OrderStatus = 'pendiente' | 'preparando' | 'entregado' | 'cerrado';

export interface Category {
  id: string;
  name: string;
  order_index: number;
  icon?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  tags?: string[]; // e.g., 'Vegano', 'Recomendado', 'Sin Gluten', 'Nuevo'
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  item_notes?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  table_number: number | string;
  general_notes?: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string; // ISO string
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  item_notes: string;
}

export type ViewRole = 'client' | 'kds' | 'admin';
