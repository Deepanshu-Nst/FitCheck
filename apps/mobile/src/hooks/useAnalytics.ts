import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Dummy analytics hook for Milestone 5.
 * In a real app, this would integrate with Mixpanel, PostHog, or Firebase Analytics.
 */
export const analyticsService = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    if (__DEV__) {
      console.log(`[Analytics] ${eventName}`, properties || {});
    }
    // TODO: Send to real analytics provider
  },
  identifyUser: (userId: string, traits?: Record<string, any>) => {
    if (__DEV__) {
      console.log(`[Analytics] Identify: ${userId}`, traits || {});
    }
  },
  reset: () => {
    if (__DEV__) {
      console.log(`[Analytics] Reset Session`);
    }
  },
};

export function useAnalytics() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      analyticsService.identifyUser(user.id, {
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      analyticsService.reset();
    }
  }, [user]);

  return analyticsService;
}
