/**
 * Utility function to determine if a user can edit a specific tribute.
 *
 * Permission rules:
 * - Users can edit their own tributes (where user.id matches tribute.owner.id)
 * - Users with admin role (role.type === 'admin') can edit any tribute
 * - All other users cannot edit tributes they don't own
 *
 * @param user - The authenticated user (null if not authenticated)
 * @param tribute - The tribute to check for edit permissions
 * @returns boolean indicating if the user can edit the tribute
 */
// Define the User interface to avoid App.Locals reference issues
interface User {
  id: string;
  name?: string;
  email: string;
  role?: {
    id: string;
    name: string;
    type: string;
  };
}

// Define a Tribute interface that matches the expected structure
interface TributeData {
  id: number;
  attributes: {
    owner?: {
      data?: {
        id: number;
        attributes?: Record<string, any>;
      } | null;
    } | null;
  };
}

export function canEditTribute(
  user: User | null,
  tribute: TributeData | null | undefined
): boolean {
  // Handle edge cases
  if (!user) {
    // Not authenticated
    console.log('🚫 Permission denied: No user authenticated');
    return false;
  }

  if (!tribute) {
    // No tribute provided
    console.log('🚫 Permission denied: No tribute provided');
    return false;
  }

  // Check if user has admin role
  if (user.role?.type === 'admin') {
    console.log('✅ Permission granted: User is admin');
    return true;
  }

  // Check if tribute has an owner
  if (!tribute.attributes.owner?.data) {
    console.log('🚫 Permission denied: Tribute has no owner (orphaned)');
    return false;
  }

  // Check if user is the owner of the tribute
  // Convert the numeric tribute owner ID to string for proper comparison with user.id
  const isOwner = user.id === String(tribute.attributes.owner.data.id);
  
  if (isOwner) {
    console.log(`✅ Permission granted: User ${user.id} is the owner of tribute ${tribute.id}`);
    return true;
  }

  console.log(`🚫 Permission denied: User ${user.id} does not own tribute ${tribute.id}`);
  return false;
}