import React, { useState, useEffect } from 'react';
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
  Loader2,
  Search,
} from 'lucide-react';
import { useAppStore } from '../store';
import { getWorkloadLabel, WorkloadType } from '../types';
import { PRECISION_OPTIONS, WORKLOAD_TYPE_OPTIONS } from '../constants';
import { PROVIDERS, PROVIDER_OPTIONS, Provider } from '../constants/providers';
import { ProviderSelector } from '../components/hf/ProviderSelector';
import { ModelSearchInput } from '../components/hf/ModelSearchInput';
import { QuantSelector } from '../components/hf/QuantSelector';
import { ContextLengthInput } from '../components/hf/ContextLengthInput';
import { KVCacheConfig } from '../components/hf/KVCacheConfig';
import { RAMBreakdown } from '../components/hf/RAMBreakdown';
import {
  HFModelDetails,
  HFModelConfig,
  getModelDetails,
  getModelFiles,
  getModelConfig,
} from '../lib/hf/api';
import {
  filterCompatibleFiles,
  parseQuants,
  extractModelSize,
  formatContextLength,
} from '../lib/hf/parsers';
import {
  calculateRAMBreakdown,
  getDefaultContextLength,
  RAMBreakdown as RAMBreakdownType,
} from '../lib/hf/kvCache';

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
  
  // HF Integration State (only for Local Inference)
  const [hfSelectedProviderId, setHfSelectedProviderId] = useState<string>('');
  const [hfSelectedModelId, setHfSelectedModelId] = useState<string>('');
  const [hfModelDetails, setHfModelDetails] = useState<HFModelDetails | null>(null);
  const [hfModelConfig, setHfModelConfig] = useState<HFModelConfig | null>(null);
  const [hfAvailableQuants, setHfAvailableQuants] = useState<any[]>([]);
  const [hfModelSizeGB, setHfModelSizeGB] = useState<number>(0);
  const [hfSelectedQuant, setHfSelectedQuant] = useState<string>('');
  const [hfContextLength, setHfContextLength] = useState<number>(8192);
  const [hfKvCacheQuant, setHfKvCacheQuant] = useState<string>('fp16');
  const [hfIsLoading, setHfIsLoading] = useState(false);
  const [hfError, setHfError] = useState<string | null>(null);
  const [hfRamBreakdown, setHfRamBreakdown] = useState<RAMBreakdownType | null>(null);

  // Fetch HF model data when model is selected (only for Local Inference)
  useEffect(() => {
    if (workloadType !== WorkloadType.LOCAL_INFERENCE || !hfSelectedModelId || hfSelectedModelId.length < 5) {
      return;
    }

    const fetchModelData = async () => {
      setHfIsLoading(true);
      setHfError(null);
      try {
        const details = await getModelDetails(hfSelectedModelId);
        setHfModelDetails(details);

        // Fetch config
        try {
          const config = await getModelConfig(hfSelectedModelId);
          setHfModelConfig(config);
          const defaultCtx = getDefaultContextLength(config.max_position_embeddings || 8192);
          setHfContextLength(defaultCtx);
        } catch (err) {
          console.error('Failed to fetch config:', err);
        }

        // Fetch files and parse quants
        const selectedProvider = PROVIDERS.find(p => p.id === hfSelectedProviderId);
        if (selectedProvider) {
          const files = await getModelFiles(hfSelectedModelId);
          const compatibleFiles = filterCompatibleFiles(files, selectedProvider);
          const quants = parseQuants(compatibleFiles, selectedProvider);
          setHfAvailableQuants(quants);
          if (quants.length > 0) {
            setHfSelectedQuant(quants[0].label);
          }
        }
      } catch (err) {
        // Only show error after 5+ characters
        if (hfSelectedModelId.length >= 5) {
          setHfError('Model not found or failed to load');
        }
        console.error(err);
      } finally {
        setHfIsLoading(false);
      }
    };

    // Add a small delay to avoid fetching on every keystroke
    const timeoutId = setTimeout(() => {
      fetchModelData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [hfSelectedModelId, hfSelectedProviderId, workloadType]);

  // Update HF model size and RAM when quant or config changes
  useEffect(() => {
    if (workloadType !== WorkloadType.LOCAL_INFERENCE) {
      return;
    }
    if (!hfModelDetails || !hfSelectedProviderId || !hfSelectedQuant) {
      setHfModelSizeGB(0);
      setHfRamBreakdown(null);
      return;
    }

    try {
      const selectedProvider = PROVIDERS.find(p => p.id === hfSelectedProviderId);
      if (!selectedProvider) return;

      const size = extractModelSize(
        hfModelDetails.siblings || [],
        hfSelectedQuant,
        selectedProvider
      );
      setHfModelSizeGB(size);

      if (hfModelConfig) {
        const breakdown = calculateRAMBreakdown(
          size,
          hfModelConfig,
          hfContextLength,
          hfKvCacheQuant,
          selectedProvider
        );
        setHfRamBreakdown(breakdown);
      }
    } catch (err) {
      console.error('Failed to calculate RAM:', err);
    }
  }, [hfModelDetails, hfSelectedProviderId, hfSelectedQuant, hfModelConfig, hfContextLength, hfKvCacheQuant, workloadType]);

  // Filter workloads for this type
  const typeWorkloads = workloads?.filter(w => w.type === workloadType) || [];
  const typeBreakdowns = breakdowns?.filter((b, idx) => workloads?.[idx]?.type === workloadType) || [];
  const typeTotalRAM = typeBreakdowns.reduce((sum, b) => sum + b.total, 0);

  const handleAddWorkload = () => {
    // For Local Inference with HF data, use HF values
    if (workloadType === WorkloadType.LOCAL_INFERENCE && hfRamBreakdown && hfSelectedModelId) {
      const newWorkload = {
        id: crypto.randomUUID(),
        type: WorkloadType.LOCAL_INFERENCE,
        modelSize: hfModelSizeGB,
        batchSize: hfContextLength,
        numGPUs: 1,
        precision: hfSelectedQuant,
        hfModelId: hfSelectedModelId,
        hfProvider: hfSelectedProviderId,
        hfKVCacheQuant: hfKvCacheQuant,
      };
      actions.addWorkloadHF(newWorkload);
      return;
    }
    
    // Otherwise use regular form
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

              {/* HF Integration for Local Inference */}
              {workloadType === WorkloadType.LOCAL_INFERENCE && (
                <div className="space-y-6 mb-6">
                  {hfError && (
                    <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                      <span>⚠️</span>
                      <span>{hfError}</span>
                    </div>
                  )}

                  {/* Provider Selection */}
                  <ProviderSelector
                    value={hfSelectedProviderId}
                    onChange={setHfSelectedProviderId}
                  />

                  {/* Model Search */}
                  {hfSelectedProviderId && (
                    <ModelSearchInput
                      providerOrg={PROVIDERS.find(p => p.id === hfSelectedProviderId)?.hfOrg || ''}
                      value={hfSelectedModelId}
                      onChange={(modelId) => {
                        // Only update model ID, don't fetch details here
                        // Details will be fetched when model is selected from dropdown
                        if (modelId && modelId.length >= 5) {
                          setHfSelectedModelId(modelId);
                        } else if (!modelId) {
                          setHfSelectedModelId('');
                        }
                      }}
                      disabled={hfIsLoading}
                    />
                  )}

                  {/* Loading State */}
                  {hfIsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-neutral">Loading model details...</span>
                    </div>
                  )}

                  {/* Model Info */}
                  {hfModelDetails && hfModelConfig && !hfIsLoading && (
                    <div className="bg-surface-2 rounded-lg p-4 border border-neutral/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-display font-semibold text-lg">{hfModelDetails.id}</h3>
                          <p className="text-neutral text-sm mt-1">by {hfModelDetails.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral">{hfModelDetails.downloads?.toLocaleString() || 0} downloads</p>
                          <p className="text-xs text-neutral">❤️ {hfModelDetails.likes || 0}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-neutral">Parameters:</span>
                          <span className="text-white ml-2">{(hfModelConfig.hidden_size ? (4 * hfModelConfig.hidden_size * hfModelConfig.hidden_size * (hfModelConfig.num_hidden_layers || 32)) / 1e9 : 0).toFixed(1)}B</span>
                        </div>
                        <div>
                          <span className="text-neutral">Max Context:</span>
                          <span className="text-white ml-2">{formatContextLength(hfModelConfig.max_position_embeddings || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantization Selection */}
                  {hfAvailableQuants.length > 0 && !hfIsLoading && (
                    <QuantSelector
                      options={hfAvailableQuants}
                      value={hfSelectedQuant}
                      onChange={setHfSelectedQuant}
                    />
                  )}

                  {/* Context Length */}
                  {hfModelConfig && !hfIsLoading && (
                    <ContextLengthInput
                      maxContext={hfModelConfig.max_position_embeddings || 8192}
                      value={hfContextLength}
                      onChange={setHfContextLength}
                    />
                  )}

                  {/* KV Cache Configuration */}
                  {(() => {
                    const selectedProvider = PROVIDERS.find(p => p.id === hfSelectedProviderId);
                    return selectedProvider?.supportsCustomKVCache && !hfIsLoading ? (
                      <KVCacheConfig
                        value={hfKvCacheQuant as any}
                        onChange={setHfKvCacheQuant as any}
                      />
                    ) : null;
                  })()}

                  {/* RAM Breakdown */}
                  {hfRamBreakdown && (
                    <RAMBreakdown
                      breakdown={hfRamBreakdown}
                      contextLength={hfContextLength}
                      kvCacheQuant={hfKvCacheQuant}
                    />
                  )}
                </div>
              )}

              {/* Regular Form (for non-HF or when HF not configured) */}
              {workloadType !== WorkloadType.LOCAL_INFERENCE || !hfSelectedModelId ? (
                <>
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
                      label="Context Length"
                      type="number"
                      value={form.batchSize || ''}
                      onChange={(e) => handleFormChange('batchSize', e.target.value === '' ? undefined : parseInt(e.target.value))}
                      min={1}
                      placeholder="8192"
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
                </>
              ) : null}

              <Button
                onClick={handleAddWorkload}
                disabled={
                  workloadType === WorkloadType.LOCAL_INFERENCE
                    ? !hfSelectedModelId || !hfSelectedQuant || hfIsLoading
                    : !form.type || !form.modelSize || !form.batchSize || !form.numGPUs
                }
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
              <RamGauge currentGB={typeTotalRAM} label="Memory Usage" />
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
