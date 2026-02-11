import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { generateShareUrl, copyToClipboard } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';
import { MenuItemCard } from './MenuItemCard';
import { OrderSummary } from './OrderSummary';
import { categories, getMenuItemsByCategory, getSecretMenuItems } from '@/lib/menu';
import { Share2, Eye, Printer, QrCode, Moon, Sun } from 'lucide-react';
import type { Order, OrderItem } from '@/lib/types';

interface OrderPageProps {
  darkMode?: boolean;
  onDarkModeChange?: (dark: boolean) => void;
}

export function OrderPage({ darkMode = false, onDarkModeChange }: OrderPageProps) {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const {
    session,
    currentGroup,
    setCurrentGroup,
    orders,
    setOrders,
    orderItems,
    setOrderItems,
  } = useStore();

  const [activeCategory, setActiveCategory] = useState('Burgers');
  const [showSecretMenu, setShowSecretMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session || session.groupId !== groupId) {
      navigate(`/join/${groupId}`);
      return;
    }

    const initData = async () => {
      setIsLoading(true);
      await loadGroupData();
      setIsLoading(false);
    };

    initData();
    subscribeToRealtime();
  }, [groupId, session]);

  // Check if group is expired
  const isExpired = () => {
    if (!currentGroup) return false;
    const now = new Date();
    const expiresAt = new Date(currentGroup.expires_at);
    return now > expiresAt;
  };

  // Quick combo definitions
  const quickCombos = [
    {
      id: 'double-double-combo',
      name: 'Double-Double Combo',
      items: [
        { menuItemId: 'double-double', quantity: 1 },
        { menuItemId: 'fries', quantity: 1 },
        { menuItemId: 'fountain-drink', quantity: 1 },
      ],
    },
    {
      id: 'cheeseburger-combo',
      name: 'Cheeseburger Combo',
      items: [
        { menuItemId: 'cheeseburger', quantity: 1 },
        { menuItemId: 'fries', quantity: 1 },
        { menuItemId: 'fountain-drink', quantity: 1 },
      ],
    },
    {
      id: 'animal-style-combo',
      name: 'Animal Style Combo',
      items: [
        { menuItemId: 'animal-style', quantity: 1 },
        { menuItemId: 'animal-fries', quantity: 1 },
        { menuItemId: 'shake', quantity: 1 },
      ],
    },
  ];

  const handleAddQuickCombo = async (combo: typeof quickCombos[0]) => {
    if (!session?.orderId && !session?.isOrganizer) return;

    try {
      // If organizer and no order, create one first
      let orderId = session.orderId;
      
      if (session.isOrganizer && !orderId) {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            group_id: session.groupId,
            person_name: session.personName,
            person_token: session.personToken,
          })
          .select()
          .single();

        if (orderError) throw orderError;
        orderId = orderData.id;
        
        // Update session with order ID
        useStore.getState().setSession({
          ...session,
          orderId: orderData.id,
        });
      }

      // Add all items from the combo
      for (const item of combo.items) {
        const menuItem = getMenuItemsByCategory('Burgers').concat(
          getMenuItemsByCategory('Fries'),
          getMenuItemsByCategory('Drinks'),
          getMenuItemsByCategory('Shakes'),
          getSecretMenuItems()
        ).find(m => m.id === item.menuItemId);

        if (!menuItem) continue;

        // Build customizations with defaults
        const customizationsArray = menuItem.customizationOptions.map((opt) => ({
          type: opt.type,
          value: String(opt.default || (opt.options?.[0] || '')),
          label: opt.label,
        }));

        const { error } = await supabase.from('order_items').insert({
          order_id: orderId!,
          menu_item_id: menuItem.id,
          menu_item_name: menuItem.name,
          menu_category: menuItem.category,
          quantity: item.quantity,
          customizations: customizationsArray,
          special_instructions: null,
        });

        if (error) throw error;
      }

      // Show success feedback
      toast.success(`Added ${combo.name}!`);
    } catch (err) {
      console.error('Error adding combo:', err);
      toast.error('Failed to add combo. Please try again.');
    }
  };

  const loadGroupData = async () => {
    if (!groupId) return;

    try {
      // Load group
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupData) {
        setCurrentGroup(groupData);
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('group_id', groupId);

      if (ordersData) {
        setOrders(ordersData);
      }

      // Load order items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', ordersData?.map(o => o.id) || []);

      if (itemsData) {
        setOrderItems(itemsData);
      }
    } catch (err) {
      console.error('Error loading group data:', err);
    }
  };

  const subscribeToRealtime = () => {
    if (!groupId) return;

    // Subscribe to orders
    const ordersChannel = supabase
      .channel(`orders-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders([...orders, payload.new as Order]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(orders.map(o => o.id === payload.new.id ? payload.new as Order : o));
          } else if (payload.eventType === 'DELETE') {
            setOrders(orders.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to order items - only for orders in this group
    const itemsChannel = supabase
      .channel(`order-items-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Check if this item belongs to an order in this group
            const orderIds = orders.map(o => o.id);
            if (orderIds.includes(payload.new.order_id)) {
              setOrderItems([...orderItems, payload.new as OrderItem]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrderItems(orderItems.map(i => i.id === payload.new.id ? payload.new as OrderItem : i));
          } else if (payload.eventType === 'DELETE') {
            setOrderItems(orderItems.filter(i => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
      itemsChannel.unsubscribe();
    };
  };

  const handleShareLink = async () => {
    const url = generateShareUrl(groupId!);
    await copyToClipboard(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!session || !currentGroup) {
    return <div>Loading...</div>;
  }

  const menuItemsToShow = showSecretMenu
    ? getSecretMenuItems()
    : getMenuItemsByCategory(activeCategory);

  // Count items in current user's order
  const currentOrder = orders.find(
    (o) => o.person_token === session.personToken && o.group_id === session.groupId
  );
  const myItemCount = currentOrder
    ? orderItems
        .filter((item) => item.order_id === currentOrder.id)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const shareUrl = generateShareUrl(groupId!);

  return (
    <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white dark:from-slate-950 dark:to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-innout-red dark:bg-red-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h1 className="text-2xl font-bold">{currentGroup.name}</h1>
              <p className="text-sm opacity-90">Organized by {currentGroup.organizer_name}</p>
            </div>
            <div className="flex gap-2 items-start">
              {/* Order Count Badge */}
              {myItemCount > 0 && (
                <div className="bg-innout-red dark:bg-red-700 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm">
                  {myItemCount}
                </div>
              )}
              <Button
                size="icon"
                variant="secondary"
                onClick={() => onDarkModeChange?.(!darkMode)}
                className="text-xs"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShareLink}
              className="text-xs"
            >
              <Share2 className="w-4 h-4 mr-1" />
              {copiedLink ? 'Link Copied!' : 'Share Link'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowQRModal(true)}
              className="text-xs"
            >
              <QrCode className="w-4 h-4 mr-1" />
              QR Code
            </Button>
            {session.isOrganizer && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/group/${groupId}/review`)}
                  className="text-xs"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Review Orders
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/group/${groupId}/print`)}
                  className="text-xs"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print View
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent onClose={() => setShowQRModal(false)}>
          <DialogHeader>
            <DialogTitle>Share Order Group</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg border-2 border-innout-yellow">
              <QRCodeSVG
                value={shareUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to join the order group
            </p>
            <Button
              onClick={handleShareLink}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto p-4">
        {/* Expiration Banner */}
        {isExpired() && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 font-semibold">This order has expired</p>
            <p className="text-sm text-red-600 mt-1">
              This order expired and is no longer accepting new items.{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-red-700 hover:text-red-900"
                onClick={() => navigate('/')}
              >
                Create a new order
              </Button>
            </p>
          </div>
        )}

        {/* Finalized Banner */}
        {currentGroup.is_finalized && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-700 font-semibold">Order Finalized</p>
            <p className="text-sm text-yellow-600 mt-1">
              This order is locked. You cannot add or modify items.
            </p>
          </div>
        )}

        {/* Quick Combos Section */}
        {!isExpired() && !currentGroup.is_finalized && (
          <Card className="mb-6 bg-innout-cream border-innout-red border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-innout-red">⚡ Quick Combos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {quickCombos.map((combo) => (
                  <Button
                    key={combo.id}
                    onClick={() => handleAddQuickCombo(combo)}
                    variant="outline"
                    className="border-innout-red border-2 text-innout-red hover:bg-innout-red hover:text-white"
                  >
                    {combo.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Navigation */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category && !showSecretMenu ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveCategory(category);
                setShowSecretMenu(false);
              }}
            >
              {category}
            </Button>
          ))}
          <Button
            variant={showSecretMenu ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSecretMenu(!showSecretMenu)}
            className="whitespace-nowrap"
          >
            🤫 Secret Menu
          </Button>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </>
          ) : (
            menuItemsToShow.map((item) => (
              <MenuItemCard 
                key={item.id} 
                item={item}
                isFinalized={currentGroup.is_finalized || false}
              />
            ))
          )}
        </div>

        {/* Order Summary */}
        <OrderSummary isFinalized={currentGroup.is_finalized || false} />
      </div>
    </div>
  );
}
