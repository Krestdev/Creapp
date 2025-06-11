import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"

interface DatePickerProps {
    value?: Date
    onChange: (date?: Date) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Sélectionner une date",
    className,
    disabled = false,
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "PPP") : placeholder}
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    selected={value}
                    onSelect={onChange}
                />
            </PopoverContent>
        </Popover>
    )
}