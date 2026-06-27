export interface Category {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly color?: string;
}

export const categoryChannel = (categoryId: string): string => `CAT_${categoryId}`;
