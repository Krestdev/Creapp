"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "../ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"

const formSchema = z.object({
  type: z.string().optional(),
  secteur: z.string().optional(),
  date: z.date().optional(),
})

type FormType = z.infer<typeof formSchema>

interface Props {
  children: React.JSX.Element
  onSubmit: (data: FormType) => void
}

export function Filtrer({ children, onSubmit }: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      secteur: undefined,
      date: undefined,
    },
  })

  const handleReset = () => {
    form.reset()
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="!max-w-[260px] w-full">
        <div className="p-2 flex flex-col gap-12">
          <DrawerHeader className="border-b border-gray-200">
            <DrawerTitle>Filtres</DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 px-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="distributeur">Distributeur</SelectItem>
                          <SelectItem value="grossiste">Grossiste</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secteur"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Secteur d'activité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="info">Informatique</SelectItem>
                          <SelectItem value="electro">Électronique</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Sélectionner une date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <Button type="button" variant="outline" onClick={handleReset}>
                Réinitialiser
              </Button>
              <DrawerClose>
                <Button className="w-full" type="submit">Filtrer</Button>
              </DrawerClose>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
