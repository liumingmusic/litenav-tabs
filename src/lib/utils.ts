import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensure random colors for links
export function getRandomColor() {
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399',
    '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa',
    '#c084fc', '#e879f9', '#f472b6', '#fb7185'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
