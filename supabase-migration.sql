-- BurgerRun Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT true
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  person_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  menu_item_name TEXT NOT NULL,
  menu_category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_orders_group_id ON orders(group_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_groups_is_active ON groups(is_active);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups table
-- Anyone can read active groups
CREATE POLICY "Anyone can read active groups"
  ON groups FOR SELECT
  USING (is_active = true);

-- Anyone can create a group
CREATE POLICY "Anyone can create a group"
  ON groups FOR INSERT
  WITH CHECK (true);

-- Only organizer can update their group
CREATE POLICY "Organizer can update their group"
  ON groups FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only organizer can delete their group
CREATE POLICY "Organizer can delete their group"
  ON groups FOR DELETE
  USING (true);

-- RLS Policies for orders table
-- Anyone can read orders in active groups
CREATE POLICY "Anyone can read orders in active groups"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = orders.group_id
      AND groups.is_active = true
    )
  );

-- Anyone can create an order
CREATE POLICY "Anyone can create an order"
  ON orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = orders.group_id
      AND groups.is_active = true
    )
  );

-- Anyone can update any order (organizer or participant)
CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = orders.group_id
      AND groups.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = orders.group_id
      AND groups.is_active = true
    )
  );

-- Anyone can delete orders
CREATE POLICY "Anyone can delete orders"
  ON orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = orders.group_id
      AND groups.is_active = true
    )
  );

-- RLS Policies for order_items table
-- Anyone can read order items from active groups
CREATE POLICY "Anyone can read order items from active groups"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN groups ON groups.id = orders.group_id
      WHERE orders.id = order_items.order_id
      AND groups.is_active = true
    )
  );

-- Anyone can create order items
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN groups ON groups.id = orders.group_id
      WHERE orders.id = order_items.order_id
      AND groups.is_active = true
    )
  );

-- Anyone can update order items
CREATE POLICY "Anyone can update order items"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN groups ON groups.id = orders.group_id
      WHERE orders.id = order_items.order_id
      AND groups.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN groups ON groups.id = orders.group_id
      WHERE orders.id = order_items.order_id
      AND groups.is_active = true
    )
  );

-- Anyone can delete order items
CREATE POLICY "Anyone can delete order items"
  ON order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN groups ON groups.id = orders.group_id
      WHERE orders.id = order_items.order_id
      AND groups.is_active = true
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
