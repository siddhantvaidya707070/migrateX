'use client'

import * as React from 'react'

// Mock currency data
export const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
]

export const DATE_FORMATS = [
    { id: 'us', label: 'MM/DD/YYYY' },
    { id: 'eu', label: 'DD/MM/YYYY' },
    { id: 'iso', label: 'YYYY-MM-DD' },
]

interface CurrencyContextType {
    currency: { code: string; name: string; symbol: string }
    setCurrency: (code: string) => void
    dateFormat: string
    setDateFormat: (format: string) => void
}

const CurrencyContext = React.createContext<CurrencyContextType>({
    currency: CURRENCIES[0],
    setCurrency: () => { },
    dateFormat: 'us',
    setDateFormat: () => { },
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currencyCode, setCurrencyCode] = React.useState('USD')
    const [dateFormat, setDateFormat] = React.useState('us')

    const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency: setCurrencyCode,
            dateFormat,
            setDateFormat
        }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    return React.useContext(CurrencyContext)
}
