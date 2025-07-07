import { Button } from "@/components/ui/button";
import { Home, Mountain, Wrench, Heart } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { id: 'all', label: 'All Posts', icon: Home },
    { id: 'adventures', label: 'Motorhome Adventures', icon: Mountain },
    { id: 'mechanical', label: 'Mechanical Issues', icon: Wrench },
    { id: 'dog', label: 'The Dog', icon: Heart },
  ];

  return (
    <section className="bg-white py-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
