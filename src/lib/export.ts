import { Workload, WorkloadMemoryBreakdown } from '../types';
import { getWorkloadLabel } from '../types';
import { estimateWorkload } from './estimation';

export function generateCSVReport(workloads: Workload[], breakdowns: WorkloadMemoryBreakdown[]): string {
  const headers = ['Workload Type', 'Model Size (GB)', 'Precision', 'Batch Size', 'GPUs', 'Base Model RAM (GB)', 'Activation RAM (GB)', 'Optimizer RAM (GB)', 'Gradient RAM (GB)', 'Data RAM (GB)', 'Overhead (GB)', 'Total RAM (GB)'];

  const rows = workloads.map((w, idx) => {
    const breakdown = breakdowns[idx] || estimateWorkload(w);
    return [
      getWorkloadLabel(w.type),
      w.modelSize,
      w.precision,
      w.batchSize,
      w.numGPUs,
      breakdown.baseModelRAM.toFixed(2),
      breakdown.activationRAM.toFixed(2),
      breakdown.optimizerRAM.toFixed(2),
      breakdown.gradientRAM.toFixed(2),
      breakdown.dataRAM.toFixed(2),
      breakdown.overhead.toFixed(2),
      breakdown.total.toFixed(2),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function generateJSONReport(workloads: Workload[], breakdowns: WorkloadMemoryBreakdown[]): string {
  const report = {
    timestamp: new Date().toISOString(),
    totalWorkloads: workloads.length,
    totalRAMGB: breakdowns.reduce((sum, b) => sum + b.total, 0),
    workloads: workloads.map((w, idx) => ({
      type: getWorkloadLabel(w.type),
      modelSizeGB: w.modelSize,
      precision: w.precision,
      batchSize: w.batchSize,
      numGPUs: w.numGPUs,
      breakdown: breakdowns[idx],
    })),
  };

  return JSON.stringify(report, null, 2);
}