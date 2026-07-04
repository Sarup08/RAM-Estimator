import { describe, it, expect } from 'vitest';
import { generateCSVReport, generateJSONReport } from './export';
import { Workload, WorkloadType, Precision } from '../types';
import { estimateAll } from './estimation';

const createTestWorkload = (overrides: Partial<Workload> = {}): Workload => ({
  id: 'test-id',
  type: WorkloadType.LLM_FINETUNING,
  modelSize: 7,
  batchSize: 4,
  numGPUs: 1,
  precision: Precision.FP16,
  ...overrides,
});

describe('generateCSVReport', () => {
  it('generates valid CSV with header and rows', () => {
    const workloads = [createTestWorkload()];
    const { breakdowns } = estimateAll(workloads);
    const csv = generateCSVReport(workloads, breakdowns);

    const lines = csv.split('\n');
    expect(lines.length).toBe(2); // header + 1 data row
    expect(lines[0]).toContain('Workload Type');
    expect(lines[1]).toContain('LLM Fine-tuning');
  });

  it('handles multiple workloads', () => {
    const workloads = [
      createTestWorkload({ modelSize: 7 }),
      createTestWorkload({ type: WorkloadType.RAG, modelSize: 3, batchSize: 2 }),
    ];
    const { breakdowns } = estimateAll(workloads);
    const csv = generateCSVReport(workloads, breakdowns);

    const lines = csv.split('\n');
    expect(lines.length).toBe(3); // header + 2 data rows
  });

  it('handles empty workloads', () => {
    const csv = generateCSVReport([], []);
    const lines = csv.split('\n');
    expect(lines.length).toBe(1); // only header
    expect(lines[0]).toContain('Workload Type');
  });

  it('includes all expected columns', () => {
    const workloads = [createTestWorkload()];
    const { breakdowns } = estimateAll(workloads);
    const csv = generateCSVReport(workloads, breakdowns);

    const header = csv.split('\n')[0];
    expect(header).toContain('Model Size (GB)');
    expect(header).toContain('Precision');
    expect(header).toContain('Batch Size');
    expect(header).toContain('Total RAM (GB)');
  });
});

describe('generateJSONReport', () => {
  it('generates valid JSON with all fields', () => {
    const workloads = [createTestWorkload()];
    const { breakdowns } = estimateAll(workloads);
    const json = generateJSONReport(workloads, breakdowns);

    const report = JSON.parse(json);
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('totalWorkloads');
    expect(report).toHaveProperty('totalRAMGB');
    expect(report).toHaveProperty('workloads');
    expect(report.totalWorkloads).toBe(1);
    expect(report.workloads[0]).toHaveProperty('type');
    expect(report.workloads[0]).toHaveProperty('modelSizeGB');
    expect(report.workloads[0]).toHaveProperty('breakdown');
  });

  it('handles empty workloads', () => {
    const json = generateJSONReport([], []);
    const report = JSON.parse(json);
    expect(report.totalWorkloads).toBe(0);
    expect(report.totalRAMGB).toBe(0);
    expect(report.workloads).toHaveLength(0);
  });

  it('generates parseable JSON', () => {
    const workloads = [createTestWorkload()];
    const { breakdowns } = estimateAll(workloads);
    const json = generateJSONReport(workloads, breakdowns);

    expect(() => JSON.parse(json)).not.toThrow();
  });
});