"use client";

import "../recipes/scrollbar-hide.css";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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
    <div className="flex w-full items-center gap-3">
      {/* 🔍 Search */}
      <div className="group relative flex-1">
        <div className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search recipes..."
          className="ring-offset-background focus-visible:ring-ring h-12 w-full rounded-2xl pl-11 text-base shadow-sm transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>

      {/* 🎛️ Filter (only if cuisines are provided) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground h-12 w-12 rounded-2xl border transition-all hover:shadow-sm"
          >
            <Filter
              className={
                cuisines.length > 0 ? "text-primary h-5 w-5" : "h-5 w-5"
              }
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-64 rounded-xl p-4 shadow-lg ring-1 ring-black/5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm leading-none font-semibold">Cuisine</p>
              {cuisines.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary h-auto p-0 text-xs"
                  onClick={() => onCuisineChange?.([])}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="scrollbar-hide max-h-60 space-y-1.5 overflow-auto py-1">
              {availableCuisines.map((cuisine) => (
                <label
                  key={cuisine}
                  className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors"
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
