import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RamGauge } from '../components/ui/RamGauge';
import { RamChart } from '../components/ui/RamChart';
import {
  Calculator,
  Info,
  BarChart3,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Zap,
  Server,
} from 'lucide-react';
import { useAppStore } from '../store';
import { getWorkloadLabel, WorkloadType } from '../types';
import { WORKLOAD_TYPE_OPTIONS } from '../constants';

export const HomePage: React.FC = () => {
  const {
    workloads,
    breakdowns,
    totalRAM,
  } = useAppStore();

  const workloadStats = WORKLOAD_TYPE_OPTIONS.map(option => {
    const typeWorkloads = workloads?.filter(w => w.type === option.value) || [];
    const typeBreakdowns = breakdowns?.filter((b, idx) => workloads?.[idx]?.type === option.value) || [];
    const typeTotalRAM = typeBreakdowns.reduce((sum, b) => sum + b.total, 0);
    return {
      ...option,
      count: typeWorkloads.length,
      totalRAM: typeTotalRAM,
    };
  });

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-neutral/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-display font-bold text-white">
              RAM Estimator AI
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral">
            <Info className="h-4 w-4" />
            <span>Estimate memory for your AI workloads</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Estimate RAM for Your AI Workloads
          </h2>
          <p className="text-lg text-neutral max-w-2xl mx-auto">
            Calculate the exact memory requirements for fine-tuning, inference, RAG systems, and more.
          </p>
        </div>

        {/* Workload Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {workloadStats.map((stat) => (
            <Link
              key={stat.value}
              to={`/workload/${stat.value}`}
              className="group"
            >
              <Card className="h-full hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    {stat.value === WorkloadType.LLM_FINETUNING && <Database className="h-6 w-6 text-primary" />}
                    {stat.value === WorkloadType.EMBEDDING && <Cpu className="h-6 w-6 text-primary" />}
                    {stat.value === WorkloadType.RAG && <Layers className="h-6 w-6 text-primary" />}
                    {stat.value === WorkloadType.MULTIMODAL && <Zap className="h-6 w-6 text-primary" />}
                    {stat.value === WorkloadType.LOCAL_INFERENCE && <Server className="h-6 w-6 text-primary" />}
                  </div>
                  {stat.count > 0 && (
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                      {stat.count} added
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  {stat.label}
                </h3>
                <p className="text-sm text-neutral mb-4">
                  {stat.value === WorkloadType.LLM_FINETUNING && 'Fine-tune large language models with custom datasets'}
                  {stat.value === WorkloadType.EMBEDDING && 'Generate vector embeddings for semantic search'}
                  {stat.value === WorkloadType.RAG && 'Build retrieval-augmented generation systems'}
                  {stat.value === WorkloadType.MULTIMODAL && 'Process text, images, and audio together'}
                  {stat.value === WorkloadType.LOCAL_INFERENCE && 'Run models locally with Ollama or LM Studio'}
                </p>
                {stat.totalRAM > 0 && (
                  <div className="pt-4 border-t border-neutral/10">
                    <p className="text-xs text-neutral mb-1">Total RAM Required</p>
                    <p className="text-2xl font-data font-bold text-accent">
                      {stat.totalRAM.toFixed(1)} GB
                    </p>
                  </div>
                )}
                <div className="mt-4 flex items-center text-primary group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium">Configure</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Summary Section */}
        {workloads && workloads.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-white">
                All Workloads Summary
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allBreakdowns = breakdowns || [];
                  const allTotal = allBreakdowns.reduce((sum, b) => sum + b.total, 0);
                  console.log('Total RAM:', allTotal);
                }}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Details
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workloadStats.filter(s => s.count > 0).map((stat) => {
                const typeWorkloads = workloads.filter(w => w.type === stat.value);
                const typeBreakdowns = breakdowns?.filter((b, idx) => workloads?.[idx]?.type === stat.value) || [];
                const typeTotalRAM = typeBreakdowns.reduce((sum, b) => sum + b.total, 0);
                
                return (
                  <Link
                    key={stat.value}
                    to={`/workload/${stat.value}`}
                    className="p-4 bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-neutral text-sm">{stat.label}</span>
                      <span className="text-accent font-data font-bold">{typeTotalRAM.toFixed(1)} GB</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral">
                      <span>{stat.count} workload{stat.count !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>Avg: {typeWorkloads.length > 0 ? (typeTotalRAM / typeWorkloads.length).toFixed(1) : 0} GB</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalRAM > 0 && (
              <div className="mt-6 pt-6 border-t border-neutral/10">
                <div className="flex items-center justify-between">
                  <span className="text-neutral font-medium">Grand Total RAM</span>
                  <span className="text-3xl font-data font-bold text-accent">{totalRAM.toFixed(1)} GB</span>
                </div>
                <RamGauge currentGB={totalRAM} maxGB={256} label="Total Memory Usage" className="mt-4" />
              </div>
            )}
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-display font-semibold text-white mb-3">How It Works</h3>
            <ul className="space-y-2 text-sm text-neutral">
              <li className="flex gap-2">
                <span className="text-primary">1.</span>
                <span>Select a workload type from the cards above</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">2.</span>
                <span>Configure precision, model size, batch size, and GPUs</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">3.</span>
                <span>Add workloads and view detailed RAM breakdown</span>
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-display font-semibold text-white mb-3">Precision Guide</h3>
            <div className="space-y-2 text-sm text-neutral">
              <div className="flex justify-between">
                <span>FP32 (Full Precision)</span>
                <span className="text-white">4 bytes/param</span>
              </div>
              <div className="flex justify-between">
                <span>FP16/BF16 (Mixed)</span>
                <span className="text-white">2 bytes/param</span>
              </div>
              <div className="flex justify-between">
                <span>INT8 (Quantized)</span>
                <span className="text-white">1 byte/param</span>
              </div>
              <div className="flex justify-between">
                <span>INT4 (High Compression)</span>
                <span className="text-white">0.5 bytes/param</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-display font-semibold text-white mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-neutral">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Add multiple workloads for combined estimate</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Use quantization to reduce memory by 50-75%</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Batch size scales linearly for training workloads</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};
