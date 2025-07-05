import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['pt-BR', 'en-US'] as const;
export const defaultLocale = 'pt-BR' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
    'pt-BR': 'Português',
    'en-US': 'English',
};

export const localeFlags: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en-US': '🇺🇸',
};

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
    locales,
}); 