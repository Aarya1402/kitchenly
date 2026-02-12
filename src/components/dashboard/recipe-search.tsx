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
import "../recipes/scrollbar-hide.css"

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
    <div className="flex w-full items-center gap-3">
      {/* 🔍 Search */}
      <div className="relative flex-1 group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search recipes..."
          className="h-12 w-full rounded-2xl pl-11 text-base shadow-sm ring-offset-background transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* 🎛️ Filter (only if cuisines are provided) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-sm">
            <Filter className={cuisines.length > 0 ? "h-5 w-5 text-primary" : "h-5 w-5"} />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-64 rounded-xl p-4 shadow-lg ring-1 ring-black/5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none">Cuisine</p>
              {cuisines.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => onCuisineChange?.([])}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="max-h-60 space-y-1.5 overflow-auto scrollbar-hide py-1">
              {availableCuisines.map((cuisine) => (
                <label
                  key={cuisine}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                >
                  <Checkbox
                    checked={cuisines.includes(cuisine)}
                    onCheckedChange={() => toggleCuisine(cuisine)}
                    className="rounded-md"
                  />
                  <span className="text-sm font-medium">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
