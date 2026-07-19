import { HFModelFile, HFModelConfig } from './api';
import { QuantOption, Provider } from '../../constants/providers';

/**
 * Detect file format from filename
 */
export function detectFormat(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  
  if (lower.endsWith('.gguf')) return 'GGUF';
  if (lower.endsWith('.ggml')) return 'GGML';
  if (lower.endsWith('.safetensors')) return 'SAFETENSORS';
  if (lower.endsWith('.mlx')) return 'MLX';
  if (lower.includes('-awq')) return 'AWQ';
  if (lower.includes('-gptq')) return 'GPTQ';
  if (lower.includes('-nf4')) return 'NF4';
  if (lower.includes('-fp4')) return 'FP4';
  
  return null;
}

/**
 * Filter files compatible with provider
 */
export function filterCompatibleFiles(
  files: HFModelFile[],
  provider: Provider
): HFModelFile[] {
  return files.filter(file => {
    const format = detectFormat(file.path);
    return format && provider.supportedFormats.includes(format);
  });
}

/**
 * Parse quantization options from model files
 */
export function parseQuants(
  files: HFModelFile[],
  provider: Provider
): QuantOption[] {
  const compatibleFiles = filterCompatibleFiles(files, provider);
  const quantSet = new Map<string, QuantOption>();
  
  for (const file of compatibleFiles) {
    const fileName = file.path.split('/').pop() || file.path;
    const lowerName = fileName.toLowerCase();
    
    // Check each quant support for this provider
    for (const quantSupport of provider.quantizationSupport) {
      for (const quant of quantSupport.quants) {
        if (lowerName.includes(quant.suffix.toLowerCase())) {
          // Only add if not already present (keep largest file for each quant)
          if (!quantSet.has(quant.label) || file.size > (quantSet.get(quant.label)?.bytes || 0)) {
            quantSet.set(quant.label, {
              label: quant.label,
              bytes: quant.bytes,
              suffix: quant.suffix,
            });
          }
        }
      }
    }
  }
  
  return Array.from(quantSet.values());
}

/**
 * Extract model size for selected quantization
 */
export function extractModelSize(
  files: HFModelFile[],
  quant: string,
  provider: Provider
): number {
  const compatibleFiles = filterCompatibleFiles(files, provider);
  
  // If no quant selected, find base model
  if (!quant || quant === 'base') {
    const baseFile = compatibleFiles.find(f => {
      const lower = f.path.toLowerCase();
      return !lower.includes('q') && 
             !lower.includes('int') && 
             !lower.includes('awq') &&
             !lower.includes('gptq');
    });
    return baseFile ? baseFile.size / (1024 * 1024 * 1024) : 0;
  }
  
  // Find files matching the quant
  const quantFiles = compatibleFiles.filter(f => {
    const lower = f.path.toLowerCase();
    const quantLower = quant.toLowerCase();
    return lower.includes(quantLower) || lower.includes(quant);
  });
  
  if (quantFiles.length === 0) {
    // Fallback: return largest compatible file
    const largest = compatibleFiles.reduce((max, f) => 
      f.size > max.size ? f : max
    );
    return largest ? largest.size / (1024 * 1024 * 1024) : 0;
  }
  
  // Return largest file for this quant
  const largestFile = quantFiles.reduce((max, f) => 
    f.size > max.size ? f : max
  );
  
  return largestFile.size / (1024 * 1024 * 1024);
}

/**
 * Detect model architecture from config
 */
export function detectArchitecture(config: HFModelConfig): string {
  if (!config.architectures || config.architectures.length === 0) {
    return 'unknown';
  }
  
  const arch = config.architectures[0].toLowerCase();
  
  if (arch.includes('llama')) return 'llama';
  if (arch.includes('mistral')) return 'mistral';
  if (arch.includes('gpt2')) return 'gpt2';
  if (arch.includes('gptj')) return 'gptj';
  if (arch.includes('gpt-neox')) return 'gpt-neox';
  if (arch.includes('falcon')) return 'falcon';
  if (arch.includes('mpt')) return 'mpt';
  if (arch.includes('qwen')) return 'qwen';
  if (arch.includes('phi')) return 'phi';
  if (arch.includes('gemma')) return 'gemma';
  if (arch.includes('stablelm')) return 'stablelm';
  if (arch.includes('dbrx')) return 'dbrx';
  
  return 'unknown';
}

/**
 * Check if model is compatible with provider
 */
export function isModelCompatible(
  modelConfig: HFModelConfig,
  provider: Provider
): boolean {
  const arch = detectArchitecture(modelConfig);
  return provider.supportedArchitectures.includes(arch);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

/**
 * Format context length to human-readable string
 */
export function formatContextLength(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${Math.round(tokens / 1000)}K`;
  }
  return tokens.toString();
}
