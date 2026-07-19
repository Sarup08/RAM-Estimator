export enum WorkloadType {
  LLM_FINETUNING = 'llm_finetuning',
  EMBEDDING = 'embedding',
  RAG = 'rag',
  MULTIMODAL = 'multimodal',
  LOCAL_INFERENCE = 'local_inference',
}

export enum Precision {
  FP32 = 'fp32',
  FP16 = 'fp16',
  BF16 = 'bf16',
  INT8 = 'int8',
  INT4 = 'int4',
}

export interface Workload {
  id: string;
  type: WorkloadType;
  modelSize: number;
  batchSize: number;
  numGPUs: number;
  precision: Precision;
}

export interface WorkloadMemoryBreakdown {
  baseModelRAM: number;
  activationRAM: number;
  optimizerRAM: number;
  gradientRAM: number;
  dataRAM: number;
  overhead: number;
  total: number;
}

export interface EstimateResult {
  workloads: WorkloadMemoryBreakdown[];
  totalRAM: number;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const getPrecisionBytes = (precision: Precision): number => {
  const map: Record<Precision, number> = {
    [Precision.FP32]: 4,
    [Precision.FP16]: 2,
    [Precision.BF16]: 2,
    [Precision.INT8]: 1,
    [Precision.INT4]: 0.5,
  };
  return map[precision];
};

export const getWorkloadLabel = (type: WorkloadType): string => {
  const map: Record<WorkloadType, string> = {
    [WorkloadType.LLM_FINETUNING]: 'LLM Fine-tuning',
    [WorkloadType.EMBEDDING]: 'Embedding Pipeline',
    [WorkloadType.RAG]: 'RAG System',
    [WorkloadType.MULTIMODAL]: 'Multi-modal Pipeline',
  };
  return map[type];
};