import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function HomePage() {
  const navigate = useNavigate();
  const setSession = useStore((state) => state.setSession);
  const setCurrentGroup = useStore((state) => state.setCurrentGroup);
  
  const [groupName, setGroupName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!groupName.trim() || !organizerName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const organizerToken = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          organizer_name: organizerName,
          organizer_token: organizerToken,
        })
        .select()
        .single();

      if (error) throw error;

      // Set session
      setSession({
        groupId: data.id,
        personName: organizerName,
        personToken: data.organizer_token,
        isOrganizer: true,
        organizerToken: data.organizer_token,
      });

      setCurrentGroup(data);

      // Show success toast
      toast.success('Group created! Waiting for others to join...');

      // Navigate to order page
      navigate(`/group/${data.id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      const errorMsg = 'Failed to create group. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-innout-red border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-innout-red mb-2">
            🍔 BurgerRun
          </CardTitle>
          <CardDescription className="text-lg">
            Organize your In-N-Out group order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Order Name</Label>
              <Input
                id="groupName"
                placeholder="Friday Lunch"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizerName">Your Name</Label>
              <Input
                id="organizerName"
                placeholder="Alex"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Group Order'}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              Have a link? Just visit it to join an existing order!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
