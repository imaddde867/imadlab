import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMonth = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
