import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function Home() {
  // Middleware handles the logged-in check and redirect to /dashboard
  // This page just acts as a fallback or entry point
  redirect('/auth/login');
}
