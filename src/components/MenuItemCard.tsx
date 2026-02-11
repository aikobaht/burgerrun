import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import type { MenuItem, Customization } from '@/lib/types';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { session, orders } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    item.customizationOptions.forEach((opt) => {
      if (opt.default !== undefined) {
        defaults[opt.type] = String(opt.default);
      } else if (opt.options && opt.options.length > 0) {
        defaults[opt.type] = opt.options[0];
      }
    });
    return defaults;
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [adding, setAdding] = useState(false);

  const handleCustomizationChange = (type: string, value: string) => {
    setCustomizations((prev) => ({ ...prev, [type]: value }));
  };

  const handleAddToOrder = async () => {
    if (!session?.orderId && !session?.isOrganizer) return;

    setAdding(true);

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

      // Convert customizations to array format
      const customizationsArray: Customization[] = Object.entries(customizations).map(
        ([type, value]) => {
          const option = item.customizationOptions.find((opt) => opt.type === type);
          return {
            type,
            value,
            label: option?.label || type,
          };
        }
      );

      // Add item to order
      const { error } = await supabase.from('order_items').insert({
        order_id: orderId!,
        menu_item_id: item.id,
        menu_item_name: item.name,
        menu_category: item.category,
        quantity,
        customizations: customizationsArray,
        special_instructions: specialInstructions || null,
      });

      if (error) throw error;

      // Reset form
      setQuantity(1);
      setSpecialInstructions('');
      
      // Show success feedback
      alert('Added to order!');
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="border-innout-yellow border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-start justify-between">
          <span>
            {item.name}
            {item.isSecretMenu && <span className="text-xs ml-2">🤫</span>}
          </span>
        </CardTitle>
        {item.description && (
          <CardDescription className="text-xs">{item.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Customizations */}
        {item.customizationOptions.map((option) => (
          <div key={option.type} className="space-y-1">
            <Label className="text-xs">{option.label}</Label>
            <Select
              value={customizations[option.type] || ''}
              onChange={(e) => handleCustomizationChange(option.type, e.target.value)}
              className="text-sm h-9"
            >
              {option.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        ))}

        {/* Special Instructions */}
        <div className="space-y-1">
          <Label className="text-xs">Special Instructions</Label>
          <Textarea
            placeholder="Any special requests..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="text-sm min-h-[60px]"
          />
        </div>

        {/* Quantity and Add Button */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex items-center gap-2 border rounded-md">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="flex-1"
            onClick={handleAddToOrder}
            disabled={adding}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {adding ? 'Adding...' : 'Add to Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
