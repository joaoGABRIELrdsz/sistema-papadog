import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LEVELS = {
  Bronze: { min: 0, max: 500, color: '#8B4513', bg: 'bg-orange-900/10', text: 'text-orange-700', border: 'border-orange-200' },
  Prata: { min: 500, max: 1000, color: '#C0C0C0', bg: 'bg-slate-400/10', text: 'text-slate-500', border: 'border-slate-200' },
  Ouro: { min: 1000, max: 2500, color: '#FFD700', bg: 'bg-yellow-400/10', text: 'text-yellow-600', border: 'border-yellow-200' },
  Platina: { min: 2500, max: 5000, color: '#E5E4E2', bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  Diamante: { min: 5000, max: 10000, color: '#B9F2FF', bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200', glow: 'shadow-[0_0_15px_rgba(185,242,255,0.5)]' }
};

export const PRIORITY_COLORS = {
  LOW: 'bg-blue-100 text-blue-600',
  MEDIUM: 'bg-yellow-100 text-yellow-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600'
};
