import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RamGauge } from '../components/ui/RamGauge';
import {
  Calculator,
  Info,
  Home,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../store';
import { Workload, WorkloadType } from '../types';
import { PROVIDERS, PROVIDER_OPTIONS, Provider } from '../constants/providers';
import { ProviderSelector } from '../components/hf/ProviderSelector';
import { ModelSearch } from '../components/hf/ModelSearch';
import { QuantSelector } from '../components/hf/QuantSelector';
import { ContextLengthInput } from '../components/hf/ContextLengthInput';
import { KVCacheConfig } from '../components/hf/KVCacheConfig';
import { HFModelCard } from '../components/hf/HFModelCard';
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

export const HuggingFacePage: React.FC = () => {
  const { workloads, breakdowns, totalRAM, actions } = useAppStore();

  // State
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [modelDetails, setModelDetails] = useState<HFModelDetails | null>(null);
  const [modelConfig, setModelConfig] = useState<HFModelConfig | null>(null);
  const [availableQuants, setAvailableQuants] = useState<any[]>([]);
  const [modelSizeGB, setModelSizeGB] = useState<number>(0);
  const [selectedQuant, setSelectedQuant] = useState<string>('');
  const [contextLength, setContextLength] = useState<number>(8192);
  const [kvCacheQuant, setKvCacheQuant] = useState<string>('fp16');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ramBreakdown, setRamBreakdown] = useState<RAMBreakdownType | null>(null);

  const selectedProvider = PROVIDERS.find(p => p.id === selectedProviderId);

  // Fetch model details when model is selected
  useEffect(() => {
    if (!selectedModelId) {
      setModelDetails(null);
      setModelConfig(null);
      setAvailableQuants([]);
      setModelSizeGB(0);
      setSelectedQuant('');
      return;
    }

    const fetchModelData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const details = await getModelDetails(selectedModelId);
        setModelDetails(details);

        // Fetch config
        try {
          const config = await getModelConfig(selectedModelId);
          setModelConfig(config);
          
          // Set default context length
          const defaultCtx = getDefaultContextLength(config.max_position_embeddings || 8192);
          setContextLength(defaultCtx);
        } catch (err) {
          console.error('Failed to fetch config:', err);
        }

        // Fetch files and parse quants
        if (selectedProvider) {
          const files = await getModelFiles(selectedModelId);
          const compatibleFiles = filterCompatibleFiles(files, selectedProvider);
          const quants = parseQuants(compatibleFiles, selectedProvider);
          setAvailableQuants(quants);

          if (quants.length > 0) {
            setSelectedQuant(quants[0].label);
          }
        }
      } catch (err) {
        setError('Failed to fetch model details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModelData();
  }, [selectedModelId, selectedProviderId]);

  // Update model size and RAM when quant or config changes
  useEffect(() => {
    if (!modelDetails || !selectedProvider || !selectedQuant) {
      setModelSizeGB(0);
      setRamBreakdown(null);
      return;
    }

    try {
      // Extract model size
      const size = extractModelSize(
        modelDetails.siblings || [],
        selectedQuant,
        selectedProvider
      );
      setModelSizeGB(size);

      // Calculate RAM breakdown
      if (modelConfig) {
        const breakdown = calculateRAMBreakdown(
          size,
          modelConfig,
          contextLength,
          kvCacheQuant,
          selectedProvider
        );
        setRamBreakdown(breakdown);
      }
    } catch (err) {
      console.error('Failed to calculate RAM:', err);
    }
  }, [modelDetails, selectedProvider, selectedQuant, modelConfig, contextLength, kvCacheQuant]);

  const handleAddWorkload = () => {
    if (!ramBreakdown || !selectedProvider) return;

    const newWorkload: Workload = {
      id: crypto.randomUUID(),
      type: WorkloadType.LOCAL_INFERENCE,
      modelSize: modelSizeGB,
      batchSize: contextLength,
      numGPUs: 1,
      precision: selectedQuant,
      hfModelId: selectedModelId,
      hfProvider: selectedProvider.id,
      hfKVCacheQuant: kvCacheQuant,
    };

    actions.addWorkloadHF(newWorkload);
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
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Hugging Face Models
          </h2>
          <p className="text-neutral">
            Browse and estimate RAM for models from Hugging Face
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-display font-semibold text-white mb-6">
                Model Configuration
              </h2>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg mb-4 text-danger text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Provider Selection */}
                <ProviderSelector
                  value={selectedProviderId}
                  onChange={setSelectedProviderId}
                />

                {/* Model Search */}
                {selectedProviderId && (
                  <ModelSearch
                    providerOrg={selectedProvider.hfOrg}
                    value={selectedModelId}
                    onChange={setSelectedModelId}
                    disabled={isLoading}
                  />
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-neutral">Loading model details...</span>
                  </div>
                )}

                {/* Model Info Card */}
                {modelDetails && !isLoading && (
                  <HFModelCard
                    modelId={modelDetails.id}
                    author={modelDetails.author}
                    config={modelConfig}
                    modelSizeGB={modelSizeGB}
                    downloads={modelDetails.downloads}
                    likes={modelDetails.likes}
                  />
                )}

                {/* Quantization Selection */}
                {availableQuants.length > 0 && !isLoading && (
                  <QuantSelector
                    options={availableQuants}
                    value={selectedQuant}
                    onChange={setSelectedQuant}
                  />
                )}

                {/* Context Length */}
                {modelConfig && !isLoading && (
                  <ContextLengthInput
                    maxContext={modelConfig.max_position_embeddings || 8192}
                    value={contextLength}
                    onChange={setContextLength}
                  />
                )}

                {/* KV Cache Configuration */}
                {selectedProvider?.supportsCustomKVCache && !isLoading && (
                  <KVCacheConfig
                    value={kvCacheQuant as any}
                    onChange={setKvCacheQuant as any}
                  />
                )}
              </div>
            </Card>

            {/* RAM Breakdown */}
            {ramBreakdown && (
              <RAMBreakdown
                breakdown={ramBreakdown}
                contextLength={contextLength}
                kvCacheQuant={kvCacheQuant}
              />
            )}
          </div>

          {/* Right: Summary */}
          <div className="space-y-6">
            <Card variant="elevated" className="border-accent/30">
              <h2 className="text-lg font-display font-semibold text-white mb-2">
                Quick Stats
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral">
                  <span>Models Added</span>
                  <span className="text-white font-data">{workloads?.length || 0}</span>
                </div>
                <div className="flex justify-between text-neutral">
                  <span>Total RAM</span>
                  <span className="text-accent font-data">{totalRAM.toFixed(1)} GB</span>
                </div>
              </div>
              <RamGauge currentGB={totalRAM || 0} label="Total Memory Usage" className="mt-4" />
            </Card>

            <Card>
              <h2 className="text-lg font-display font-semibold text-white mb-4">
                How It Works
              </h2>
              <ol className="space-y-3 text-sm text-neutral list-decimal list-inside">
                <li>Select a provider (Ollama, llama.cpp, etc.)</li>
                <li>Search and select a model from Hugging Face</li>
                <li>Choose quantization (INT4, INT8, FP16, etc.)</li>
                <li>Set context length for KV cache</li>
                <li>View RAM estimate including KV cache</li>
                <li>Click "Add Workload" to include in total</li>
              </ol>
            </Card>

            <Card>
              <h2 className="text-lg font-display font-semibold text-white mb-4">
                Providers
              </h2>
              <ul className="space-y-2 text-sm text-neutral">
                {PROVIDERS.map(provider => (
                  <li key={provider.id} className="flex items-center gap-2">
                    <span>{provider.icon}</span>
                    <span>{provider.name}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Add Workload Button */}
        {ramBreakdown && (
          <div className="mt-8">
            <Button
              onClick={handleAddWorkload}
              disabled={!selectedModelId || !selectedQuant || isLoading}
              className="w-full py-4 text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add {modelDetails?.id || 'Model'} to Workloads
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
