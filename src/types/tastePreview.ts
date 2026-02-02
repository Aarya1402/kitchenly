export type TastePreview = {
  overallTaste: string;
  spiceLevel: "Low" | "Medium" | "Medium-High" | "High";
  richness: "Light" | "Balanced" | "Heavy";
  dominantFlavors: string[];
  bestFor: string;
};
