import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { formatCustomizations } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Printer, Lock, Unlock } from 'lucide-react';

export function ReviewPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { session, currentGroup, orders, orderItems, setOrders, setOrderItems, setCurrentGroup } = useStore();
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    if (!session?.isOrganizer || session.groupId !== groupId) {
      navigate(`/group/${groupId}`);
      return;
    }

    loadData();
    subscribeToRealtime();
  }, [groupId, session]);

  const loadData = async () => {
    if (!groupId) return;

    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (ordersData) {
        setOrders(ordersData);
      }

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', ordersData?.map(o => o.id) || []);

      if (itemsData) {
        setOrderItems(itemsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const subscribeToRealtime = () => {
    if (!groupId) return;

    const ordersChannel = supabase
      .channel(`review-orders-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `group_id=eq.${groupId}`,
        },
        () => loadData()
      )
      .subscribe();

    const itemsChannel = supabase
      .channel(`review-items-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
      itemsChannel.unsubscribe();
    };
  };

  const handleDeleteOrder = async (orderId: string, personName: string) => {
    if (!confirm(`Delete ${personName}'s entire order?`)) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;

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

  const handleFinalizeOrder = async () => {
    if (!currentGroup) return;

    if (!confirm('Finalize this order? Changes will be locked until reopened.')) return;

    setIsFinalizing(true);

    try {
      const { error } = await supabase
        .from('groups')
        .update({ is_finalized: true })
        .eq('id', groupId);

      if (error) throw error;

      setCurrentGroup({ ...currentGroup, is_finalized: true });
      toast.success('Order finalized! No more changes allowed.');
    } catch (err) {
      console.error('Error finalizing order:', err);
      toast.error('Failed to finalize order');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleReopenOrder = async () => {
    if (!currentGroup) return;

    if (!confirm('Reopen this order? Changes will be allowed again.')) return;

    setIsFinalizing(true);

    try {
      const { error } = await supabase
        .from('groups')
        .update({ is_finalized: false })
        .eq('id', groupId);

      if (error) throw error;

      setCurrentGroup({ ...currentGroup, is_finalized: false });
      toast.success('Order reopened! Changes are now allowed.');
    } catch (err) {
      console.error('Error reopening order:', err);
      toast.error('Failed to reopen order');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (!session?.isOrganizer || !currentGroup) {
    return <div>Loading...</div>;
  }

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white">
      {/* Header */}
      <div className="bg-innout-red text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => navigate(`/group/${groupId}`)}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Review Orders</h1>
              <p className="text-sm opacity-90">{currentGroup.name}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/group/${groupId}/print`)}
              className="text-xs"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print View
            </Button>
            {!currentGroup.is_finalized ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleFinalizeOrder}
                disabled={isFinalizing}
                className="text-xs text-white border-white hover:bg-white/20"
              >
                <Lock className="w-4 h-4 mr-1" />
                {isFinalizing ? 'Finalizing...' : 'Finalize Order'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReopenOrder}
                disabled={isFinalizing}
                className="text-xs text-white border-white hover:bg-white/20"
              >
                <Unlock className="w-4 h-4 mr-1" />
                {isFinalizing ? 'Reopening...' : 'Reopen Order'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Finalized Banner */}
      {currentGroup.is_finalized && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 max-w-4xl mx-auto mt-4">
          <p className="text-yellow-700 font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Order Finalized
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            This order is locked and cannot be modified. Click "Reopen Order" to allow changes.
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        {/* Summary */}
        <Card className="mb-4 border-innout-yellow border-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-innout-red">{orders.length}</div>
                <div className="text-sm text-muted-foreground">
                  {orders.length === 1 ? 'Person' : 'People'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-innout-red">{totalItems}</div>
                <div className="text-sm text-muted-foreground">
                  Total {totalItems === 1 ? 'Item' : 'Items'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Person */}
        <div className="space-y-4">
          {orders.map((order) => {
            const items = orderItems.filter((item) => item.order_id === order.id);
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <Card key={order.id} className="border-innout-red border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.person_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => handleDeleteOrder(order.id, order.person_name)}
                      disabled={currentGroup.is_finalized}
                      title={currentGroup.is_finalized ? 'Order is finalized' : 'Delete order'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No items yet</p>
                  ) : (
                    items.map((item) => (
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
                              disabled={currentGroup.is_finalized}
                              title={currentGroup.is_finalized ? 'Order is finalized' : 'Delete item'}
                            >
                              <Trash2 className="w-3 h-3" />
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
                    ))
                  )}
                  {order.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground italic">
                        Order notes: {order.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {orders.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No orders yet. Share the link to get started!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
