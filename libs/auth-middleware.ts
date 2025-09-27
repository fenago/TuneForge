import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './next-auth';
import User, { UserRoles, UserRole } from '@/models/User';
import connectMongo from './mongo';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    image?: string;
  };
}

// Middleware to check if user is authenticated
export async function requireAuth(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database and get user details
    await connectMongo;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      image: user.image,
    };

    return null; // Continue to next middleware/handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Middleware to check if user has required role
export function requireRole(requiredRole: UserRole) {
  return async (request: AuthenticatedRequest) => {
    const authResult = await requireAuth(request);
    if (authResult) return authResult; // Return error if auth failed

    const user = request.user;
    if (!user) {
      return NextResponse.json(
        { error: 'User information not available' },
        { status: 500 }
      );
    }

    // Check role hierarchy
    const roleHierarchy: Record<UserRole, number> = {
      [UserRoles.FREE]: 0,
      [UserRoles.PAID]: 1,
      [UserRoles.MAX]: 2,
      [UserRoles.ADMIN]: 3,
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: requiredRole,
          current: user.role 
        },
        { status: 403 }
      );
    }

    return null; // Continue to handler
  };
}

// Specific role checkers
export const requireAdmin = requireRole(UserRoles.ADMIN);
export const requirePaid = requireRole(UserRoles.PAID);
export const requireMax = requireRole(UserRoles.MAX);

// Helper function to get current user from session
export async function getCurrentUser(request?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    await connectMongo;
    const user = await User.findOne({ email: session.user.email });
    
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Helper function to check if user can access dashboard
export function canAccessDashboard(userRole: UserRole, dashboardType: string): boolean {
  const accessMap: Record<string, UserRole[]> = {
    'free': [UserRoles.FREE, UserRoles.PAID, UserRoles.MAX, UserRoles.ADMIN],
    'pro': [UserRoles.PAID, UserRoles.MAX, UserRoles.ADMIN],
    'max': [UserRoles.MAX, UserRoles.ADMIN],
    'admin': [UserRoles.ADMIN],
  };

  return accessMap[dashboardType]?.includes(userRole) || false;
}

// Helper function to get user's dashboard URL
export function getUserDashboardUrl(userRole: UserRole): string {
  switch (userRole) {
    case UserRoles.ADMIN:
      return '/dashboard/admin';
    case UserRoles.MAX:
      return '/dashboard/max';
    case UserRoles.PAID:
      return '/dashboard/pro';
    case UserRoles.FREE:
    default:
      return '/dashboard';
  }
}

// Helper function to check song creation limits
export async function checkSongCreationLimit(userId: string): Promise<{
  canCreate: boolean;
  remaining: number | 'unlimited';
  message?: string;
}> {
  try {
    await connectMongo;
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        canCreate: false,
        remaining: 0,
        message: 'User not found'
      };
    }

    const canCreate = user.canCreateSongs();
    const remaining = user.getRemainingLimit();

    let message = '';
    if (!canCreate) {
      if (user.role === UserRoles.FREE) {
        message = 'You have used your free song. Upgrade to create more!';
      } else if (user.role === UserRoles.PAID) {
        message = 'No credits remaining. Purchase more credits to continue.';
      }
    }

    return {
      canCreate,
      remaining,
      message
    };
  } catch (error) {
    console.error('Check song creation limit error:', error);
    return {
      canCreate: false,
      remaining: 0,
      message: 'Error checking limits'
    };
  }
}
