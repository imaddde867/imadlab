import * as React from "react"
import { FieldValues, FieldPath } from "react-hook-form"

// Contexts must be shared between files
export type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

export type FormItemContextValue = {
  id: string
}

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

export function useFormField() {
  // Dummy implementation for context, replace with actual logic as needed
  return {
    error: undefined,
    formItemId: undefined,
    formDescriptionId: undefined,
    formMessageId: undefined,
  }
}
