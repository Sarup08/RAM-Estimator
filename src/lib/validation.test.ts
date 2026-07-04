import { describe, it, expect } from 'vitest';
import { validateWorkload, hasErrors, getFieldError } from './validation';
import { WorkloadType, Precision } from '../types';

describe('validateWorkload', () => {
  const validWorkload = {
    type: WorkloadType.LLM_FINETUNING,
    modelSize: 7,
    batchSize: 4,
    numGPUs: 1,
    precision: Precision.FP16,
  };

  it('returns no errors for valid workload', () => {
    const errors = validateWorkload(validWorkload);
    expect(hasErrors(errors)).toBe(false);
  });

  it('errors when type is missing', () => {
    const errors = validateWorkload({ ...validWorkload, type: '' });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'type')).toBeDefined();
  });

  it('errors when modelSize is missing', () => {
    const errors = validateWorkload({ ...validWorkload, modelSize: undefined });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'modelSize')).toBeDefined();
  });

  it('errors when modelSize is below minimum', () => {
    const errors = validateWorkload({ ...validWorkload, modelSize: 0 });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'modelSize')?.message).toContain('between');
  });

  it('errors when modelSize is above maximum', () => {
    const errors = validateWorkload({ ...validWorkload, modelSize: 2001 });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'modelSize')?.message).toContain('between');
  });

  it('errors when batchSize is missing', () => {
    const errors = validateWorkload({ ...validWorkload, batchSize: undefined });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'batchSize')).toBeDefined();
  });

  it('errors when batchSize is not an integer', () => {
    const errors = validateWorkload({ ...validWorkload, batchSize: 3.5 });
    expect(hasErrors(errors)).toBe(true);
  });

  it('errors when batchSize is below minimum', () => {
    const errors = validateWorkload({ ...validWorkload, batchSize: 0 });
    expect(hasErrors(errors)).toBe(true);
  });

  it('errors when numGPUs is missing', () => {
    const errors = validateWorkload({ ...validWorkload, numGPUs: undefined });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'numGPUs')).toBeDefined();
  });

  it('errors when numGPUs is not an integer', () => {
    const errors = validateWorkload({ ...validWorkload, numGPUs: 2.5 });
    expect(hasErrors(errors)).toBe(true);
  });

  it('errors when precision is missing', () => {
    const errors = validateWorkload({ ...validWorkload, precision: '' });
    expect(hasErrors(errors)).toBe(true);
    expect(getFieldError(errors, 'precision')).toBeDefined();
  });

  it('accepts valid modelSize at minimum boundary', () => {
    const errors = validateWorkload({ ...validWorkload, modelSize: 0.1 });
    expect(getFieldError(errors, 'modelSize')).toBeUndefined();
  });

  it('accepts valid modelSize at maximum boundary', () => {
    const errors = validateWorkload({ ...validWorkload, modelSize: 2000 });
    expect(getFieldError(errors, 'modelSize')).toBeUndefined();
  });

  it('accepts valid batchSize at minimum boundary', () => {
    const errors = validateWorkload({ ...validWorkload, batchSize: 1 });
    expect(getFieldError(errors, 'batchSize')).toBeUndefined();
  });

  it('accepts valid numGPUs at maximum boundary', () => {
    const errors = validateWorkload({ ...validWorkload, numGPUs: 128 });
    expect(getFieldError(errors, 'numGPUs')).toBeUndefined();
  });
});

describe('hasErrors', () => {
  it('returns true for non-empty errors', () => {
    expect(hasErrors({ type: { field: 'type', message: 'Required' } })).toBe(true);
  });

  it('returns false for empty errors', () => {
    expect(hasErrors({})).toBe(false);
  });
});

describe('getFieldError', () => {
  it('returns the error for a given field', () => {
    const errors = { type: { field: 'type', message: 'Required' } };
    const error = getFieldError(errors, 'type');
    expect(error).toBeDefined();
    expect(error?.message).toBe('Required');
  });

  it('returns undefined for non-existent field', () => {
    const error = getFieldError({}, 'nonexistent');
    expect(error).toBeUndefined();
  });
});