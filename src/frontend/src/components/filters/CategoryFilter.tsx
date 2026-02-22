import { Button } from '@/components/ui/button';
import { Category } from '../../backend';
import { Smartphone, Car, Home, Sofa, Shirt, Briefcase } from 'lucide-react';

interface CategoryFilterProps {
  selected: Category | null;
  onSelect: (category: Category | null) => void;
}

const categories = [
  { value: 'electronics' as Category, label: 'Electronics', icon: Smartphone },
  { value: 'vehicles' as Category, label: 'Vehicles', icon: Car },
  { value: 'realEstate' as Category, label: 'Real Estate', icon: Home },
  { value: 'furniture' as Category, label: 'Furniture', icon: Sofa },
  { value: 'fashion' as Category, label: 'Fashion', icon: Shirt },
  { value: 'services' as Category, label: 'Services', icon: Briefcase },
];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(null)}
      >
        All Categories
      </Button>
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Button
            key={category.value}
            variant={selected === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(category.value)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}
