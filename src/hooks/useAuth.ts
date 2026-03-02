import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { LoginInput, RegisterInput } from '@/lib/validations/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

// Fetch user
async function fetchUser(): Promise<User> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  const data = await res.json();
  return data.user;
}

// Login
async function login(credentials: LoginInput): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await res.json();
  return data.user;
}

// Register
async function register(credentials: RegisterInput): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await res.json();
  return data.user;
}

// Logout
async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

// Hook для отримання поточного користувача
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 хвилин
  });
}

// Hook для логіну
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      router.push('/dashboard');
      router.refresh();
    },
  });
}

// Hook для реєстрації
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      router.push('/dashboard');
      router.refresh();
    },
  });
}

// Hook для виходу
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      router.push('/auth/login');
      router.refresh();
    },
  });
}
