import { useState, useEffect } from 'react';
import { useMobileAuth } from '../../hooks/useMobileAuth';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sanitizeInput, validateEmail, validatePhoneNumber } from '../../utils/security';

export default function ProfileSetupModal() {
  const { identity, phoneNumber } = useMobileAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-populate phone field with authenticated mobile number
  useEffect(() => {
    if (phoneNumber && !phone) {
      setPhone(phoneNumber);
    }
  }, [phoneNumber, phone]);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedEmail = sanitizeInput(email.trim());
    const sanitizedPhone = sanitizeInput(phone.trim());

    if (!sanitizedName || !sanitizedEmail || !sanitizedPhone) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email
    if (!validateEmail(sanitizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone
    if (!validatePhoneNumber(sanitizedPhone)) {
      toast.error('Please enter a valid Indian mobile number');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to OLS!</DialogTitle>
          <DialogDescription>
            Please complete your profile to start buying and selling.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Creating Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
