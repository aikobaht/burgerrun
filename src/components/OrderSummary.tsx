import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { formatCustomizations } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2 } from 'lucide-react';

export function OrderSummary() {
  const { session, orderItems, orders } = useStore();

  if (!session) return null;

  // Get current user's order
  const currentOrder = orders.find(
    (o) => o.person_token === session.personToken && o.group_id === session.groupId
  );

  if (!currentOrder) return null;

  // Get items for this order
  const myItems = orderItems.filter((item) => item.order_id === currentOrder.id);

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Remove this item from your order?')) return;

    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };

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
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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
  );
}
