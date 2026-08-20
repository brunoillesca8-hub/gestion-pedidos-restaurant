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
    <nav className="sticky top-[53px] z-20 bg-[#FAF8F5]/95 backdrop-blur-md py-1.5 border-b border-warmgray-200/70 shadow-2xs">
      <div
        ref={containerRef}
        className="max-w-4xl mx-auto px-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {/* Opción Todos */}
        <button
          onClick={() => onSelectCategory('all')}
          ref={selectedCategoryId === 'all' ? activeTabRef : null}
          className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 ${
            selectedCategoryId === 'all'
              ? 'bg-warmgray-900 text-white shadow-xs'
              : 'bg-white text-warmgray-600 border border-warmgray-200/90 hover:bg-warmgray-100 hover:text-warmgray-900'
          }`}
        >
          <Sparkles className="w-3 h-3" />
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
              className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-warmgray-600 border border-warmgray-200/90 hover:bg-warmgray-100 hover:text-warmgray-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
