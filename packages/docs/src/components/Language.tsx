import React from 'react'
import { useLocale, Locale } from '../context/LocaleContext'

export interface LanguageProps {
  locale: Locale
  children: React.ReactNode
}

export const Language: React.FC<LanguageProps> = ({ locale, children }) => {
  const { locale: currentLocale } = useLocale()
  if (currentLocale !== locale) {
    return null
  }
  return <>{children}</>
}

Language.displayName = 'Language'
