import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormField as FormFieldType } from '@/types/forms';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  field: FormFieldType;
  disabled?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  field, 
  disabled = false, 
  className 
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch
  } = useFormContext();

  const error = errors[field.name]?.message as string;
  const currentValue = watch(field.name);

  // Helper to generate field ID
  const fieldId = `field-${field.id}`;

  // Render field label
  const renderLabel = () => (
    <Label 
      htmlFor={fieldId} 
      className={cn(
        "text-sm font-medium",
        field.required && "after:content-['*'] after:text-destructive after:ml-1",
        error && "text-destructive"
      )}
    >
      {field.label}
    </Label>
  );

  // Render field description
  const renderDescription = () => {
    if (!field.description) return null;
    return (
      <p className="text-xs text-muted-foreground mt-1">
        {field.description}
      </p>
    );
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;
    return (
      <p className="text-xs text-destructive mt-1">
        {error}
      </p>
    );
  };

  // Render different field types
  const renderFieldInput = () => {
    const commonProps = {
      id: fieldId,
      disabled: disabled || field.disabled || field.readonly,
      className: cn(error && "border-destructive")
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false,
              pattern: field.type === 'email' ? {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              } : field.pattern ? {
                value: new RegExp(field.pattern),
                message: 'Please enter a valid format'
              } : undefined
            }}
            render={({ field: formField }) => (
              <Input
                {...commonProps}
                {...formField}
                type={field.type}
                placeholder={field.placeholder}
                pattern={field.pattern}
              />
            )}
          />
        );

      case 'phone':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false,
              pattern: {
                value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                message: 'Please enter a valid phone number'
              }
            }}
            render={({ field: formField }) => (
              <Input
                {...commonProps}
                {...formField}
                type="tel"
                placeholder={field.placeholder || "+675 123 4567"}
              />
            )}
          />
        );

      case 'number':
      case 'currency':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false,
              min: field.min ? {
                value: Number(field.min),
                message: `Minimum value is ${field.min}`
              } : undefined,
              max: field.max ? {
                value: Number(field.max),
                message: `Maximum value is ${field.max}`
              } : undefined
            }}
            render={({ field: formField }) => (
              <div className="relative">
                {field.type === 'currency' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    PGK
                  </span>
                )}
                <Input
                  {...commonProps}
                  {...formField}
                  type="number"
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className={cn(
                    field.type === 'currency' && "pl-12",
                    commonProps.className
                  )}
                  onChange={(e) => formField.onChange(e.target.valueAsNumber || e.target.value)}
                />
              </div>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false,
              minLength: field.validation?.find(v => v.type === 'minLength') ? {
                value: field.validation.find(v => v.type === 'minLength')?.value,
                message: field.validation.find(v => v.type === 'minLength')?.message || 'Text is too short'
              } : undefined,
              maxLength: field.validation?.find(v => v.type === 'maxLength') ? {
                value: field.validation.find(v => v.type === 'maxLength')?.value,
                message: field.validation.find(v => v.type === 'maxLength')?.message || 'Text is too long'
              } : undefined
            }}
            render={({ field: formField }) => (
              <Textarea
                {...commonProps}
                {...formField}
                placeholder={field.placeholder}
                rows={field.rows || 3}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => (
              <Select
                disabled={commonProps.disabled}
                value={formField.value}
                onValueChange={formField.onChange}
              >
                <SelectTrigger className={commonProps.className}>
                  <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'multiselect':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => {
              const selectedValues = Array.isArray(formField.value) ? formField.value : [];
              
              return (
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldId}-${option.value}`}
                        checked={selectedValues.includes(option.value)}
                        disabled={commonProps.disabled || option.disabled}
                        onCheckedChange={(checked) => {
                          const newValues = checked
                            ? [...selectedValues, option.value]
                            : selectedValues.filter(v => v !== option.value);
                          formField.onChange(newValues);
                        }}
                      />
                      <Label htmlFor={`${fieldId}-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        );

      case 'radio-group':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => (
              <RadioGroup
                value={formField.value}
                onValueChange={formField.onChange}
                disabled={commonProps.disabled}
              >
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`${fieldId}-${option.value}`}
                      disabled={option.disabled}
                    />
                    <Label htmlFor={`${fieldId}-${option.value}`}>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={fieldId}
                  checked={formField.value}
                  disabled={commonProps.disabled}
                  onCheckedChange={formField.onChange}
                />
                <Label htmlFor={fieldId} className="text-sm font-normal">
                  {field.description || 'Check this box'}
                </Label>
              </div>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formField.value && "text-muted-foreground",
                      commonProps.className
                    )}
                    disabled={commonProps.disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formField.value ? (
                      format(new Date(formField.value), "PPP")
                    ) : (
                      <span>{field.placeholder || "Pick a date"}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formField.value ? new Date(formField.value) : undefined}
                    onSelect={(date) => formField.onChange(date?.toISOString())}
                    initialFocus
                    disabled={commonProps.disabled}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        );

      case 'time':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => (
              <Input
                {...commonProps}
                {...formField}
                type="time"
                placeholder={field.placeholder}
              />
            )}
          />
        );

      case 'datetime':
      case 'datetime-local':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false,
            }}
            render={({ field: { onChange, value, name, ref } }) => {
              // Ensure value is a string and in the correct format for the input
              const displayValue = value ? new Date(value).toISOString().slice(0, 16) : '';
              return (
                <Input
                  {...commonProps}
                  name={name}
                  ref={ref}
                  value={displayValue}
                  type="datetime-local"
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Store as a full ISO string in the form state
                      onChange(new Date(e.target.value).toISOString());
                    } else {
                      onChange(null);
                    }
                  }}
                />
              );
            }}
          />
        );

      case 'checkbox-group':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => {
              const selectedValues = Array.isArray(formField.value) ? formField.value : [];
              
              return (
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldId}-${option.value}`}
                        checked={selectedValues.includes(option.value)}
                        disabled={commonProps.disabled || option.disabled}
                        onCheckedChange={(checked) => {
                          const newValues = checked
                            ? [...selectedValues, option.value]
                            : selectedValues.filter(v => v !== option.value);
                          formField.onChange(newValues);
                        }}
                      />
                      <Label htmlFor={`${fieldId}-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{
              required: field.required ? `${field.label} is required` : false
            }}
            render={({ field: formField }) => (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative"
                    disabled={commonProps.disabled}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose files
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept={field.accept}
                      multiple={field.multiple}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        formField.onChange(field.multiple ? files : files[0]);
                      }}
                      disabled={commonProps.disabled}
                    />
                  </Button>
                  {field.accept && (
                    <span className="text-xs text-muted-foreground">
                      Accepted: {field.accept}
                    </span>
                  )}
                </div>
                
                {/* Show selected files */}
                {formField.value && (
                  <div className="space-y-1">
                    {Array.isArray(formField.value) ? (
                      formField.value.map((file: File, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                          <span>{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFiles = formField.value.filter((_: any, i: number) => i !== index);
                              formField.onChange(newFiles.length ? newFiles : null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <span>{(formField.value as File).name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => formField.onChange(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          />
        );

      default:
        return (
          <div className="p-4 border border-dashed border-muted-foreground/25 rounded text-center text-muted-foreground">
            Field type "{field.type}" not implemented
          </div>
        );
    }
  };

  if (field.hidden) {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: formField }) => (
          <input type="hidden" {...formField} />
        )}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {field.type !== 'checkbox' && renderLabel()}
      {renderFieldInput()}
      {field.type !== 'checkbox' && renderDescription()}
      {renderError()}
    </div>
  );
};
