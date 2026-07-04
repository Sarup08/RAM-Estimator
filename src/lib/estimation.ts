import { Workload, WorkloadMemoryBreakdown, getPrecisionBytes } from '../types';
import { WORKLOAD_FACTORS } from '../constants';

function calcModelRAMGB(modelSizeGB: number, precision: string): number {
  const bytesPerParam = getPrecisionBytes(precision as any);
  const clampedSize = Math.max(0, modelSizeGB);
  return clampedSize * bytesPerParam;
}

function calcLLMFinetuningRAM(workload: Workload): WorkloadMemoryBreakdown {
  const factors = WORKLOAD_FACTORS[workload.type];
  const modelRAM = calcModelRAMGB(workload.modelSize, workload.precision);
  const activationRAM = modelRAM * factors.activationPerBatch * workload.batchSize;
  const optimizerRAM = modelRAM * factors.optimizerMultiplier * workload.numGPUs;
  const gradientRAM = modelRAM * factors.gradientMultiplier * workload.numGPUs;
  const dataRAM = modelRAM * factors.dataMultiplier * workload.batchSize;
  const subtotal = modelRAM + activationRAM + optimizerRAM + gradientRAM + dataRAM;
  const overhead = subtotal * factors.overheadPct;
  const total = subtotal + overhead;

  return {
    baseModelRAM: modelRAM,
    activationRAM,
    optimizerRAM,
    gradientRAM,
    dataRAM,
    overhead,
    total,
  };
}

function calcEmbeddingRAM(workload: Workload): WorkloadMemoryBreakdown {
  const factors = WORKLOAD_FACTORS[workload.type];
  const modelRAM = calcModelRAMGB(workload.modelSize, workload.precision);
  const activationRAM = modelRAM * factors.activationPerBatch * workload.batchSize;
  const dataRAM = modelRAM * factors.dataMultiplier * workload.batchSize;
  const overhead = (modelRAM + activationRAM + dataRAM) * factors.overheadPct;
  const total = modelRAM + activationRAM + dataRAM + overhead;

  return {
    baseModelRAM: modelRAM,
    activationRAM,
    optimizerRAM: 0,
    gradientRAM: 0,
    dataRAM,
    overhead,
    total,
  };
}

function calcRAGRAM(workload: Workload): WorkloadMemoryBreakdown {
  const factors = WORKLOAD_FACTORS[workload.type];
  const modelRAM = calcModelRAMGB(workload.modelSize, workload.precision);
  const activationRAM = modelRAM * factors.activationPerBatch * workload.batchSize;
  const dataRAM = modelRAM * factors.dataMultiplier * workload.batchSize;
  const overhead = (modelRAM + activationRAM + dataRAM) * factors.overheadPct;
  const total = modelRAM + activationRAM + dataRAM + overhead;

  return {
    baseModelRAM: modelRAM,
    activationRAM,
    optimizerRAM: 0,
    gradientRAM: 0,
    dataRAM,
    overhead,
    total,
  };
}

function calcMultimodalRAM(workload: Workload): WorkloadMemoryBreakdown {
  const factors = WORKLOAD_FACTORS[workload.type];
  const modelRAM = calcModelRAMGB(workload.modelSize, workload.precision);
  const activationRAM = modelRAM * factors.activationPerBatch * workload.batchSize;
  const optimizerRAM = modelRAM * factors.optimizerMultiplier * workload.numGPUs;
  const gradientRAM = modelRAM * factors.gradientMultiplier * workload.numGPUs;
  const dataRAM = modelRAM * factors.dataMultiplier;
  const subtotal = modelRAM + activationRAM + optimizerRAM + gradientRAM + dataRAM;
  const overhead = subtotal * factors.overheadPct;
  const total = subtotal + overhead;

  return {
    baseModelRAM: modelRAM,
    activationRAM,
    optimizerRAM,
    gradientRAM,
    dataRAM,
    overhead,
    total,
  };
}

export const estimateWorkload = (workload: Workload): WorkloadMemoryBreakdown => {
  const typeMap = {
    llm_finetuning: calcLLMFinetuningRAM,
    embedding: calcEmbeddingRAM,
    rag: calcRAGRAM,
    multimodal: calcMultimodalRAM,
  };
  return typeMap[workload.type](workload);
};

export const estimateAll = (workloads: Workload[]): { breakdowns: WorkloadMemoryBreakdown[]; totalRAM: number } => {
  const breakdowns = workloads.map(estimateWorkload);
  const totalRAM = breakdowns.reduce((sum, b) => sum + b.total, 0);
  return { breakdowns, totalRAM };
};

export const getEstimateSummary = (workload: Workload): string => {
  const breakdown = estimateWorkload(workload);
  const precisionMultiplier = getPrecisionBytes(workload.precision as any);
  return `${workload.modelSize}GB × ${precisionMultiplier}bytes = ${breakdown.baseModelRAM.toFixed(1)}GB base`;
};