import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { formatCustomizations } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { EditItemModal } from './EditItemModal';
import { toast } from 'sonner';
import { Trash2, Edit } from 'lucide-react';
import { getMenuItemsByCategory, getSecretMenuItems } from '@/lib/menu';
import type { MenuItem } from '@/lib/types';

interface OrderSummaryProps {
  isFinalized?: boolean;
}

export function OrderSummary({ isFinalized = false }: OrderSummaryProps) {
  const { session, orderItems, orders } = useStore();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!session) return null;

  // Get current user's order
  const currentOrder = orders.find(
    (o) => o.person_token === session.personToken && o.group_id === session.groupId
  );

  if (!currentOrder) return null;

  // Get items for this order
  const myItems = orderItems.filter((item) => item.order_id === currentOrder.id);

  // Helper function to find menu item by name
  const getMenuItemByName = (name: string): MenuItem | undefined => {
    const allItems = [
      ...getMenuItemsByCategory('Burgers'),
      ...getMenuItemsByCategory('Sides'),
      ...getMenuItemsByCategory('Drinks'),
      ...getSecretMenuItems(),
    ];
    return allItems.find((item) => item.name === name);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Remove this item from your order?')) return;

    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Item removed from order');
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item');
    }
  };

  const editingItem = editingItemId ? myItems.find((item) => item.id === editingItemId) : null;
  const editingMenuItemDef = editingItem ? getMenuItemByName(editingItem.menu_item_name) : null;

  if (myItems.length === 0) {
    return (
      <Card className="sticky bottom-4 border-innout-red border-2 bg-white/95 backdrop-blur">
        <CardContent className="p-4 text-center text-muted-foreground">
          Your order is empty. Add items from the menu above!
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="sticky bottom-4 border-innout-red border-2 bg-white/95 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Your Order ({myItems.length} {myItems.length === 1 ? 'item' : 'items'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {myItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-innout-cream rounded-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">
                    {item.quantity}x {item.menu_item_name}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setEditingItemId(item.id);
                        setShowEditModal(true);
                      }}
                      title={isFinalized ? 'Order is finalized' : 'Edit item'}
                      disabled={isFinalized}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      title={isFinalized ? 'Order is finalized' : 'Delete item'}
                      disabled={isFinalized}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {item.customizations && (item.customizations as any[]).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCustomizations(item.customizations as any)}
                  </p>
                )}
                {item.special_instructions && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Note: {item.special_instructions}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Item Modal */}
      {editingItem && editingMenuItemDef && (
        <EditItemModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          item={editingItem}
          menuItem={editingMenuItemDef}
          onSave={() => {
            setEditingItemId(null);
          }}
        />
      )}
    </>
  );
}
