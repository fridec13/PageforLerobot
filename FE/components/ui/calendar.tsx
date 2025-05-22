"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDatePickerState, useCalendars, useDaysPropGetters } from "@rehookify/datepicker"
import { add, format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  defaultMonth?: Date
  fromDate?: Date
  toDate?: Date
  showOutsideDays?: boolean
  disabled?: boolean
  locale?: Intl.LocalesArgument
}

function Calendar({
  className,
  selected,
  onSelect,
  defaultMonth = new Date(),
  fromDate,
  toDate,
  disabled,
  showOutsideDays = true,
  locale
}: CalendarProps) {
  const config = React.useMemo(() => {
    return {
      selectedDates: selected ? [selected] : [],
      dates: {
        mode: "single" as const,
        minDate: fromDate,
        maxDate: toDate,
      },
      calendar: {
        startDate: defaultMonth,
      }
    }
  }, [selected, fromDate, toDate, defaultMonth])

  const { state, actions } = useDatePickerState(config)
  const { calendars } = useCalendars(state)
  const { dayButton } = useDaysPropGetters(state, actions)

  const handleSelectDate = (date: Date) => {
    if (onSelect) {
      if (state.selectedDates[0] && state.selectedDates[0].getTime() === date.getTime()) {
        onSelect(undefined)
      } else {
        onSelect(date)
      }
    }
  }

  const handlePrevMonth = () => {
    actions.setCalendarMonth(add(calendars[0].month, { months: -1 }))
  }

  const handleNextMonth = () => {
    actions.setCalendarMonth(add(calendars[0].month, { months: 1 }))
  }

  if (!calendars.length) return null

  const calendar = calendars[0]

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-center pt-1 relative items-center">
        <div className="text-sm font-medium">
          {format(new Date(calendar.year, calendar.month), "MMMM yyyy", { locale: locale })}
        </div>
        <div className="space-x-1 flex items-center">
          <button
            onClick={handlePrevMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
            )}
            disabled={disabled}
          >
            <span className="sr-only">이전 달</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
            )}
            disabled={disabled}
          >
            <span className="sr-only">다음 달</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <table className="w-full border-collapse space-y-1">
        <thead>
          <tr className="flex">
            {calendar.weekDays.map((weekDay) => (
              <th
                key={weekDay.day}
                className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]"
              >
                {format(weekDay.date, "EEEEE", { locale: locale })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.days.map((week, weekIndex) => (
            <tr key={weekIndex} className="flex w-full mt-2">
              {week.map((day) => {
                const isCurrentMonth = day.inCurrentMonth
                const isSelected = selected && day.date.getTime() === selected.getTime()
                const isToday = day.isToday
                const isDisabled = day.disabled || disabled

                return (
                  <td
                    key={day.day}
                    className={cn(
                      "h-9 w-9 text-center text-sm p-0 relative",
                      !isCurrentMonth && !showOutsideDays && "invisible",
                      !isCurrentMonth && showOutsideDays && "text-muted-foreground opacity-50"
                    )}
                  >
                    <button
                      {...dayButton(day.date)}
                      type="button"
                      onClick={() => handleSelectDate(day.date)}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-9 w-9 p-0 font-normal",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        isToday && !isSelected && "bg-accent text-accent-foreground", 
                        isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed"
                      )}
                      disabled={isDisabled}
                    >
                      {day.day}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
