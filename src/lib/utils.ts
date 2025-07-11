import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getRoleBadgeClass = (role: 'free' | 'pro' | 'admin') => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 border-red-200';
    case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'free': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
