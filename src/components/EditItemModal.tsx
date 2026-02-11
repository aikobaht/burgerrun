import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { OrderItem, MenuItem, Customization } from '@/lib/types';

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OrderItem;
  menuItem: MenuItem;
  onSave: () => void;
}

export function EditItemModal({
  open,
  onOpenChange,
  item,
  menuItem,
  onSave,
}: EditItemModalProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [customizations, setCustomizations] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    item.customizations?.forEach((c) => {
      defaults[c.type] = String(c.value);
    });
    return defaults;
  });
  const [specialInstructions, setSpecialInstructions] = useState(
    item.special_instructions || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(item.quantity);
      const defaults: Record<string, string> = {};
      item.customizations?.forEach((c) => {
        defaults[c.type] = String(c.value);
      });
      setCustomizations(defaults);
      setSpecialInstructions(item.special_instructions || '');
    }
  }, [open, item]);

  const handleCustomizationChange = (type: string, value: string) => {
    setCustomizations((prev) => ({ ...prev, [type]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const customizationsArray: Customization[] = Object.entries(customizations).map(
        ([type, value]) => {
          const option = menuItem.customizationOptions.find((opt) => opt.type === type);
          return {
            type,
            value,
            label: option?.label || type,
          };
        }
      );

      const { error } = await supabase
        .from('order_items')
        .update({
          quantity,
          customizations: customizationsArray,
          special_instructions: specialInstructions || null,
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item updated!');
      onOpenChange(false);
      onSave();
    } catch (err) {
      console.error('Error updating item:', err);
      toast.error('Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Edit {menuItem.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          {/* Customizations */}
          {menuItem.customizationOptions.map((option) => (
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

          {/* Quantity */}
          <div className="space-y-1">
            <Label className="text-xs">Quantity</Label>
            <div className="flex items-center gap-2 border rounded-md w-fit">
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
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
