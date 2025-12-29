"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth }) => {
          const { fromYear, toYear } = props
          const currentYear = displayMonth.getFullYear()
          const currentMonth = displayMonth.getMonth()

          // Si no se especifica toYear, permitimos hasta 10 años en el futuro
          const maxYear = toYear || (currentYear + 10)
          // Si no se especifica fromYear, usamos 1900 como mínimo
          const minYear = fromYear || 1900

          const years = Array.from(
            { length: maxYear - minYear + 1 },
            (_, i) => minYear + i
          ).reverse()
          const months = Array.from({ length: 12 }, (_, i) => i)

          return (
            <div className="flex justify-center items-center gap-4">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium capitalize"
                  >
                    {format(displayMonth, "MMMM yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flex">
                  <ScrollArea className="h-48 w-40">
                    <div className="p-2">
                    {months.map((month) => (
                      <Button
                        key={month}
                        variant="ghost"
                        className={cn("w-full justify-start", month === currentMonth && "bg-accent")}
                        onClick={() => {
                          const newDate = new Date(displayMonth)
                          newDate.setMonth(month)
                          props.onMonthChange?.(newDate)
                        }}
                      >
                        {format(new Date(currentYear, month), "MMMM", { locale: es })}
                      </Button>
                    ))}
                    </div>
                  </ScrollArea>
                  <ScrollArea className="h-48 w-28">
                    <div className="p-2">
                    {years.map((year) => (
                      <Button
                        key={year}
                        variant="ghost"
                        className={cn("w-full justify-start", year === currentYear && "bg-accent")}
                        onClick={() => {
                          const newDate = new Date(displayMonth)
                          newDate.setFullYear(year)
                          props.onMonthChange?.(newDate)
                          setPopoverOpen(false)
                        }}
                      >
                        {year}
                      </Button>
                    ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
