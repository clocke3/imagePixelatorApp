import { Inclusive_Sans } from "next/font/google";

export const inclusive_sans_init = Inclusive_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inclusive_sans',
    weight: '400',
});

export const inclusive_sans = inclusive_sans_init.className;
