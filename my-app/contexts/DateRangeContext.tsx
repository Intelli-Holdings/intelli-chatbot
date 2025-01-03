'use client'

import React, { createContext, useContext, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'

interface DateRangeContextType {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined)

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  )
}

export function useDateRange() {
  const context = useContext(DateRangeContext)
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider')
  }
  return context
}

