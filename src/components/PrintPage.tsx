import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { formatCustomizations } from '@/lib/utils';
import { Button } from './ui/button';
import { ArrowLeft, Printer, Moon, Sun } from 'lucide-react';

interface PrintPageProps {
  darkMode?: boolean;
  onDarkModeChange?: (dark: boolean) => void;
}

export function PrintPage({ darkMode = false, onDarkModeChange }: PrintPageProps) {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { session, currentGroup, orders, orderItems, setOrders, setOrderItems } = useStore();

  useEffect(() => {
    if (!session?.isOrganizer || session.groupId !== groupId) {
      navigate(`/group/${groupId}`);
      return;
    }

    loadData();
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

  const handlePrint = () => {
    window.print();
  };

  if (!session?.isOrganizer || !currentGroup) {
    return <div>Loading...</div>;
  }

  // Group items by category
  const itemsByCategory: Record<string, typeof orderItems> = {};
  orderItems.forEach((item) => {
    if (!itemsByCategory[item.menu_category]) {
      itemsByCategory[item.menu_category] = [];
    }
    itemsByCategory[item.menu_category].push(item);
  });

  const categories = Object.keys(itemsByCategory).sort();

  return (
    <>
      {/* Screen-only header */}
      <div className="print:hidden bg-innout-red dark:bg-red-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2 justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => navigate(`/group/${groupId}/review`)}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Print View</h1>
                <p className="text-sm opacity-90">{currentGroup.name}</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => onDarkModeChange?.(!darkMode)}
              className="text-xs h-8 w-8"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            className="text-xs"
          >
            <Printer className="w-4 h-4 mr-1" />
            Print
          </Button>
        </div>
      </div>

      {/* Print content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="print:text-black">
          {/* Print header */}
          <div className="mb-8 pb-4 border-b-2 border-black">
            <h1 className="text-3xl font-bold mb-2">{currentGroup.name}</h1>
            <p className="text-lg">Organized by: {currentGroup.organizer_name}</p>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
            <p className="text-lg font-semibold mt-2">
              Total: {orders.length} {orders.length === 1 ? 'person' : 'people'}, 
              {' '}{orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </p>
          </div>

          {/* Items grouped by category */}
          {categories.map((category) => {
            const items = itemsByCategory[category];
            const totalInCategory = items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div key={category} className="mb-8 break-inside-avoid">
                <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-400">
                  {category} ({totalInCategory})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const order = orders.find((o) => o.id === item.order_id);
                    return (
                      <div key={item.id} className="pl-4 break-inside-avoid">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-lg">
                            {item.quantity}x {item.menu_item_name}
                          </div>
                          <div className="text-gray-600 text-sm">
                            ({order?.person_name})
                          </div>
                        </div>
                        {item.customizations && (item.customizations as any[]).length > 0 && (
                          <div className="text-sm text-gray-700 ml-6">
                            {formatCustomizations(item.customizations as any)}
                          </div>
                        )}
                        {item.special_instructions && (
                          <div className="text-sm text-gray-700 ml-6 italic">
                            ⚠️ {item.special_instructions}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {orderItems.length === 0 && (
            <p className="text-center text-gray-500 text-lg py-8">
              No items ordered yet.
            </p>
          )}

          {/* Individual orders section */}
          <div className="mt-12 pt-8 border-t-2 border-black page-break-before">
            <h2 className="text-2xl font-bold mb-6">Orders by Person</h2>
            <div className="space-y-6">
              {orders.map((order) => {
                const items = orderItems.filter((item) => item.order_id === order.id);
                if (items.length === 0) return null;

                return (
                  <div key={order.id} className="break-inside-avoid">
                    <h3 className="text-xl font-bold mb-2 pb-1 border-b border-gray-300">
                      {order.person_name} ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
                    </h3>
                    <div className="space-y-2 pl-4">
                      {items.map((item) => (
                        <div key={item.id}>
                          <div className="font-medium">
                            {item.quantity}x {item.menu_item_name}
                          </div>
                          {item.customizations && (item.customizations as any[]).length > 0 && (
                            <div className="text-sm text-gray-700 ml-4">
                              {formatCustomizations(item.customizations as any)}
                            </div>
                          )}
                          {item.special_instructions && (
                            <div className="text-sm text-gray-700 ml-4 italic">
                              Note: {item.special_instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break-before {
            page-break-before: always;
          }
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
      `}</style>
    </>
  );
}
