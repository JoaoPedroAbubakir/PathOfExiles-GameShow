export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  value?: number;
  count?: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  icon: string;
  inventory: InventoryItem[];
}
