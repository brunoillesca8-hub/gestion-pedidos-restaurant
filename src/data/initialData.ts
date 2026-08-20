import { Category, Product, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Café de Especialidad', order_index: 1, icon: 'Coffee', is_active: true },
  { id: 'cat-2', name: 'Sandwiches & Tostadas', order_index: 2, icon: 'UtensilsCrossed', is_active: true },
  { id: 'cat-3', name: 'Pastelería & Dulces', order_index: 3, icon: 'Cake', is_active: true },
  { id: 'cat-4', name: 'Bebidas Frías & Mocktails', order_index: 4, icon: 'GlassWater', is_active: true },
  { id: 'cat-5', name: 'Bowls & Opciones Verdes', order_index: 5, icon: 'Salad', is_active: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Cafetería
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'Flat White Artesanal',
    description: 'Doble shot de espresso de grano origen Colombia con leche emulsionada sedosa y suave textura.',
    price: 3400,
    image_url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Recomendado', 'Café']
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    name: 'Caramel Macchiato Helado',
    description: 'Espresso intenso sobre leche fría, vainilla de Madagascar y un generoso baño de salsa de caramelo casero.',
    price: 4200,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Favorito']
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    name: 'Cappuccino Italiano Clásico',
    description: 'Espresso con proporción perfecta de leche vaporizada y espuma densa, terminado con toque de cacao belga.',
    price: 3200,
    image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Clásico']
  },
  {
    id: 'prod-4',
    category_id: 'cat-1',
    name: 'Matcha Latte Ceremonial',
    description: 'Té verde Matcha orgánico grado ceremonial de Uji, Japón, con leche cremosa (opción vegetal disponible).',
    price: 4500,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Vegano', 'Orgánico']
  },

  // Sandwiches & Tostadas
  {
    id: 'prod-5',
    category_id: 'cat-2',
    name: 'Tostón Avocado Royale',
    description: 'Pan de masa madre tostado, palta hass en láminas, huevo pochado de campo, semillas de sésamo tostado y brotes.',
    price: 6800,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Más Vendido', 'Brunch']
  },
  {
    id: 'prod-6',
    category_id: 'cat-2',
    name: 'Sandwich de Mechada & Queso Fundido',
    description: 'Carne braseada 8 horas en cerveza artesanal, queso mozzarella derretido, cebolla caramelizada en pan brioche.',
    price: 8900,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Especial del Chef']
  },
  {
    id: 'prod-7',
    category_id: 'cat-2',
    name: 'Croissant Jamón Serrano & Brie',
    description: 'Croissant artesanal de mantequilla 100% francesa, lonjas de jamón serrano reserva, queso brie y rúcula fresca.',
    price: 7400,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Gourmet']
  },

  // Pastelería & Dulces
  {
    id: 'prod-8',
    category_id: 'cat-3',
    name: 'Cheesecake Vasco Caramelizado',
    description: 'Tarta de queso estilo Donostia, horneada a alta temperatura con centro ultra cremoso y notas a toffee.',
    price: 4900,
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Destacado']
  },
  {
    id: 'prod-9',
    category_id: 'cat-3',
    name: 'Roll de Canela Glaseado',
    description: 'Masa esponjosa rellena de canela de Ceilán y azúcar rubia, bañada con glaseado tibio de queso crema.',
    price: 3600,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Recién Horneado']
  },
  {
    id: 'prod-10',
    category_id: 'cat-3',
    name: 'Waffles Belgas con Frutos Rojos',
    description: 'Waffles crujientes con azúcar perlado, salsa de frambuesas silvestres, arándanos frescos y crema chantilly.',
    price: 5800,
    image_url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
    is_available: false, // Producto de muestra agotado
    tags: ['Dulce']
  },

  // Bebidas Frías & Mocktails
  {
    id: 'prod-11',
    category_id: 'cat-4',
    name: 'Limonada Menta Jengibre',
    description: 'Jugo de limón natural recién exprimido, hojas de menta del huerto, toque de jengibre y endulzada con agave.',
    price: 3500,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Refrescante']
  },
  {
    id: 'prod-12',
    category_id: 'cat-4',
    name: 'Iced Passion Fruit Spritz',
    description: 'Pulpa natural de maracuyá, agua tónica premium, rodajas de naranja deshidratada y romero fresco.',
    price: 4400,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Mocktail', 'Sin Alcohol']
  },

  // Bowls & Opciones Verdes
  {
    id: 'prod-13',
    category_id: 'cat-5',
    name: 'Açaí Energy Bowl',
    description: 'Base helada de açaí orgánico con plátano, granola artesanal crocante, frutillas, mantequilla de maní y chía.',
    price: 6200,
    image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Vegano', 'Superfood']
  },
  {
    id: 'prod-14',
    category_id: 'cat-5',
    name: 'Poke Bowl Salmón Fresco & Quinoa',
    description: 'Cubos de salmón fresco, edamame, palta, pepino japonés, mango y aderezo ponzu sobre base de quinoa tricolor.',
    price: 9600,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    tags: ['Proteico', 'Saludable']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'CMD-101',
    table_number: 3,
    general_notes: 'Por favor traer servilletas extra.',
    total_amount: 15600,
    status: 'pendiente',
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // hace 4 min
    items: [
      {
        id: 'item-1',
        product_id: 'prod-6',
        product_name: 'Sandwich de Mechada & Queso Fundido',
        quantity: 1,
        unit_price: 8900,
        item_notes: 'Sin cebolla caramelizada, bien caliente',
        subtotal: 8900
      },
      {
        id: 'item-2',
        product_id: 'prod-1',
        product_name: 'Flat White Artesanal',
        quantity: 1,
        unit_price: 3400,
        item_notes: 'Con leche de avena',
        subtotal: 3400
      },
      {
        id: 'item-3',
        product_id: 'prod-11',
        product_name: 'Limonada Menta Jengibre',
        quantity: 1,
        unit_price: 3500,
        item_notes: 'Sin hielo y poco dulce',
        subtotal: 3500
      }
    ]
  },
  {
    id: 'CMD-102',
    table_number: 7,
    general_notes: 'Mesa de cumpleaños, gracias!',
    total_amount: 14900,
    status: 'preparando',
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // hace 14 min
    items: [
      {
        id: 'item-4',
        product_id: 'prod-5',
        product_name: 'Tostón Avocado Royale',
        quantity: 1,
        unit_price: 6800,
        item_notes: 'Huevo bien cocido',
        subtotal: 6800
      },
      {
        id: 'item-5',
        product_id: 'prod-8',
        product_name: 'Cheesecake Vasco Caramelizado',
        quantity: 1,
        unit_price: 4900,
        item_notes: 'Con dos tenedores',
        subtotal: 4900
      },
      {
        id: 'item-6',
        product_id: 'prod-3',
        product_name: 'Cappuccino Italiano Clásico',
        quantity: 1,
        unit_price: 3200,
        item_notes: 'Descafeinado si es posible',
        subtotal: 3200
      }
    ]
  },
  {
    id: 'CMD-103',
    table_number: 2,
    general_notes: '',
    total_amount: 7600,
    status: 'entregado',
    created_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(), // hace 32 min
    items: [
      {
        id: 'item-7',
        product_id: 'prod-2',
        product_name: 'Caramel Macchiato Helado',
        quantity: 1,
        unit_price: 4200,
        item_notes: '',
        subtotal: 4200
      },
      {
        id: 'item-8',
        product_id: 'prod-9',
        product_name: 'Roll de Canela Glaseado',
        quantity: 1,
        unit_price: 3600,
        item_notes: 'Calentar 30 segundos',
        subtotal: 3600
      }
    ]
  }
];
