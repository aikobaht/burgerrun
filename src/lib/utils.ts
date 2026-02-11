import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateShareUrl(groupId: string): string {
  return `${window.location.origin}/join/${groupId}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatCustomizations(customizations: Array<{ type: string; value: string | number | boolean; label: string }>): string {
  return customizations
    .map((c) => `${c.label}: ${c.value}`)
    .join(', ');
}

export function isOrganizer(organizerToken: string | undefined, sessionOrganizerToken: string | undefined): boolean {
  return !!(organizerToken && sessionOrganizerToken && organizerToken === sessionOrganizerToken);
}
