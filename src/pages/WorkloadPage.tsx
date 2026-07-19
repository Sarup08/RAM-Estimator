import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { RamGauge } from '../components/ui/RamGauge';
import { RamChart } from '../components/ui/RamChart';
import {
  Calculator,
  Plus,
  Trash2,
  Info,
  BarChart3,
  Download,
  ChevronDown,
  ChevronUp,
  Home,
} from 'lucide-react';
import { useAppStore } from '../store';
import { getWorkloadLabel, WorkloadType } from '../types';
import { PRECISION_OPTIONS, WORKLOAD_TYPE_OPTIONS } from '../constants';

interface WorkloadPageProps {
  workloadType: WorkloadType;
  title: string;
  description: string;
}

export const WorkloadPage: React.FC<WorkloadPageProps> = ({ workloadType, title, description }) => {
  const { id } = useParams<{ id: string }>();
  const {
    workloads,
    form,
    breakdowns,
    totalRAM,
    errors,
    actions,
  } = useAppStore();

  const [showCharts, setShowCharts] = useState(false);
  const [expandedWorkload, setExpandedWorkload] = useState<string | null>(null);

  // Filter workloads for this type
  const typeWorkloads = workloads?.filter(w => w.type === workloadType) || [];
  const typeBreakdowns = breakdowns?.filter((b, idx) => workloads?.[idx]?.type === workloadType) || [];
  const typeTotalRAM = typeBreakdowns.reduce((sum, b) => sum + b.total, 0);

  const handleAddWorkload = () => {
    actions.updateForm('type', workloadType);
    actions.addWorkload();
    actions.resetForm();
    actions.updateForm('type', '');
  };

  const handleRemoveWorkload = (id: string) => {
    actions.removeWorkload(id);
  };

  const handleFormChange = (field: string, value: string | number) => {
    actions.updateForm(field as any, value);
  };

  const handleExportCSV = () => {
    const headers = ['Workload Type', 'Model Size (GB)', 'Precision', 'Batch Size', 'GPUs', 'Total RAM (GB)'];
    const rows = typeWorkloads.map((w, idx) => {
      const breakdown = typeBreakdowns[idx] || { total: 0 };
      return [
        getWorkloadLabel(w.type),
        w.modelSize,
        w.precision,
        w.batchSize,
        w.numGPUs,
        breakdown.total.toFixed(2),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ram-estimate-${workloadType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-neutral/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-display font-bold text-white">
                RAM Estimator AI
              </h1>
            </div>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-200 shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 p-2 bg-surface-2 rounded-lg">
            {WORKLOAD_TYPE_OPTIONS.map((option) => (
              <Link
                key={option.value}
                to={`/workload/${option.value}`}
                className={`flex-1 min-w-[140px] px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-center ${
                  id === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-neutral hover:text-white hover:bg-surface-3'
                }`}
              >
                {option.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Workload Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-display font-semibold text-white mb-2">
                  {title}
                </h2>
                <p className="text-neutral text-sm">{description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Select
                  label="Precision"
                  options={PRECISION_OPTIONS}
                  value={form.precision}
                  onChange={(val) => handleFormChange('precision', val)}
                  error={errors.precision?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  label="Model Size (GB)"
                  type="number"
                  value={form.modelSize || ''}
                  onChange={(e) => handleFormChange('modelSize', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  min={0.1}
                  step={0.1}
                  placeholder="0.0"
                  error={errors.modelSize?.message}
                />
                <Input
                  label="Batch Size"
                  type="number"
                  value={form.batchSize || ''}
                  onChange={(e) => handleFormChange('batchSize', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  min={1}
                  placeholder="1"
                  error={errors.batchSize?.message}
                />
                <Input
                  label="Number of GPUs"
                  type="number"
                  value={form.numGPUs || ''}
                  onChange={(e) => handleFormChange('numGPUs', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  min={1}
                  placeholder="1"
                  error={errors.numGPUs?.message}
                />
              </div>

              <Button
                onClick={handleAddWorkload}
                disabled={!form.type || !form.modelSize || !form.batchSize || !form.numGPUs}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {title} Workload
              </Button>
            </Card>

            {/* Workloads List */}
            {typeWorkloads.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-semibold text-white">
                    {title} Workloads ({typeWorkloads.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportCSV}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCharts(!showCharts)}
                      className="flex items-center gap-2"
                    >
                      {showCharts ? <ChevronDown className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                      {showCharts ? 'Hide Charts' : 'Show Charts'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {typeWorkloads.map((w, idx) => {
                    const breakdown = typeBreakdowns[idx] || {
                      baseModelRAM: 0,
                      activationRAM: 0,
                      optimizerRAM: 0,
                      gradientRAM: 0,
                      dataRAM: 0,
                      overhead: 0,
                      total: 0,
                    };
                    const isExpanded = expandedWorkload === w.id;

                    return (
                      <div
                        key={w.id}
                        className="bg-surface-3 rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-2 transition-colors" onClick={() => setExpandedWorkload(isExpanded ? null : w.id)}>
                          <div className="flex items-center gap-3">
                            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="h-4 w-4 text-neutral" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{getWorkloadLabel(w.type)}</p>
                              <p className="text-sm text-neutral">
                                {w.modelSize}GB · {w.precision} · Batch {w.batchSize} · {w.numGPUs} GPU{w.numGPUs > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-accent font-data text-lg">{breakdown.total.toFixed(1)} GB</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveWorkload(w.id); }}
                              className="text-neutral hover:text-danger transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-surface-2 border-t border-neutral/10">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-neutral">Base Model RAM:</span>
                                <span className="text-white ml-2">{breakdown.baseModelRAM.toFixed(1)} GB</span>
                              </div>
                              <div>
                                <span className="text-neutral">Activation RAM:</span>
                                <span className="text-white ml-2">{breakdown.activationRAM.toFixed(1)} GB</span>
                              </div>
                              <div>
                                <span className="text-neutral">Optimizer RAM:</span>
                                <span className="text-white ml-2">{breakdown.optimizerRAM.toFixed(1)} GB</span>
                              </div>
                              <div>
                                <span className="text-neutral">Gradient RAM:</span>
                                <span className="text-white ml-2">{breakdown.gradientRAM.toFixed(1)} GB</span>
                              </div>
                              <div>
                                <span className="text-neutral">Data RAM:</span>
                                <span className="text-white ml-2">{breakdown.dataRAM.toFixed(1)} GB</span>
                              </div>
                              <div>
                                <span className="text-neutral">Overhead:</span>
                                <span className="text-white ml-2">{breakdown.overhead.toFixed(1)} GB</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Charts */}
            {showCharts && typeWorkloads.length > 0 && (
              <RamChart workloads={typeWorkloads} breakdowns={typeBreakdowns} totalRAM={typeTotalRAM} />
            )}
          </div>

          {/* Right: Total & Gauge */}
          <div className="space-y-6">
            <Card variant="elevated" className="border-accent/30">
              <h2 className="text-lg font-display font-semibold text-white mb-2">
                Total RAM Required
              </h2>
              <p className="text-4xl font-data font-bold text-accent mb-4">
                {typeTotalRAM.toFixed(1)} GB
              </p>
              <RamGauge currentGB={typeTotalRAM} maxGB={256} label="Memory Usage" />
            </Card>

            <Card>
              <h2 className="text-lg font-display font-semibold text-white mb-4">Quick Reference</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral">
                  <span>FP32 precision</span>
                  <span className="text-white">4 bytes/param</span>
                </div>
                <div className="flex justify-between text-neutral">
                  <span>FP16/BF16 precision</span>
                  <span className="text-white">2 bytes/param</span>
                </div>
                <div className="flex justify-between text-neutral">
                  <span>INT8 quantization</span>
                  <span className="text-white">1 byte/param</span>
                </div>
                <div className="flex justify-between text-neutral">
                  <span>INT4 quantization</span>
                  <span className="text-white">0.5 bytes/param</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-display font-semibold text-white mb-4">Tips</h2>
              <ul className="space-y-2 text-sm text-neutral">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Add multiple workloads for combined RAM estimate</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Use INT8/INT4 for quantized models to reduce memory</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Batch size affects memory linearly for fine-tuning</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
