export type AggregatedItem = {
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isChecked: boolean;
};

/** Used in export-pdf where key is not stored on the item. */
export type ExportPdfGroupItem = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isChecked: boolean;
};
