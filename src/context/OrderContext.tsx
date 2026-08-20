import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Category, Product, Order, OrderStatus, OrderItem, ViewRole, RestaurantSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';
import { playOrderChime } from '../utils/soundAlert';
import {
  initTursoClient,
  fetchOrdersFromTurso,
  saveOrderToTurso,
  updateOrderStatusInTurso,
  fetchProductsFromTurso,
  fetchCategoriesFromTurso,
  fetchSettingsFromTurso,
  updateSettingsInTurso,
  DEFAULT_SETTINGS
} from '../services/tursoService';

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
  TABLE: 'restaurant_demo_table_v1',
  KDS_AUTH: 'restaurant_demo_kds_auth_v1',
  ADMIN_AUTH: 'restaurant_demo_admin_auth_v1'
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

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // SIEMPRE INICIAR EN VISTA CLIENTE POR DEFECTO PARA LOS COMENSALES
  const [currentRole, setCurrentRole] = useState<ViewRole>(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') || params.get('view');
    const path = window.location.pathname.toLowerCase();

    if (roleParam === 'kds' || roleParam === 'cocina' || params.has('kds') || params.has('cocina') || path.includes('kds') || path.includes('cocina')) {
      return 'kds';
    }
    if (roleParam === 'admin' || params.has('admin') || path.includes('admin')) {
      return 'admin';
    }
    return 'client';
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

  // Registro de IDs conocidos para alertar con timbre en el KDS
  const knownOrderIdsRef = useRef<Set<string>>(new Set(INITIAL_ORDERS.map(o => o.id)));

  // Cargar datos directamente desde Turso Cloud
  const fetchRemoteData = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setIsLoading(true);

      const [remoteOrders, remoteProducts, remoteCategories, remoteSettings] = await Promise.all([
        fetchOrdersFromTurso().catch(() => null),
        fetchProductsFromTurso().catch(() => null),
        fetchCategoriesFromTurso().catch(() => null),
        fetchSettingsFromTurso().catch(() => null)
      ]);

      if (remoteSettings) {
        setRestaurantSettings(remoteSettings);
      }
      if (remoteCategories && remoteCategories.length > 0) {
        setCategories(remoteCategories);
      }
      if (remoteProducts && remoteProducts.length > 0) {
        setProducts(remoteProducts);
      }

      if (remoteOrders && Array.isArray(remoteOrders)) {
        // Detectar si hay una comanda nueva que vino de otro dispositivo
        const brandNewOrders = remoteOrders.filter(ro => !knownOrderIdsRef.current.has(ro.id));

        if (brandNewOrders.length > 0 && isBackgroundPoll) {
          const newest = brandNewOrders[0];
          console.log('🔔 ¡NUEVA COMANDA DETECTADA EN TURSO!', newest.id);
          setNewOrderAlertId(newest.id);
          playOrderChime();
        }

        remoteOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
        setOrders(remoteOrders);
      }
    } catch (err) {
      console.warn('Sincronización Turso en segundo plano:', err);
    } finally {
      if (!isBackgroundPoll) setIsLoading(false);
    }
  }, []);

  // Inicializar tablas en Turso y primer fetch
  useEffect(() => {
    initTursoClient().then(() => {
      fetchRemoteData(false);
    });
  }, [fetchRemoteData]);

  // Polling cada 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRemoteData(true);
    }, 1500);

    return () => clearInterval(interval);
  }, [fetchRemoteData]);

  // Actualizar Ajustes
  const updateRestaurantSettings = useCallback(async (newSettings: Partial<RestaurantSettings>) => {
    setRestaurantSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    await updateSettingsInTurso(newSettings);
  }, []);

  // Detección de mesa por parámetro URL (ej: ?mesa=12 o ?table=12)
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

  // Crear nuevo pedido (Guarda directamente en Turso Cloud)
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

    // Guardar DIRECTAMENTE en Turso Database
    await saveOrderToTurso(newOrder);

    return newOrder;
  }, []);

  // Cambiar estado de pedido
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status } : order))
    );

    await updateOrderStatusInTurso(orderId, status);
  }, []);

  // Cambiar disponibilidad de producto
  const toggleProductAvailability = useCallback(async (productId: string) => {
    setProducts(prev =>
      prev.map(prod =>
        prod.id === productId ? { ...prod, is_available: !prod.is_available } : prod
      )
    );
  }, []);

  // CRUD Productos
  const addProduct = useCallback(async (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  // CRUD Categorías
  const addCategory = useCallback(async (catData: Omit<Category, 'id' | 'order_index'>) => {
    const newCategory: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      order_index: categories.length + 1
    };
    setCategories(prev => [...prev, newCategory]);
  }, [categories]);

  const updateCategory = useCallback(async (category: Category) => {
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }, []);

  // Reiniciar datos de demo
  const resetToSeedData = useCallback(async () => {
    setRestaurantSettings(DEFAULT_SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    knownOrderIdsRef.current = new Set(INITIAL_ORDERS.map(o => o.id));
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
