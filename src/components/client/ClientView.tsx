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
import { Search } from 'lucide-react';

export const ClientView: React.FC = () => {
  const { categories, products } = useOrders();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

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
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Ultra Compacto */}
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
