import { Precision, WorkloadType } from './types';

// ---- Precision options for dropdowns ----

export const PRECISION_OPTIONS = [
  { value: Precision.FP32, label: 'FP32 (32-bit, 4 bytes/param)' },
  { value: Precision.FP16, label: 'FP16 (16-bit, 2 bytes/param)' },
  { value: Precision.BF16, label: 'BF16 (16-bit, 2 bytes/param)' },
  { value: Precision.INT8, label: 'INT8 (8-bit, 1 byte/param)' },
  { value: Precision.INT4, label: 'INT4 (4-bit, 0.5 bytes/param)' },
];

export const WORKLOAD_TYPE_OPTIONS = [
  { value: WorkloadType.LLM_FINETUNING, label: 'LLM Fine-tuning' },
  { value: WorkloadType.EMBEDDING, label: 'Embedding Pipeline' },
  { value: WorkloadType.RAG, label: 'RAG System' },
  { value: WorkloadType.MULTIMODAL, label: 'Multi-modal Pipeline' },
];

// ---- Validation ranges ----

export const VALIDATION_RANGES = {
  modelSize: { min: 0.1, max: 2000, step: 0.1, message: 'Model size must be between 0.1 GB and 2000 GB' },
  batchSize: { min: 1, max: 1024, step: 1, message: 'Batch size must be between 1 and 1024' },
  numGPUs: { min: 1, max: 128, step: 1, message: 'Number of GPUs must be between 1 and 128' },
};

// ---- Estimation formula constants ----

// These represent the fractional overhead per workload type
// based on standard LLM memory estimation research
export const WORKLOAD_FACTORS = {
  [WorkloadType.LLM_FINETUNING]: {
    activationPerBatch: 0.3,   // activation memory per batch as % of model params
    optimizerMultiplier: 1.0,  // optimizer states (Adam = 4x params in FP32)
    gradientMultiplier: 0.5,   // gradients
    dataMultiplier: 0.1,       // input/output data storage
    overheadPct: 0.15,         // 15% system overhead
  },
  [WorkloadType.EMBEDDING]: {
    activationPerBatch: 0.2,
    optimizerMultiplier: 0,
    gradientMultiplier: 0,
    dataMultiplier: 0.5,
    overheadPct: 0.1,
  },
  [WorkloadType.RAG]: {
    activationPerBatch: 0.1,
    optimizerMultiplier: 0,
    gradientMultiplier: 0,
    dataMultiplier: 0.8,
    overheadPct: 0.1,
  },
  [WorkloadType.MULTIMODAL]: {
    activationPerBatch: 0.5,
    optimizerMultiplier: 0.5,
    gradientMultiplier: 0.25,
    dataMultiplier: 0.3,
    overheadPct: 0.2,
  },
};
