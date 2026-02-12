import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Clipboard, Share2, Check } from 'lucide-react';

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
      
      // Calculate expires_at as 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          organizer_name: organizerName,
          organizer_token: organizerToken,
          expires_at: expiresAt.toISOString(),
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
    <div className="min-h-screen bg-gradient-to-b from-innout-cream to-white">
      {/* Hero Section */}
      <div className="pt-12 pb-8 px-4 text-center">
        <div className="text-6xl mb-4">🍔</div>
        <h1 className="text-5xl md:text-6xl font-bold text-innout-red mb-4">
          BurgerRun
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-2">
          Organize group orders from In-N-Out
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everyone picks what they want, you collect the money
        </p>
      </div>

      {/* How it Works Section */}
      <div className="px-4 pb-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-innout-red rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create Order</h3>
            <p className="text-sm text-gray-600">
              Set up a group order with a name
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-innout-red rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Share Link</h3>
            <p className="text-sm text-gray-600">
              Send your friends the group link
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-innout-red rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Everyone Orders</h3>
            <p className="text-sm text-gray-600">
              Each person picks their items
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-innout-red rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg">
              4
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Finalize</h3>
            <p className="text-sm text-gray-600">
              View the full order & total cost
            </p>
          </div>
        </div>
      </div>

      {/* Main CTA Section */}
      <div className="px-4 pb-12">
        <Card className="w-full max-w-2xl mx-auto border-innout-red border-2 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-innout-red mb-2">
              Ready to get started?
            </CardTitle>
            <CardDescription className="text-base">
              Create a new group order below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groupName" className="text-base font-semibold">
                  Order Name
                </Label>
                <Input
                  id="groupName"
                  placeholder="e.g., Friday Lunch, Team Dinner"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={loading}
                  className="text-base p-3 h-auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerName" className="text-base font-semibold">
                  Your Name
                </Label>
                <Input
                  id="organizerName"
                  placeholder="e.g., Alex"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  disabled={loading}
                  className="text-base p-3 h-auto"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-innout-red hover:bg-red-700 text-white font-bold text-lg py-6 h-auto"
                disabled={loading}
              >
                {loading ? 'Creating Order...' : 'Create Group Order'}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-600 mb-2">
                Joining an existing order?
              </p>
              <p className="text-sm font-medium text-innout-red">
                Just visit the link someone sent you!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
