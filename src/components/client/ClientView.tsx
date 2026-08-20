import React, { useState, useMemo } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Product, Order } from '../../types';
import { Header } from './Header';
import { CategoryNav } from './CategoryNav';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { FloatingCartBar } from './FloatingCartBar';
import { CartDrawer } from './CartDrawer';
import { OrderSuccessModal } from './OrderSuccessModal';
import { Search, Lock, ChefHat, Settings, ShieldCheck, X } from 'lucide-react';

export const ClientView: React.FC = () => {
  const { categories, products, setCurrentRole, restaurantSettings } = useOrders();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Filtrado reactivo por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory =
        selectedCategoryId === 'all' || product.category_id === selectedCategoryId;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const showGrouped = selectedCategoryId === 'all' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 flex flex-col justify-between">
      <div>
        {/* Header Ultra Compacto (Sin ninguna barra de admin/cocina encima) */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Categories Slim Sticky Bar */}
        <CategoryNav
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* Main Catalog Container (Dense 3-Column Grid) */}
        <main className="max-w-4xl mx-auto px-2 pt-2.5">
          
          {/* Banner de búsqueda si hay filtro de texto */}
          {searchQuery && (
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[11px] font-semibold text-warmgray-500 uppercase tracking-wider">
                Resultados para "{searchQuery}" ({filteredProducts.length})
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-brand-600 font-semibold hover:underline"
              >
                Limpiar
              </button>
            </div>
          )}

          {/* Listado de Productos */}
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 bg-warmgray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-warmgray-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-warmgray-800 text-sm">
                No encontramos platos
              </h3>
              <p className="text-xs text-warmgray-500 max-w-xs mx-auto mt-0.5">
                Intenta buscar con otros términos o selecciona una categoría diferente.
              </p>
            </div>
          ) : showGrouped ? (
            // Vista agrupada densa de 3 columnas
            <div className="space-y-4">
              {categories
                .filter(c => c.is_active)
                .map(category => {
                  const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
                  if (categoryProducts.length === 0) return null;

                  return (
                    <section key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between border-b border-warmgray-200/60 pb-1 px-0.5">
                        <h3 className="font-display font-bold text-xs sm:text-sm text-warmgray-900">
                          {category.name}
                        </h3>
                        <span className="text-[10px] text-warmgray-400 font-medium">
                          {categoryProducts.length} {categoryProducts.length === 1 ? 'opción' : 'opciones'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {categoryProducts.map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={setSelectedProduct}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
            </div>
          ) : (
            // Grid regular denso de 3 columnas cuando hay filtro o búsqueda
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Footer Discreto con Acceso para Personal */}
      <footer className="mt-12 py-6 border-t border-warmgray-200/60 text-center">
        <p className="text-[11px] text-warmgray-400">
          {restaurantSettings.name || 'Café & Bistró'} • Menú Digital
        </p>
        <button
          onClick={() => setIsStaffModalOpen(true)}
          className="mt-1.5 text-[10px] text-warmgray-400 hover:text-warmgray-600 transition-colors inline-flex items-center space-x-1"
        >
          <Lock className="w-2.5 h-2.5" />
          <span>Acceso Personal</span>
        </button>
      </footer>

      {/* Modal Discreto de Selección de Acceso para Personal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-warmgray-100 relative text-center">
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-warmgray-400 hover:text-warmgray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-warmgray-100 text-warmgray-700 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h3 className="font-display font-bold text-sm text-warmgray-900">
              Acceso Personal Autorizado
            </h3>
            <p className="text-[11px] text-warmgray-500 mb-4">
              Selecciona el panel al que deseas ingresar
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsStaffModalOpen(false);
                  setCurrentRole('kds');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-warmgray-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <ChefHat className="w-4 h-4 text-brand-400" />
                <span>Cocina / KDS</span>
              </button>

              <button
                onClick={() => {
                  setIsStaffModalOpen(false);
                  setCurrentRole('admin');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-warmgray-100 hover:bg-warmgray-200 text-warmgray-800 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <Settings className="w-4 h-4 text-warmgray-600" />
                <span>Administración & Menú</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar />

      {/* Product Customization / Special Instructions Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Cart Summary & Order Placement Drawer */}
      <CartDrawer
        onOrderSuccess={(order) => {
          setLastPlacedOrder(order);
        }}
      />

      {/* Order Success & Live Status Tracker */}
      <OrderSuccessModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
      />
    </div>
  );
};
