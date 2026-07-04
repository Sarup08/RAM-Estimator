import { describe, it, expect } from 'vitest';
import { estimateWorkload, estimateAll } from './estimation';
import { Workload, WorkloadType, Precision } from '../types';

const createWorkload = (overrides: Partial<Workload> = {}): Workload => ({
  id: 'test-id',
  type: WorkloadType.LLM_FINETUNING,
  modelSize: 7,
  batchSize: 4,
  numGPUs: 1,
  precision: Precision.FP16,
  ...overrides,
});

describe('estimateWorkload', () => {
  it('calculates FP16 fine-tuning RAM correctly', () => {
    const workload = createWorkload();
    const result = estimateWorkload(workload);

    // 7GB model × 2 bytes/param = 14GB base
    expect(result.baseModelRAM).toBeCloseTo(14.0, 1);
    // Total should be > base (activation + optimizer + gradient + data + overhead)
    expect(result.total).toBeGreaterThan(14);
  });

  it('handles zero model size gracefully', () => {
    const workload = createWorkload({ modelSize: 0 });
    const result = estimateWorkload(workload);
    expect(result.baseModelRAM).toBe(0);
    expect(result.total).toBeCloseTo(0, 1);
  });

  it('handles negative model size as zero', () => {
    const workload = createWorkload({ modelSize: -1 });
    const result = estimateWorkload(workload);
    expect(result.baseModelRAM).toBe(0);
  });

  it('fp32 uses 4x memory of fp16', () => {
    const fp16 = createWorkload({ precision: Precision.FP16 });
    const fp32 = createWorkload({ precision: Precision.FP32 });

    const result16 = estimateWorkload(fp16);
    const result32 = estimateWorkload(fp32);

    // Base RAM should be exactly 2x
    expect(result32.baseModelRAM).toBeCloseTo(result16.baseModelRAM * 2, 1);
  });

  it('embedding pipeline has no optimizer or gradient RAM', () => {
    const workload = createWorkload({ type: WorkloadType.EMBEDDING });
    const result = estimateWorkload(workload);

    expect(result.optimizerRAM).toBe(0);
    expect(result.gradientRAM).toBe(0);
    expect(result.baseModelRAM).toBeGreaterThan(0);
  });

  it('rag system has no optimizer or gradient RAM', () => {
    const workload = createWorkload({ type: WorkloadType.RAG });
    const result = estimateWorkload(workload);

    expect(result.optimizerRAM).toBe(0);
    expect(result.gradientRAM).toBe(0);
  });

  it('multimodal pipeline has all components', () => {
    const workload = createWorkload({ type: WorkloadType.MULTIMODAL });
    const result = estimateWorkload(workload);

    expect(result.baseModelRAM).toBeGreaterThan(0);
    expect(result.activationRAM).toBeGreaterThan(0);
    expect(result.optimizerRAM).toBeGreaterThan(0);
    expect(result.gradientRAM).toBeGreaterThan(0);
    expect(result.dataRAM).toBeGreaterThan(0);
    expect(result.overhead).toBeGreaterThan(0);
  });

  it('total equals sum of components', () => {
    const workload = createWorkload();
    const result = estimateWorkload(workload);

    const sum =
      result.baseModelRAM +
      result.activationRAM +
      result.optimizerRAM +
      result.gradientRAM +
      result.dataRAM +
      result.overhead;

    expect(result.total).toBeCloseTo(sum, 5);
  });

  it('handles large model size (2000GB)', () => {
    const workload = createWorkload({ modelSize: 2000 });
    const result = estimateWorkload(workload);
    expect(result.baseModelRAM).toBeCloseTo(4000.0, 1); // 2000 × 2 bytes
    expect(result.total).toBeGreaterThan(4000);
  });

  it('batch size affects memory linearly for fine-tuning', () => {
    const lowBatch = createWorkload({ batchSize: 1 });
    const highBatch = createWorkload({ batchSize: 8 });

    const resultLow = estimateWorkload(lowBatch);
    const resultHigh = estimateWorkload(highBatch);

    // Higher batch should have higher total
    expect(resultHigh.total).toBeGreaterThan(resultLow.total);
  });

  it('INT8 uses half the memory of FP16', () => {
    const fp16 = createWorkload({ precision: Precision.FP16 });
    const int8 = createWorkload({ precision: Precision.INT8 });

    const result16 = estimateWorkload(fp16);
    const result8 = estimateWorkload(int8);

    expect(result8.baseModelRAM).toBeCloseTo(result16.baseModelRAM * 0.5, 1);
  });

  it('INT4 uses quarter the memory of FP16', () => {
    const fp16 = createWorkload({ precision: Precision.FP16 });
    const int4 = createWorkload({ precision: Precision.INT4 });

    const result16 = estimateWorkload(fp16);
    const result4 = estimateWorkload(int4);

    expect(result4.baseModelRAM).toBeCloseTo(result16.baseModelRAM * 0.25, 1);
  });
});

describe('estimateAll', () => {
  it('calculates total RAM for multiple workloads', () => {
    const workloads = [
      createWorkload({ type: WorkloadType.LLM_FINETUNING, modelSize: 7 }),
      createWorkload({ type: WorkloadType.RAG, modelSize: 3, batchSize: 2 }),
    ];

    const result = estimateAll(workloads);
    expect(result.breakdowns).toHaveLength(2);
    expect(result.totalRAM).toBeGreaterThan(0);
    expect(result.totalRAM).toBeCloseTo(
      result.breakdowns.reduce((sum, b) => sum + b.total, 0),
      1
    );
  });

  it('handles empty workloads array', () => {
    const result = estimateAll([]);
    expect(result.breakdowns).toHaveLength(0);
    expect(result.totalRAM).toBe(0);
  });

  it('handles single workload', () => {
    const workloads = [createWorkload()];
    const result = estimateAll(workloads);
    expect(result.breakdowns).toHaveLength(1);
    expect(result.totalRAM).toBeCloseTo(result.breakdowns[0].total, 1);
  });
});