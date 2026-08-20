import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const [tableNumber, setTableNumberState] = useState<string>('4');
  const [isTableLockedByQR, setIsTableLockedByQR] = useState(false);
  const [newOrderAlertId, setNewOrderAlertId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos iniciales desde la API / Turso DB si está disponible
  const fetchRemoteData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [settingsRes, catRes, prodRes, ordRes] = await Promise.allSettled([
        fetch('/api/settings').then(r => (r.ok ? r.json() : null)),
        fetch('/api/categories').then(r => (r.ok ? r.json() : null)),
        fetch('/api/products').then(r => (r.ok ? r.json() : null)),
        fetch('/api/orders').then(r => (r.ok ? r.json() : null))
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setRestaurantSettings(prev => ({ ...prev, ...settingsRes.value }));
      }
      if (catRes.status === 'fulfilled' && catRes.value && catRes.value.length > 0) {
        setCategories(catRes.value);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value && prodRes.value.length > 0) {
        setProducts(prodRes.value);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value) {
        setOrders(ordRes.value);
      }
    } catch (e) {
      console.warn('API no disponible temporalmente, usando estado local.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemoteData();
  }, [fetchRemoteData]);

  // Actualizar Ajustes del Restaurante (Nombre, Eslogan, Contraseñas)
  const updateRestaurantSettings = useCallback(async (newSettings: Partial<RestaurantSettings>) => {
    setRestaurantSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_SETTINGS', payload: updated });
        channel.close();
      }
      return updated;
    });

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {
      console.warn('No se pudo sincronizar settings con la nube:', e);
    }
  }, []);

  // Detección de mesa por parámetro URL (ej: ?mesa=5 o ?table=5)
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

  // Sincronización en tiempo real vía BroadcastChannel (Cross-tab sync)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel('restaurant_live_sync_channel');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'NEW_ORDER') {
        setOrders(prev => {
          if (prev.some(o => o.id === payload.id)) return prev;
          return [payload, ...prev];
        });
        setNewOrderAlertId(payload.id);
        playOrderChime();
      } else if (type === 'UPDATE_STATUS') {
        setOrders(prev =>
          prev.map(o => (o.id === payload.orderId ? { ...o, status: payload.status } : o))
        );
      } else if (type === 'UPDATE_SETTINGS') {
        setRestaurantSettings(payload);
      } else if (type === 'UPDATE_PRODUCTS') {
        setProducts(payload);
      } else if (type === 'UPDATE_CATEGORIES') {
        setCategories(payload);
      } else if (type === 'RESET_DATA') {
        setRestaurantSettings(DEFAULT_SETTINGS);
        setCategories(INITIAL_CATEGORIES);
        setProducts(INITIAL_PRODUCTS);
        setOrders(INITIAL_ORDERS);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

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

  // Crear nuevo pedido
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

    // Actualizar estado local
    setOrders(prev => [newOrder, ...prev]);
    setNewOrderAlertId(newOrder.id);
    playOrderChime();

    // Notificar a otras pestañas/pantallas
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('restaurant_live_sync_channel');
      channel.postMessage({ type: 'NEW_ORDER', payload: newOrder });
      channel.close();
    }

    // Guardar en Turso DB vía API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {
      console.warn('Guardado offline / memoria local');
    }

    return newOrder;
  }, []);

  // Cambiar estado de pedido
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status } : order))
    );

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('restaurant_live_sync_channel');
      channel.postMessage({ type: 'UPDATE_STATUS', payload: { orderId, status } });
      channel.close();
    }

    try {
      await fetch(`/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });
    } catch {}
  }, []);

  // Cambiar disponibilidad de producto (Disponible / Agotado)
  const toggleProductAvailability = useCallback(async (productId: string) => {
    setProducts(prev => {
      const updated = prev.map(prod =>
        prod.id === productId ? { ...prod, is_available: !prod.is_available } : prod
      );
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_PRODUCTS', payload: updated });
        channel.close();
      }
      return updated;
    });

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
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_PRODUCTS', payload: updated });
        channel.close();
      }
      return updated;
    });

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch {}
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === product.id ? product : p));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_PRODUCTS', payload: updated });
        channel.close();
      }
      return updated;
    });

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch {}
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_PRODUCTS', payload: updated });
        channel.close();
      }
      return updated;
    });

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
      const updated = [...prev, newCategory];
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_CATEGORIES', payload: updated });
        channel.close();
      }
      return updated;
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
    setCategories(prev => {
      const updated = prev.map(c => (c.id === category.id ? category : c));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_CATEGORIES', payload: updated });
        channel.close();
      }
      return updated;
    });

    try {
      await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
    } catch {}
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('restaurant_live_sync_channel');
        channel.postMessage({ type: 'UPDATE_CATEGORIES', payload: updated });
        channel.close();
      }
      return updated;
    });

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
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('restaurant_live_sync_channel');
      channel.postMessage({ type: 'RESET_DATA', payload: null });
      channel.close();
    }

    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}
  }, []);

  const clearNewOrderAlert = () => setNewOrderAlertId(null);

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
        isLoading
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
