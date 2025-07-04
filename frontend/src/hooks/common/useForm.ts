import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const validate = useCallback((values: T): Partial<Record<keyof T, string>> => {
    if (!validationSchema) return {};

    try {
      validationSchema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          if (path) {
            errors[path] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  }, [validationSchema]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setState((prev) => {
      const newValues = { ...prev.values, [field]: value };
      const errors = validate(newValues);
      
      return {
        ...prev,
        values: newValues,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    });
  }, [validate]);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const handleChange = useCallback((field: keyof T) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(field, true);
  }, [setTouched]);

  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = Object.keys(state.values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);

    setState(prev => ({ ...prev, touched: allTouched }));

    const errors = validate(state.values);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors, isValid: false }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validate, onSubmit]);

  const reset = useCallback((newValues?: T) => {
    setState({
      values: newValues || initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: state.values[field] || '',
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: state.touched[field] && state.errors[field],
  }), [state.values, state.touched, state.errors, handleChange, handleBlur]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
  };
};