"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  selectedCategories: string[];
  availableCategories: string[];
  onCategoryChange: (categories: string[]) => void;
};

export function SearchAndFilterBar({
  value,
  onChange,
  onKeyDown,
  selectedCategories,
  availableCategories,
  onCategoryChange,
}: Props) {
  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      {/* 🔍 Search */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search ingredients..."
          className="pl-9"
        />
      </div>

      {/* 🎛️ Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-56">
          <div className="space-y-2">
            <p className="text-sm font-medium">Category</p>

            <div className="scrollbar-hide max-h-48 space-y-2 overflow-auto">
              {availableCategories.map((category) => (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  {category}
                </label>
              ))}
            </div>

            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onCategoryChange([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
