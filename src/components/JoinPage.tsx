import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { Group } from '@/lib/types';

export function JoinPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { setSession, setCurrentGroup, session } = useStore();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) {
      setError('Invalid group link');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Group not found or expired');
        setLoading(false);
        return;
      }

      setGroup(data);
      
      // Check if user already has a session for this group
      if (session?.groupId === groupId) {
        navigate(`/group/${groupId}`);
      }
    } catch (err) {
      console.error('Error loading group:', err);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!personName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!group) return;

    setJoining(true);

    try {
      const personToken = crypto.randomUUID();
      
      // Create an order for this person
      const { data, error } = await supabase
        .from('orders')
        .insert({
          group_id: groupId!,
          person_name: personName,
          person_token: personToken,
        })
        .select()
        .single();

      if (error) throw error;

      // Set session
      setSession({
        groupId: group.id,
        orderId: data.id,
        personName: personName,
        personToken: data.person_token,
        isOrganizer: false,
      });

      setCurrentGroup(group);

      // Show success toast
      toast.success(`Welcome ${personName}! Ready to order?`);

      // Navigate to order page
      navigate(`/group/${group.id}`);
    } catch (err) {
      console.error('Error joining group:', err);
      const errorMsg = 'Failed to join group. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-innout-red border-2">
          <CardContent className="p-6 text-center">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-innout-red border-2">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-innout-red border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-innout-red mb-2">
            🍔 Join Order
          </CardTitle>
          <CardDescription className="text-lg">
            {group?.name}
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            Organized by {group?.organizer_name}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personName">Your Name</Label>
              <Input
                id="personName"
                placeholder="Your name"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                disabled={joining}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={joining}
            >
              {joining ? 'Joining...' : 'Join & Start Ordering'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
