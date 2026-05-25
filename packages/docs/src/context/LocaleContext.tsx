import React from 'react'

export type Locale = 'pt-BR' | 'en-US'

export interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = React.createContext<LocaleContextType | undefined>(
  undefined
)

export interface LocaleProviderProps {
  locale?: Locale
  children: React.ReactNode
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  locale: propLocale,
  children,
}) => {
  const [localeState, setLocaleState] = React.useState<Locale>('pt-BR')

  const locale = propLocale || localeState
  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = (): LocaleContextType => {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
