"use client";

import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Props = {
  /* existing search props */
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  /* optional filter props */
  cuisines?: string[];
  availableCuisines?: string[];
  onCuisineChange?: (cuisines: string[]) => void;
};

export function RecipeSearchWithFilters({
  value,
  onChange,
  onKeyDown,

  cuisines = [],
  availableCuisines = [],
  onCuisineChange,
}: Props) {
  const toggleCuisine = (cuisine: string) => {
    if (!onCuisineChange) return;

    if (cuisines.includes(cuisine)) {
      onCuisineChange(cuisines.filter((c) => c !== cuisine));
    } else {
      onCuisineChange([...cuisines, cuisine]);
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      {/* 🔍 Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search recipes..."
          className="pl-9"
        />
      </div>

      {/* 🎛️ Filter (only if cuisines are provided) */}
      {/* {onCuisineChange && availableCuisines.length > 0 && ( */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-56">
          <div className="space-y-2">
            <p className="text-sm font-medium">Cuisine</p>

            <div className="max-h-48 space-y-2 overflow-auto">
              {availableCuisines.map((cuisine) => (
                <label
                  key={cuisine}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={cuisines.includes(cuisine)}
                    onCheckedChange={() => toggleCuisine(cuisine)}
                  />
                  {cuisine}
                </label>
              ))}
            </div>

            {cuisines.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onCuisineChange?.([])}
              >
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {/* )} */}
    </div>
  );
}
