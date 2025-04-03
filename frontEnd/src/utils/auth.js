/**
 * Auth utility functions for working with Clerk authentication
 */

import { useAuth as useClerkAuth } from "@clerk/clerk-react";

/**
 * Re-export useAuth from Clerk for consistency
 */
export const useAuth = useClerkAuth;

/**
 * Helper function to get the current auth instance
 * Useful in non-component contexts
 */
export const auth = {
  /**
   * Get the current auth token for API requests
   */
  getToken: () => {
    // This is a placeholder - in components, use useAuth().getToken() directly
    return null;
  }
}; 