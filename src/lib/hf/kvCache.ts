import { HFModelConfig } from './api';
import { Provider, KVQuant } from '../../constants/providers';

/**
 * Get bytes per parameter for quantization
 */
function getQuantBytes(quant: string): number {
  const quantMap: Record<string, number> = {
    'fp16': 2,
    'fp32': 4,
    'bf16': 2,
    'int8': 1,
    'int4': 0.5,
    'q8_0': 1,
    'q4_0': 0.5,
    'q4_1': 0.55,
    'q5_0': 0.65,
    'q5_1': 0.7,
    'q6_k': 0.85,
    'awq': 0.5,
    'gptq': 0.5,
    'nf4': 0.5,
    'fp4': 0.5,
  };
  
  return quantMap[quant.toLowerCase()] || 2; // Default to FP16
}

/**
 * Calculate KV cache size in GB
 * 
 * Formula: 2 × num_layers × num_kv_heads × head_dim × context_length × quant_bytes / 1e9
 * 
 * The factor of 2 is for both K and V caches
 */
export function calculateKVCache(
  config: HFModelConfig,
  contextLength: number,
  kvQuant: string,
  provider: Provider
): number {
  const numLayers = config.num_hidden_layers || 32;
  const numKvHeads = config.num_key_value_heads || config.num_attention_heads || 8;
  const headDim = config.head_dim || (config.hidden_size || 4096) / (config.num_attention_heads || 32);
  const quantBytes = getQuantBytes(kvQuant);
  
  // KV cache formula
  const kvCacheBytes = 2 * numLayers * numKvHeads * headDim * contextLength * quantBytes;
  
  // Convert to GB
  const kvCacheGB = kvCacheBytes / (1024 * 1024 * 1024);
  
  return kvCacheGB;
}

/**
 * Calculate activation memory in GB
 * 
 * Activation memory scales with context length and batch size
 * For inference, we use a simplified model
 */
export function calculateActivationRAM(
  config: HFModelConfig,
  contextLength: number,
  batchSize: number = 1,
  provider: Provider
): number {
  const hiddenSize = config.hidden_size || 4096;
  
  // Simplified activation formula
  // Activation ≈ context_length × hidden_size × batch_size × 2 (for grads) × 4 bytes (FP32)
  const activationBytes = contextLength * hiddenSize * batchSize * 2 * 4;
  
  // Convert to GB
  const activationGB = activationBytes / (1024 * 1024 * 1024);
  
  // For inference, activation is typically smaller
  // Use 0.1% of model size as a rough estimate
  const modelParams = estimateModelParams(config);
  const activationFromModel = modelParams * 0.001 * 4 / (1024 * 1024 * 1024);
  
  return Math.max(activationGB, activationFromModel);
}

/**
 * Estimate model parameters from config
 */
function estimateModelParams(config: HFModelConfig): number {
  const hiddenSize = config.hidden_size || 4096;
  const numLayers = config.num_hidden_layers || 32;
  const vocabSize = config.vocab_size || 32000;
  
  // Rough estimation: 4 * hidden_size * hidden_size * num_layers + vocab_size * hidden_size
  const params = 4 * hiddenSize * hiddenSize * numLayers + vocabSize * hiddenSize;
  
  return params / (1024 * 1024 * 1024); // Convert to billions
}

/**
 * Calculate complete RAM breakdown
 */
export interface RAMBreakdown {
  baseModel: number;      // GB
  kvCache: number;        // GB
  activation: number;     // GB
  overhead: number;       // GB
  total: number;          // GB
}

export function calculateRAMBreakdown(
  modelSizeGB: number,
  config: HFModelConfig,
  contextLength: number,
  kvCacheQuant: string,
  provider: Provider,
  batchSize: number = 1
): RAMBreakdown {
  // Calculate KV cache
  const kvCacheGB = calculateKVCache(config, contextLength, kvCacheQuant, provider);
  
  // Calculate activation
  const activationGB = calculateActivationRAM(config, contextLength, batchSize, provider);
  
  // Overhead (10% of total)
  const subtotal = modelSizeGB + kvCacheGB + activationGB;
  const overheadGB = subtotal * 0.1;
  
  const totalGB = subtotal + overheadGB;
  
  return {
    baseModel: modelSizeGB,
    kvCache: kvCacheGB,
    activation: activationGB,
    overhead: overheadGB,
    total: totalGB,
  };
}

/**
 * Get context length presets based on model max
 */
export function getContextLengthPresets(maxContext: number): { label: string; value: number }[] {
  const allPresets = [
    { label: '512', value: 512 },
    { label: '1K', value: 1024 },
    { label: '2K', value: 2048 },
    { label: '4K', value: 4096 },
    { label: '8K', value: 8192 },
    { label: '16K', value: 16384 },
    { label: '32K', value: 32768 },
    { label: '64K', value: 65536 },
    { label: '128K', value: 131072 },
    { label: '256K', value: 262144 },
    { label: '512K', value: 524288 },
    { label: '1M', value: 1048576 },
  ];
  
  // Filter presets that don't exceed max
  return allPresets.filter(preset => preset.value <= maxContext);
}

/**
 * Get default context length (practical value, not max)
 */
export function getDefaultContextLength(maxContext: number): number {
  if (maxContext <= 4096) return maxContext;
  if (maxContext <= 16384) return 4096;
  if (maxContext <= 65536) return 8192;
  return 8192; // Default to 8K for most models
}

/**
 * Get RAM impact for different context lengths
 */
export function calculateRAMImpact(
  modelSizeGB: number,
  config: HFModelConfig,
  kvCacheQuant: string,
  provider: Provider
): { contextLength: number; kvCacheGB: number; totalGB: number }[] {
  const presets = getContextLengthPresets(config.max_position_embeddings || 8192);
  
  return presets.map(preset => {
    const breakdown = calculateRAMBreakdown(
      modelSizeGB,
      config,
      preset.value,
      kvCacheQuant,
      provider
    );
    
    return {
      contextLength: preset.value,
      kvCacheGB: breakdown.kvCache,
      totalGB: breakdown.total,
    };
  });
}

/**
 * Get memory recommendation based on total RAM
 */
export function getMemoryRecommendation(totalGB: number): {
  type: 'suitable' | 'caution' | 'unsuitable';
  message: string;
} {
  if (totalGB < 8) {
    return {
      type: 'suitable',
      message: 'Suitable for most systems with 16GB+ RAM',
    };
  }
  if (totalGB < 32) {
    return {
      type: 'caution',
      message: 'Requires 32GB+ RAM system',
    };
  }
  if (totalGB < 64) {
    return {
      type: 'caution',
      message: 'Requires 64GB+ RAM system',
    };
  }
  return {
    type: 'unsuitable',
    message: 'Requires specialized hardware (128GB+ RAM)',
  };
}
