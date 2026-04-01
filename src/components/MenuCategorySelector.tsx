import React from 'react';

interface MenuCategorySelectorProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function MenuCategorySelector({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: MenuCategorySelectorProps) {
  return (
    <div className="flex border-b border-stone-800 overflow-x-auto no-scrollbar">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`
              px-8 py-4 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap rounded-none
              ${isActive 
                ? 'text-brand-gold border-b border-brand-gold' 
                : 'text-stone-500 hover:text-white border-b border-transparent'}
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
