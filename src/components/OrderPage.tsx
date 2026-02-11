import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { generateShareUrl, copyToClipboard } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MenuItemCard } from './MenuItemCard';
import { OrderSummary } from './OrderSummary';
import { categories, getMenuItemsByCategory, getSecretMenuItems } from '@/lib/menu';
import { Share2, Eye, Printer } from 'lucide-react';
import type { Order, OrderItem } from '@/lib/types';

export function OrderPage() {
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

  useEffect(() => {
    if (!session || session.groupId !== groupId) {
      navigate(`/join/${groupId}`);
      return;
    }

    loadGroupData();
    subscribeToRealtime();
  }, [groupId, session]);

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

    // Subscribe to order items
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
            setOrderItems([...orderItems, payload.new as OrderItem]);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white pb-20">
      {/* Header */}
      <div className="bg-innout-red text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">{currentGroup.name}</h1>
          <p className="text-sm opacity-90">Organized by {currentGroup.organizer_name}</p>
          
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

      <div className="max-w-4xl mx-auto p-4">
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
          {menuItemsToShow.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <OrderSummary />
      </div>
    </div>
  );
}
