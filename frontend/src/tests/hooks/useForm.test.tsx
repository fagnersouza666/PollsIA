import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useForm } from '../../hooks/common/useForm';

describe('useForm', () => {
  const validationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    age: z.number().min(18, 'Must be at least 18 years old'),
  });

  const initialValues = {
    name: '',
    email: '',
    age: 0,
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit: mockOnSubmit })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('should update values when setValue is called', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.setValue('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
    expect(result.current.isValid).toBe(false); // Because email and age are still invalid
  });

  it('should validate values when setValue is called', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.setValue('name', 'A'); // Too short
    });

    expect(result.current.errors.name).toBe('Name must be at least 2 characters');
    expect(result.current.isValid).toBe(false);
  });

  it('should clear errors when valid value is set', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    // Set invalid value first
    act(() => {
      result.current.setValue('name', 'A');
    });

    expect(result.current.errors.name).toBe('Name must be at least 2 characters');

    // Set valid value
    act(() => {
      result.current.setValue('name', 'John Doe');
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it('should set touched state when setTouched is called', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.setTouched('name', true);
    });

    expect(result.current.touched.name).toBe(true);
  });

  it('should handle change events correctly', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit: mockOnSubmit })
    );

    const mockEvent = {
      target: { value: 'John Doe' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange('name')(mockEvent);
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  it('should handle blur events correctly', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.handleBlur('name')();
    });

    expect(result.current.touched.name).toBe(true);
  });

  it('should submit form when all values are valid', async () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    // Set valid values
    act(() => {
      result.current.setValue('name', 'John Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('age', 25);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    });
  });

  it('should not submit form when values are invalid', async () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    // Leave invalid values
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(result.current.isValid).toBe(false);
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  it('should mark all fields as touched on submit', async () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.age).toBe(true);
  });

  it('should reset form to initial values', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit: mockOnSubmit })
    );

    // Set some values
    act(() => {
      result.current.setValue('name', 'John Doe');
      result.current.setTouched('name', true);
    });

    // Reset form
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.touched).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should reset form to new values when provided', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, onSubmit: mockOnSubmit })
    );

    const newValues = { name: 'Jane Doe', email: 'jane@example.com', age: 30 };

    act(() => {
      result.current.reset(newValues);
    });

    expect(result.current.values).toEqual(newValues);
  });

  it('should return correct field props', () => {
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: mockOnSubmit })
    );

    // Set some values and touch field
    act(() => {
      result.current.setValue('name', 'A'); // Invalid
      result.current.setTouched('name', true);
    });

    const fieldProps = result.current.getFieldProps('name');

    expect(fieldProps.value).toBe('A');
    expect(fieldProps.error).toBe('Name must be at least 2 characters');
    expect(typeof fieldProps.onChange).toBe('function');
    expect(typeof fieldProps.onBlur).toBe('function');
  });

  it('should handle async onSubmit function', async () => {
    const asyncOnSubmit = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() =>
      useForm({ initialValues, validationSchema, onSubmit: asyncOnSubmit })
    );

    // Set valid values
    act(() => {
      result.current.setValue('name', 'John Doe');
      result.current.setValue('email', 'john@example.com');
      result.current.setValue('age', 25);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(asyncOnSubmit).toHaveBeenCalled();
  });
});