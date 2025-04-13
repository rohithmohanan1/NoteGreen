import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  
  // Check if date is today
  if (d.toDateString() === now.toDateString()) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Check if date is yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Return formatted date for older dates
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getTextPreview(content: string, maxLength: number = 100): string {
  // Strip HTML tags
  const textContent = content.replace(/<[^>]+>/g, ' ');
  
  // Trim whitespace and limit length
  return textContent.trim().substring(0, maxLength) + 
    (textContent.length > maxLength ? '...' : '');
}
