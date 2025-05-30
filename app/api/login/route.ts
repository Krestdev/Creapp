// app/api/login/route.ts
import { User, UserTest } from '@/types/types';
import { NextResponse } from 'next/server';

// Mock user database
const mockUsers: UserTest[] = [
  {
    id: '1',
    email: 'hansadiogo@gmail.com',
    password: 'password123', // In real app, store hashed passwords only
    name: 'Test User',
    role: 'user',
  },
  {
    id: '2',
    email: 'admin@betcreaconsult.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create a safe user object without password
    const userWithoutPassword :User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // In a real app, you would:
    // 1. Generate a JWT token or session
    // 2. Set secure HTTP-only cookies
    // 3. Implement proper password hashing

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: 'simulated-jwt-token', // Replace with real token in production
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}