import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Category, Product, Order, OrderStatus, OrderItem, ViewRole, RestaurantSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';
import { playOrderChime } from '../utils/soundAlert';

interface OrderContextType {
  restaurantSettings: RestaurantSettings;
  updateRestaurantSettings: (newSettings: Partial<RestaurantSettings>) => Promise<void>;
  categories: Category[];
  products: Product[];
  orders: Order[];
  currentRole: ViewRole;
  setCurrentRole: (role: ViewRole) => void;
  isKDSAuthenticated: boolean;
  setIsKDSAuthenticated: (auth: boolean) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  isTableLockedByQR: boolean;
  createOrder: (tableNumber: string | number, items: OrderItem[], generalNotes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleProductAvailability: (productId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'order_index'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  resetToSeedData: () => void;
  newOrderAlertId: string | null;
  clearNewOrderAlert: () => void;
  isLoading: boolean;
  manualRefreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'restaurant_demo_settings_v1',
  CATEGORIES: 'restaurant_demo_categories_v1',
  PRODUCTS: 'restaurant_demo_products_v1',
  ORDERS: 'restaurant_demo_orders_v1',
  ROLE: 'restaurant_demo_role_v1',
  TABLE: 'restaurant_demo_table_v1',
  KDS_AUTH: 'restaurant_demo_kds_auth_v1',
  ADMIN_AUTH: 'restaurant_demo_admin_auth_v1'
};

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Café & Bistró Bellavista',
  tagline: 'Especialidad & Pastelería',
  admin_pin: '1234',
  kds_pin: '12345',
  currency_symbol: '$'
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [currentRole, setCurrentRole] = useState<ViewRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (saved as ViewRole) || 'client';
    } catch {
      return 'client';
    }
  });

  const [isKDSAuthenticated, setIsKDSAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.KDS_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [tableNumber, setTableNumberState] = useState<string>('12');
  const [isTableLockedByQR, setIsTableLockedByQR] = useState(false);
  const [newOrderAlertId, setNewOrderAlertId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mantener los IDs de pedidos conocidos para detectar nuevas comandas desde otros dispositivos
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map(o => o.id)));

  // Cargar datos desde la API / Turso DB con prevención estricta de caché
  const fetchRemoteData = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setIsLoading(true);

      const timestamp = Date.now();
      const [settingsRes, catRes, prodRes, ordRes] = await Promise.allSettled([
        fetch(`/api/settings?t=${timestamp}`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)),
        fetch(`/api/categories?t=${timestamp}`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)),
        fetch(`/api/products?t=${timestamp}`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)),
        fetch(`/api/orders?t=${timestamp}`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null))
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value && typeof settingsRes.value === 'object') {
        setRestaurantSettings(prev => ({ ...prev, ...settingsRes.value }));
      }
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value) && catRes.value.length > 0) {
        setCategories(catRes.value);
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
        setProducts(prodRes.value);
      }

      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value)) {
        const remoteOrders: Order[] = ordRes.value;

        // Detectar si hay alguna comanda que no estaba en el conjunto de comandas conocidas
        const brandNewOrders = remoteOrders.filter(ro => !knownOrderIdsRef.current.has(ro.id));

        if (brandNewOrders.length > 0 && isBackgroundPoll) {
          const newest = brandNewOrders[0];
          console.log('🔔 ¡NUEVA COMANDA ENTRANTE DESDE LA NUBE TURSO!', newest.id);
          setNewOrderAlertId(newest.id);
          playOrderChime();
        }

        // Actualizar el conjunto de IDs conocidos
        remoteOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
        setOrders(remoteOrders);
      }
    } catch (e) {
      console.warn('Error al sincronizar con Turso API:', e);
    } finally {
      if (!isBackgroundPoll) setIsLoading(false);
    }
  }, []);

  // Fetch inicial
  useEffect(() => {
    fetchRemoteData(false);
  }, [fetchRemoteData]);

  // POLLING EN TIEMPO REAL ACTIVO (Cada 2 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRemoteData(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchRemoteData]);

  // Actualizar Ajustes del Restaurante
  const updateRestaurantSettings = useCallback(async (newSettings: Partial<RestaurantSettings>) => {
    setRestaurantSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch {}
  }, []);

  // Detección de mesa por parámetro URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaParam = params.get('mesa') || params.get('table');
    if (mesaParam) {
      setTableNumberState(mesaParam);
      setIsTableLockedByQR(true);
      localStorage.setItem(STORAGE_KEYS.TABLE, mesaParam);
    } else {
      const savedTable = localStorage.getItem(STORAGE_KEYS.TABLE);
      if (savedTable) {
        setTableNumberState(savedTable);
      }
    }
  }, []);

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    localStorage.setItem(STORAGE_KEYS.TABLE, table);
  };

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(restaurantSettings));
    } catch {}
  }, [restaurantSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    } catch {}
  }, [currentRole]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.KDS_AUTH, isKDSAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isKDSAuthenticated]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdminAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isAdminAuthenticated]);

  // Crear nuevo pedido (Celular ➔ Base de Datos Turso en la nube)
  const createOrder = useCallback(async (
    table: string | number,
    items: OrderItem[],
    generalNotes?: string
  ): Promise<Order> => {
    const nextOrderNum = Math.floor(100 + Math.random() * 900);
    const newOrder: Order = {
      id: `CMD-${nextOrderNum}`,
      table_number: table,
      general_notes: generalNotes?.trim() || '',
      total_amount: items.reduce((sum, item) => sum + item.subtotal, 0),
      status: 'pendiente',
      created_at: new Date().toISOString(),
      items
    };

    // Registrar como conocido localmente
    knownOrderIdsRef.current.add(newOrder.id);
    setOrders(prev => [newOrder, ...prev]);

    // Guardar en Turso DB vía API
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) {
        console.error('Error al guardar en /api/orders:', await res.text());
      }
    } catch (e) {
      console.warn('Error de red al enviar a la API:', e);
    }

    return newOrder;
  }, []);

  // Cambiar estado de pedido
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status } : order))
    );

    try {
      await fetch(`/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });
    } catch {}
  }, []);

  // Cambiar disponibilidad de producto
  const toggleProductAvailability = useCallback(async (productId: string) => {
    setProducts(prev =>
      prev.map(prod =>
        prod.id === productId ? { ...prod, is_available: !prod.is_available } : prod
      )
    );

    try {
      await fetch(`/api/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, toggleAvailabilityOnly: true })
      });
    } catch {}
  }, []);

  // CRUD Productos
  const addProduct = useCallback(async (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch {}
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch {}
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));

    try {
      await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });
    } catch {}
  }, []);

  // CRUD Categorías
  const addCategory = useCallback(async (catData: Omit<Category, 'id' | 'order_index'>) => {
    let newCategory: Category;
    setCategories(prev => {
      newCategory = {
        ...catData,
        id: `cat-${Date.now()}`,
        order_index: prev.length + 1
      };
      return [...prev, newCategory];
    });

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory!)
      });
    } catch {}
  }, []);

  const updateCategory = useCallback(async (category: Category) => {
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));

    try {
      await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
    } catch {}
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));

    try {
      await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE'
      });
    } catch {}
  }, []);

  // Reiniciar datos de demo
  const resetToSeedData = useCallback(async () => {
    setRestaurantSettings(DEFAULT_SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    knownOrderIdsRef.current = new Set(INITIAL_ORDERS.map(o => o.id));
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);

    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}
  }, []);

  const clearNewOrderAlert = () => setNewOrderAlertId(null);

  const manualRefreshOrders = useCallback(async () => {
    await fetchRemoteData(false);
  }, [fetchRemoteData]);

  return (
    <OrderContext.Provider
      value={{
        restaurantSettings,
        updateRestaurantSettings,
        categories,
        products,
        orders,
        currentRole,
        setCurrentRole,
        isKDSAuthenticated,
        setIsKDSAuthenticated,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        tableNumber,
        setTableNumber,
        isTableLockedByQR,
        createOrder,
        updateOrderStatus,
        toggleProductAvailability,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        resetToSeedData,
        newOrderAlertId,
        clearNewOrderAlert,
        isLoading,
        manualRefreshOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders debe ser usado dentro de OrderProvider');
  }
  return context;
};
