type DataCategory = 'income_median' | 'population' | 'crime' | 'water_consumption' | 'expenditure';

interface CategorySelectorProps {
  selectedCategory: DataCategory;
  onCategoryChange: (category: DataCategory) => void;
}

const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  const categories = [
    { id: 'income_median' as DataCategory, label: '💰 Income' },
    { id: 'population' as DataCategory, label: '👥 Population' },
    { id: 'crime' as DataCategory, label: '🚨 Crime' },
    { id: 'water_consumption' as DataCategory, label: '💧 Water' },
    { id: 'expenditure' as DataCategory, label: '💸 Expenditure' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`cursor-pointer px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold transition-all text-sm lg:text-base ${
            selectedCategory === category.id
              ? 'bg-sky-600 text-white shadow-lg'
              : 'bg-white border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;

