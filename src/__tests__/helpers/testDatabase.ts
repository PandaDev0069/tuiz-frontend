// src/__tests__/helpers/testDatabase.ts
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Test user data
export const testUsers = {
  existing: {
    email: 'test.user@example.com',
    password: 'testPassword123',
    username: 'testuser',
    displayName: 'Test User',
  },
  new: {
    email: 'new.user@example.com',
    password: 'newPassword123',
    username: 'newuser',
    displayName: 'New Test User',
  },
} as const;

/**
 * Clean up test users from the database
 * Call this in test cleanup to ensure clean state
 */
export async function cleanupTestUsers() {
  try {
    // First try to find users by email to get their UUIDs
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.warn('Failed to list users for cleanup:', listError);
      return;
    }

    // Find test users by email and delete by UUID
    const testEmails: string[] = [testUsers.existing.email, testUsers.new.email];
    const usersToDelete = users.users.filter(
      (user: User) => user.email && testEmails.includes(user.email),
    );

    for (const user of usersToDelete) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.warn(`Failed to delete user ${user.email}:`, deleteError);
      }
    }

    // Also clean up profiles table as backup
    await supabase.from('profiles').delete().in('email', testEmails);
  } catch (error) {
    console.warn('Test cleanup failed:', error);
  }
}

/**
 * Create a test user in the database for testing login functionality
 */
export async function createTestUser(userData = testUsers.existing) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          display_name: userData.displayName,
        },
      },
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Sign out any current user
 */
export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Failed to sign out:', error);
  }
}

/**
 * Wait for authentication state to settle
 */
export function waitForAuthState(timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      clearTimeout(timer);
      subscription.unsubscribe();
      resolve();
    });
  });
}
