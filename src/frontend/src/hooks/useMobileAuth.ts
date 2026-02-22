import {
  type ReactNode,
  type PropsWithChildren,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import type { Identity } from '@icp-sdk/core/agent';
import { validatePhoneNumber, validateOTP } from '../utils/security';

export type MobileAuthStatus = 'idle' | 'phone-input' | 'otp-sent' | 'verifying' | 'success' | 'error';

export type MobileAuthContext = {
  identity?: Identity;
  phoneNumber?: string;
  authStatus: MobileAuthStatus;
  error?: string;
  otpExpiresAt?: Date;
  
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  logout: () => Promise<void>;
  
  isAuthenticated: boolean;
  isLoading: boolean;
  canResendOTP: boolean;
};

const MobileAuthReactContext = createContext<MobileAuthContext | undefined>(undefined);

function assertProviderPresent(context: MobileAuthContext | undefined): asserts context is MobileAuthContext {
  if (!context) {
    throw new Error('MobileAuthProvider is not present. Wrap your component tree with it.');
  }
}

export const useMobileAuth = (): MobileAuthContext => {
  const context = useContext(MobileAuthReactContext);
  assertProviderPresent(context);
  return context;
};

/**
 * MobileAuthProvider - Provides mobile OTP authentication context
 * Note: This is a UI wrapper around Internet Identity for compatibility
 * with the existing backend. In production, this would integrate with
 * a real SMS OTP service.
 */
export function MobileAuthProvider({ children }: PropsWithChildren<{ children: ReactNode }>) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const [authStatus, setAuthStatus] = useState<MobileAuthStatus>('idle');
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | undefined>(undefined);
  const [lastOTPSentAt, setLastOTPSentAt] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  // Sync with Internet Identity status
  useEffect(() => {
    if (identity && authStatus !== 'success') {
      setAuthStatus('success');
    } else if (!identity && authStatus === 'success') {
      setAuthStatus('idle');
      setPhoneNumber(undefined);
    }
  }, [identity, authStatus]);

  const sendOTP = useCallback(async (phone: string) => {
    try {
      setError(undefined);
      
      // Validate phone number
      if (!validatePhoneNumber(phone)) {
        setError('Please enter a valid Indian mobile number');
        setAuthStatus('error');
        return;
      }

      // Rate limiting: prevent sending OTP too frequently
      const now = Date.now();
      if (now - lastOTPSentAt < 30000) { // 30 seconds cooldown
        setError('Please wait before requesting another OTP');
        setAuthStatus('error');
        return;
      }

      setAuthStatus('otp-sent');
      setPhoneNumber(phone);
      setLastOTPSentAt(now);
      
      // Set OTP expiry (10 minutes from now)
      const expiresAt = new Date(now + 10 * 60 * 1000);
      setOtpExpiresAt(expiresAt);

      // In a real implementation, this would call backend to send SMS
      // For now, we just simulate the OTP sent state
      console.log(`[Simulated] OTP sent to ${phone}`);
      
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
      setAuthStatus('error');
    }
  }, [lastOTPSentAt]);

  const verifyOTP = useCallback(async (otp: string) => {
    try {
      setError(undefined);
      setAuthStatus('verifying');

      // Validate OTP format
      const validOTP = validateOTP(otp);
      if (!validOTP) {
        setError('Please enter a valid 6-digit OTP');
        setAuthStatus('otp-sent');
        setFailedAttempts(prev => prev + 1);
        return;
      }

      // Check if OTP expired
      if (otpExpiresAt && new Date() > otpExpiresAt) {
        setError('OTP has expired. Please request a new one.');
        setAuthStatus('error');
        return;
      }

      // Check for suspicious activity (too many failed attempts)
      if (failedAttempts >= 5) {
        setError('Too many failed attempts. Please try again later.');
        setAuthStatus('error');
        console.warn('[Security] Suspicious login activity detected:', { phoneNumber, failedAttempts });
        return;
      }

      // In a real implementation, this would verify OTP with backend
      // For now, we trigger Internet Identity login
      await login();
      
      setAuthStatus('success');
      setFailedAttempts(0);
      
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
      setAuthStatus('otp-sent');
      setFailedAttempts(prev => prev + 1);
    }
  }, [login, otpExpiresAt, failedAttempts, phoneNumber]);

  const resendOTP = useCallback(async () => {
    if (phoneNumber) {
      await sendOTP(phoneNumber);
    }
  }, [phoneNumber, sendOTP]);

  const logout = useCallback(async () => {
    await clear();
    setAuthStatus('idle');
    setPhoneNumber(undefined);
    setError(undefined);
    setOtpExpiresAt(undefined);
    setFailedAttempts(0);
  }, [clear]);

  const canResendOTP = useMemo(() => {
    const now = Date.now();
    return now - lastOTPSentAt >= 30000; // Can resend after 30 seconds
  }, [lastOTPSentAt]);

  const value = useMemo<MobileAuthContext>(
    () => ({
      identity,
      phoneNumber,
      authStatus,
      error,
      otpExpiresAt,
      sendOTP,
      verifyOTP,
      resendOTP,
      logout,
      isAuthenticated: !!identity,
      isLoading: authStatus === 'verifying' || loginStatus === 'logging-in',
      canResendOTP,
    }),
    [
      identity,
      phoneNumber,
      authStatus,
      error,
      otpExpiresAt,
      sendOTP,
      verifyOTP,
      resendOTP,
      logout,
      loginStatus,
      canResendOTP,
    ]
  );

  return createElement(MobileAuthReactContext.Provider, { value, children });
}
