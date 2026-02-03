
export interface Asset {
  id: string;
  name: string;
  type: string;
  brand?: string;
  description?: string;
  condition: string;
  serial_number?: string;
  asset_id?: string;
  assigned_to?: string;
  assignedTo?: string;
  department?: string;
  purchase_date?: string;
  purchased_date?: string;
  warranty_expiry?: string;
  status?: string;
  notes?: string;
  creation_date?: string;
  last_updated?: string;
  lastUpdated?: string;
  division_id?: string;
  division?: string;
  unit?: string;
  email?: string;
  vendor?: string;
  model?: string;
  assigned_date?: string;
  assignedDate?: string;
  image?: string;
  value?: number;
  category?: string;
  [key: string]: any;
}
