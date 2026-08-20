import React, { useRef, useEffect } from 'react';
import { Category } from '../../types';
import { Coffee, UtensilsCrossed, Cake, GlassWater, Salad, Sparkles } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  UtensilsCrossed,
  Cake,
  GlassWater,
  Salad
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}) => {
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll activo al centro en dispositivos móviles
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const tab = activeTabRef.current;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;
      
      container.scrollTo({
        left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [selectedCategoryId]);

  const activeCategories = categories.filter(c => c.is_active);

  return (
    <nav className="sticky top-[108px] z-20 bg-[#FAF8F5]/95 backdrop-blur-md py-2.5 border-b border-warmgray-200/80 shadow-xs">
      <div
        ref={containerRef}
        className="max-w-md md:max-w-4xl mx-auto px-4 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {/* Opción Todos */}
        <button
          onClick={() => onSelectCategory('all')}
          ref={selectedCategoryId === 'all' ? activeTabRef : null}
          className={`flex-shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
            selectedCategoryId === 'all'
              ? 'bg-warmgray-900 text-white shadow-sm'
              : 'bg-white text-warmgray-600 border border-warmgray-200/90 hover:bg-warmgray-100 hover:text-warmgray-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Todo el Menú</span>
        </button>

        {/* Categorías dinámicas */}
        {activeCategories.map((cat) => {
          const Icon = (cat.icon && ICON_MAP[cat.icon]) ? ICON_MAP[cat.icon] : UtensilsCrossed;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              ref={isSelected ? activeTabRef : null}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                  : 'bg-white text-warmgray-600 border border-warmgray-200/90 hover:bg-warmgray-100 hover:text-warmgray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
