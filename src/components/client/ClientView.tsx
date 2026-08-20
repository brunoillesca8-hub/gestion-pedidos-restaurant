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
import { Search, Sparkles } from 'lucide-react';

export const ClientView: React.FC = () => {
  const { categories, products } = useOrders();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Filtrado reactivo por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtrar por categoría
      const matchesCategory =
        selectedCategoryId === 'all' || product.category_id === selectedCategoryId;

      // Filtrar por texto de búsqueda
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Agrupación por categoría cuando se ve "Todo el menú" y no hay búsqueda
  const showGrouped = selectedCategoryId === 'all' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header & Table Badge */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categories Sticky Bar */}
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Main Catalog Container */}
      <main className="max-w-md md:max-w-4xl mx-auto px-4 pt-4">
        
        {/* Banner de Bienvenida o Búsqueda activa */}
        {searchQuery ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">
              Resultados para "{searchQuery}" ({filteredProducts.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : selectedCategoryId === 'all' ? (
          <div className="mb-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-3xl p-5 shadow-lg shadow-brand-600/15 relative overflow-hidden">
            <div className="relative z-10 max-w-xs">
              <span className="inline-flex items-center space-x-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Experiencia Gastronómica</span>
              </span>
              <h2 className="font-display font-bold text-lg md:text-xl leading-tight">
                Pide directo a la cocina desde tu mesa
              </h2>
              <p className="text-xs text-brand-100 mt-1">
                Selecciona tus platos favoritos, personalízalos a tu gusto y nosotros nos encargamos del resto.
              </p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>
        ) : null}

        {/* Listado de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-warmgray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-warmgray-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-warmgray-800 text-base">
              No encontramos platos
            </h3>
            <p className="text-xs text-warmgray-500 max-w-xs mx-auto mt-1">
              Intenta buscar con otros términos o selecciona una categoría diferente.
            </p>
          </div>
        ) : showGrouped ? (
          // Vista agrupada por secciones de categorías
          <div className="space-y-8">
            {categories
              .filter(c => c.is_active)
              .map(category => {
                const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
                if (categoryProducts.length === 0) return null;

                return (
                  <section key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-warmgray-200/70 pb-2">
                      <h3 className="font-display font-bold text-base md:text-lg text-warmgray-900">
                        {category.name}
                      </h3>
                      <span className="text-xs text-warmgray-400 font-medium">
                        {categoryProducts.length} {categoryProducts.length === 1 ? 'opción' : 'opciones'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
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
          // Grid regular cuando hay filtro o búsqueda
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
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
