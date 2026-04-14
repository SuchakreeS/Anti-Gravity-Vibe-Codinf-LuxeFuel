import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const FALLBACK_RATES = {
  THB: 1,
  USD: 0.029,
  EUR: 0.026,
  GBP: 0.023,
  JPY: 4.28,
  CNY: 0.21,
  KRW: 39.5,
};

const CURRENCY_SYMBOLS = {
  THB: '฿',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
};

const CURRENCY_NAMES = {
  THB: 'Thai Baht',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  KRW: 'Korean Won',
};

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'THB',
      rates: FALLBACK_RATES,
      loading: true,
      availableCurrencies: Object.keys(CURRENCY_SYMBOLS),
      currencyNames: CURRENCY_NAMES,
      
      setCurrency: (currency) => set({ currency }),
      
      fetchRates: async () => {
        set({ loading: true });
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/THB');
          const data = await res.json();
          if (data.result === 'success') {
            const filtered = {};
            Object.keys(FALLBACK_RATES).forEach(code => {
              filtered[code] = data.rates[code] || FALLBACK_RATES[code];
            });
            set({ rates: filtered });
          }
        } catch (err) {
          console.warn('Failed to fetch live exchange rates, using fallback.', err);
        } finally {
          set({ loading: false });
        }
      },
      
      symbol: () => CURRENCY_SYMBOLS[get().currency] || '',
      
      convert: (amountInTHB) => {
        if (amountInTHB === null || amountInTHB === undefined) return null;
        const state = get();
        const rate = state.rates[state.currency] || 1;
        return amountInTHB * rate;
      },
      
      formatPrice: (amountInTHB, decimals = 2) => {
        const converted = get().convert(amountInTHB);
        if (converted === null) return '—';
        const symb = CURRENCY_SYMBOLS[get().currency] || '';
        return `${symb}${converted.toFixed(decimals)}`;
      }
    }),
    {
      name: 'luxefuel-currency',
      storage: createJSONStorage(() => localStorage),
      // Only persist the currency selection, let rates be fetched fresh
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);

// Trigger initial fetch
useCurrencyStore.getState().fetchRates();
