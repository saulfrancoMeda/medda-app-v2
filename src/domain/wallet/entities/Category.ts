/** Categoría de gasto (/wallet/categories/list). El canal de filtrado es `CAT_<id>`. */
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly color?: string;
}

/** Canal de movimientos para una categoría. */
export const categoryChannel = (categoryId: string): string => `CAT_${categoryId}`;
