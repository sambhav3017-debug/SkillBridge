"use client";

import { useState, useCallback } from "react";

export type ValidationRule<T> = (value: any, allValues: T) => string | null;

export const Validators = {
  required: (fieldName: string = "This field"): ValidationRule<any> => (value) => {
    if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required.`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `Please select at least one ${fieldName.toLowerCase()}.`;
    }
    return null;
  },

  email: (): ValidationRule<any> => (value) => {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).trim()) ? null : "Please enter a valid email address.";
  },

  phone: (): ValidationRule<any> => (value) => {
    if (!value) return null;
    const re = /^\+?[0-9\s\-()]{7,20}$/;
    return re.test(String(value).trim()) ? null : "Please enter a valid phone number.";
  },

  url: (): ValidationRule<any> => (value) => {
    if (!value) return null;
    try {
      new URL(String(value));
      return null;
    } catch {
      return "Please enter a valid URL (e.g. https://example.com).";
    }
  },

  minLength: (min: number, fieldName: string = "Field"): ValidationRule<any> => (value) => {
    if (!value) return null;
    return String(value).trim().length >= min
      ? null
      : `${fieldName} must be at least ${min} characters long.`;
  },

  maxLength: (max: number, fieldName: string = "Field"): ValidationRule<any> => (value) => {
    if (!value) return null;
    return String(value).trim().length <= max
      ? null
      : `${fieldName} cannot exceed ${max} characters.`;
  },
};

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: Partial<Record<keyof T, ValidationRule<T>[]>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, val: any, currentValues?: T) => {
      const fieldRules = rules[field];
      if (!fieldRules || fieldRules.length === 0) return null;

      const vals = currentValues || values;
      for (const rule of fieldRules) {
        const error = rule(val, vals);
        if (error) return error;
      }
      return null;
    },
    [rules, values]
  );

  const setValue = useCallback(
    (field: keyof T, val: any) => {
      setValues((prev) => {
        const updated = { ...prev, [field]: val };
        if (touched[field]) {
          const err = validateField(field, val, updated);
          setErrors((prevErr) => ({ ...prevErr, [field]: err || undefined }));
        }
        return updated;
      });
    },
    [touched, validateField]
  );

  const setFieldTouched = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const err = validateField(field, values[field]);
      setErrors((prev) => ({ ...prev, [field]: err || undefined }));
    },
    [validateField, values]
  );

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    let isValid = true;

    for (const field of Object.keys(rules) as (keyof T)[]) {
      newTouched[field] = true;
      const err = validateField(field, values[field]);
      if (err) {
        newErrors[field] = err;
        isValid = false;
      }
    }

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  }, [rules, validateField, values]);

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}
