import * as React from 'react'
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form'
import { Label } from '@/shared/ui/label'
import { Input, InputProps } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  return {
    name: fieldContext.name,
    ...fieldState,
  }
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      />
    )
  }
)
FormItem.displayName = 'FormItem'

interface FormLabelProps
  extends React.ComponentPropsWithoutRef<typeof Label> {}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className, ...props }, ref) => {
  const { error } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

interface FormControlProps
  extends React.ComponentPropsWithoutRef<typeof Input> {}

const FormControl = React.forwardRef<
  React.ElementRef<typeof Input>,
  FormControlProps
>(({ ...props }, ref) => {
  const { error } = useFormField()
  const { name, onBlur, onChange, value } = useFormContext().register(useFormField().name)

  return (
    <Input
      ref={ref}
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      defaultValue={value}
      className={cn(error && 'border-destructive')}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'


interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  FormMessageProps
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

const Form = FormProvider;

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
};
