import { useState, useEffect } from 'react';
import { useMobileAuth } from '../../hooks/useMobileAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Shield, Clock, AlertTriangle } from 'lucide-react';
import { APP_CONFIG } from '../../utils/config';

interface MobileAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileAuthModal({ open, onOpenChange }: MobileAuthModalProps) {
  const { authStatus, error, phoneNumber, otpExpiresAt, sendOTP, verifyOTP, resendOTP, canResendOTP, isLoading } = useMobileAuth();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!otpExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt.getTime() - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOTP(phone);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOTP(otp);
  };

  const handleResendOTP = async () => {
    setOtp('');
    await resendOTP();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPhoneStep = authStatus === 'idle' || authStatus === 'error';
  const isOTPStep = authStatus === 'otp-sent' || authStatus === 'verifying';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            {isPhoneStep ? 'Login to OLS' : 'Verify OTP'}
          </DialogTitle>
          <DialogDescription>
            {isPhoneStep
              ? 'Enter your mobile number to receive a one-time password'
              : `We've sent a 6-digit OTP to ${phoneNumber}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPhoneStep && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 border border-input rounded-md bg-muted text-sm font-medium">
                  {APP_CONFIG.defaultCountryCode}
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                  required
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your 10-digit Indian mobile number
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              Send OTP
            </Button>
          </form>
        )}

        {isOTPStep && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            {/* Security Warning */}
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Security Alert:</strong> Never share your OTP with anyone. OLS will never ask for your OTP.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {timeRemaining > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>OTP expires in {formatTime(timeRemaining)}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={!canResendOTP || timeRemaining === 0}
                className="text-sm"
              >
                {canResendOTP ? 'Resend OTP' : 'Wait to resend...'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
