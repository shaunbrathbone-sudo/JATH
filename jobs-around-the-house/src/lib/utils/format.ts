/**
 * Currency and locale utilities for Jobs Around The House.
 * All monetary values are in GBP (£) using en-GB formatting.
 */

const LOCALE = "en-GB";
const CURRENCY = "GBP";

/**
 * Format a number as GBP currency (e.g., £148.80)
 */
const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a number as GBP with no pence for whole amounts (e.g., £150)
 */
const formatPriceWhole = (amount: number): string => {
    return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Format a number as GBP per unit (e.g., "£3.50/m²")
 */
const formatPricePerUnit = (amount: number, unit: string): string => {
    return `${formatPrice(amount)}/${unit}`;
};

/**
 * Calculate a 50% deposit amount
 */
const calculateDeposit = (
    total: number,
): {
    deposit: number;
    remaining: number;
} => {
    const deposit = Math.ceil(total * 50) / 100; // Round up to nearest penny
    return {
        deposit,
        remaining: total - deposit,
    };
};

/**
 * Format a date in UK format (e.g., "4 June 2026")
 */
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(LOCALE, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

/**
 * Format a date in short UK format (e.g., "04/06/2026")
 */
const formatDateShort = (date: Date): string => {
    return new Intl.DateTimeFormat(LOCALE, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

/**
 * Format a time in UK format (e.g., "14:30")
 */
const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

export {
    LOCALE,
    CURRENCY,
    formatPrice,
    formatPriceWhole,
    formatPricePerUnit,
    calculateDeposit,
    formatDate,
    formatDateShort,
    formatTime,
};
