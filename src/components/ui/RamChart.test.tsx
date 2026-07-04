import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RamChart } from './RamChart';
import { Workload, WorkloadType, Precision, WorkloadMemoryBreakdown } from '../../types';

const createWorkload = (overrides: Partial<Workload> = {}): Workload => ({
  id: 'test-id',
  type: WorkloadType.LLM_FINETUNING,
  modelSize: 7,
  batchSize: 4,
  numGPUs: 1,
  precision: Precision.FP16,
  ...overrides,
});

const createBreakdown = (overrides: Partial<WorkloadMemoryBreakdown> = {}): WorkloadMemoryBreakdown => ({
  baseModelRAM: 14,
  activationRAM: 4.2,
  optimizerRAM: 14,
  gradientRAM: 7,
  dataRAM: 1.4,
  overhead: 5.88,
  total: 46.48,
  ...overrides,
});

describe('RamChart', () => {
  beforeEach(() => cleanup());

  it('renders null when no workloads', () => {
    const { container } = render(
      <RamChart workloads={[]} breakdowns={[]} totalRAM={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders breakdown title', () => {
    const workloads = [createWorkload()];
    const breakdowns = [createBreakdown()];
    
    render(<RamChart workloads={workloads} breakdowns={breakdowns} totalRAM={46.48} />);
    expect(screen.getByText('RAM Allocation Breakdown')).toBeInTheDocument();
  });

  it('renders with single workload', () => {
    const workloads = [createWorkload()];
    const breakdowns = [createBreakdown()];
    
    const { container } = render(
      <RamChart workloads={workloads} breakdowns={breakdowns} totalRAM={46.48} />
    );
    
    // Component should render without errors
    expect(screen.getByText('RAM Allocation Breakdown')).toBeInTheDocument();
  });

  it('renders with multiple workloads', () => {
    const workloads = [
      createWorkload({ type: WorkloadType.LLM_FINETUNING }),
      createWorkload({ type: WorkloadType.RAG, modelSize: 3 }),
    ];
    const breakdowns = [
      createBreakdown(),
      createBreakdown({ baseModelRAM: 3, total: 12.5 }),
    ];
    
    render(
      <RamChart workloads={workloads} breakdowns={breakdowns} totalRAM={59} />
    );
    
    expect(screen.getByText('RAM Allocation Breakdown')).toBeInTheDocument();
  });

  it('renders chart containers', () => {
    const workloads = [createWorkload()];
    const breakdowns = [createBreakdown()];
    
    render(
      <RamChart workloads={workloads} breakdowns={breakdowns} totalRAM={46.48} />
    );
    
    // Check that the chart sections are present
    expect(screen.getByText('RAM Allocation Breakdown')).toBeInTheDocument();
    // The component renders 3 chart containers (Bar, Pie, Radar)
    const charts = document.querySelectorAll('[class*="h-64"], [class*="h-80"]');
    expect(charts.length).toBeGreaterThanOrEqual(2);
  });
});