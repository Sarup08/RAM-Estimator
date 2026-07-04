import { Workload } from '../types';
import { VALIDATION_RANGES } from '../constants';

export interface ValidationErrors {
  [key: string]: { field: string; message: string };
}

export function validateWorkload(workload: Partial<Workload>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!workload.type) {
    errors.type = { field: 'type', message: 'Workload type is required' };
  }

  if (workload.modelSize === undefined || workload.modelSize === null) {
    errors.modelSize = { field: 'modelSize', message: 'Model size is required' };
  } else if (workload.modelSize < VALIDATION_RANGES.modelSize.min ||
             workload.modelSize > VALIDATION_RANGES.modelSize.max) {
    errors.modelSize = { field: 'modelSize', message: VALIDATION_RANGES.modelSize.message };
  }

  if (workload.batchSize === undefined || workload.batchSize === null) {
    errors.batchSize = { field: 'batchSize', message: 'Batch size is required' };
  } else if (!Number.isInteger(workload.batchSize) ||
             workload.batchSize < VALIDATION_RANGES.batchSize.min ||
             workload.batchSize > VALIDATION_RANGES.batchSize.max) {
    errors.batchSize = { field: 'batchSize', message: VALIDATION_RANGES.batchSize.message };
  }

  if (workload.numGPUs === undefined || workload.numGPUs === null) {
    errors.numGPUs = { field: 'numGPUs', message: 'Number of GPUs is required' };
  } else if (!Number.isInteger(workload.numGPUs) ||
             workload.numGPUs < VALIDATION_RANGES.numGPUs.min ||
             workload.numGPUs > VALIDATION_RANGES.numGPUs.max) {
    errors.numGPUs = { field: 'numGPUs', message: VALIDATION_RANGES.numGPUs.message };
  }

  if (!workload.precision) {
    errors.precision = { field: 'precision', message: 'Precision is required' };
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getFieldError(errors: ValidationErrors, field: string): { field: string; message: string } | undefined {
  return errors[field];
}