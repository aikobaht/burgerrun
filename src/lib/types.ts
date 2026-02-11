export interface Group {
  id: string;
  name: string;
  organizer_name: string;
  organizer_token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  is_finalized?: boolean;
}

export interface Order {
  id: string;
  group_id: string;
  person_name: string;
  person_token: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  menu_category: string;
  quantity: number;
  customizations: Customization[];
  special_instructions: string | null;
  created_at: string;
}

export interface Customization {
  type: string;
  value: string | number | boolean;
  label: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  isSecretMenu?: boolean;
  customizationOptions: CustomizationOption[];
}

export interface CustomizationOption {
  type: string;
  label: string;
  options?: string[];
  min?: number;
  max?: number;
  default?: string | number | boolean;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface GroupSession {
  groupId: string;
  orderId?: string;
  personName: string;
  personToken: string;
  isOrganizer: boolean;
  organizerToken?: string;
}
