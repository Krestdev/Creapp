"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * Habillage commun des champs (Figma · TextField / SelectField) : libellé
 * toujours au-dessus (jamais seulement en placeholder), astérisque danger si
 * requis, aide ou erreur en dessous. Prévoir +30 % de longueur (FR/EN/IT).
 */
function FieldShell({
  id,
  label,
  required,
  helper,
  error,
  disabled,
  className,
  children,
}: {
  id: string
  label: string
  required?: boolean
  helper?: React.ReactNode
  error?: React.ReactNode
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  const message = error ?? helper
  return (
    <div
      data-slot="field"
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      <Label htmlFor={id} className={cn(disabled && "text-text-disabled")}>
        {label}
        {required && (
          <span aria-hidden className="text-status-danger-fg">
            *
          </span>
        )}
      </Label>
      {children}
      {message && (
        <p
          id={`${id}-message`}
          className={cn(
            "text-caption",
            error
              ? "text-status-danger-fg"
              : disabled
                ? "text-text-disabled"
                : "text-text-tertiary"
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}

type CommonProps = {
  label: string
  helper?: React.ReactNode
  error?: React.ReactNode
  className?: string
}

export function TextField({
  label,
  helper,
  error,
  icon,
  className,
  required,
  disabled,
  id,
  ...props
}: CommonProps &
  Omit<React.ComponentProps<"input">, "className"> & {
    icon?: React.ReactNode
  }) {
  const autoId = React.useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={required}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-tertiary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <Input
          id={fieldId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? `${fieldId}-message` : undefined}
          className={cn(icon && "pl-9")}
          {...props}
        />
      </div>
    </FieldShell>
  )
}

export function TextareaField({
  label,
  helper,
  error,
  className,
  required,
  disabled,
  id,
  counter,
  ...props
}: CommonProps &
  Omit<React.ComponentProps<"textarea">, "className"> & {
    /** Affiche « n / max » à droite de l'aide. */
    counter?: { value: number; max: number }
  }) {
  const autoId = React.useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={required}
      helper={
        counter ? (
          <span className="flex w-full items-start gap-2">
            <span className="flex-1">{helper}</span>
            <span className="tabular-nums">
              {counter.value} / {counter.max}
            </span>
          </span>
        ) : (
          helper
        )
      }
      error={error}
      disabled={disabled}
      className={className}
    >
      <Textarea
        id={fieldId}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || helper ? `${fieldId}-message` : undefined}
        {...props}
      />
    </FieldShell>
  )
}

export type SelectOption = { value: string; label: string }

export function SelectField({
  label,
  helper,
  error,
  className,
  required,
  disabled,
  id,
  options,
  placeholder,
  value,
  defaultValue,
  onValueChange,
}: CommonProps & {
  id?: string
  required?: boolean
  disabled?: boolean
  options: SelectOption[]
  placeholder?: string
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}) {
  const autoId = React.useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={required}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      <Select
        value={value ?? undefined}
        defaultValue={defaultValue ?? undefined}
        disabled={disabled}
        onValueChange={(v) => onValueChange?.(v)}
      >
        <SelectTrigger
          id={fieldId}
          className="w-full"
          aria-invalid={error ? true : undefined}
        >
          <SelectValue placeholder={placeholder ?? "Choisir"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}
