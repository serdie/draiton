
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getRoleBadgeClass = (role: 'free' | 'pro' | 'admin' | 'empresa') => {
  switch (role) {
    case 'admin': return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30';
    case 'empresa': return 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
    case 'pro': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
    case 'free': return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
    default: return 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
  }
}
