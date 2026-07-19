import { WorkloadType } from '../types';

export type KVQuant = 'fp16' | 'fp32' | 'int8' | 'int4' | 'q8_0' | 'q4_0';

export interface QuantOption {
  label: string;
  bytes: number;
  suffix: string;
}

export interface QuantSupport {
  format: string;
  quants: QuantOption[];
}

export interface Provider {
  id: string;
  name: string;
  icon: string;
  url: string;
  hfOrg: string;
  supportedFormats: string[];
  supportedArchitectures: string[];
  defaultKVCacheQuant: KVQuant;
  supportsCustomKVCache: boolean;
  quantizationSupport: QuantSupport[];
}

export const PROVIDERS: Provider[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    icon: '🦙',
    url: 'https://ollama.ai',
    hfOrg: 'ollama',
    supportedFormats: ['GGUF'],
    supportedArchitectures: ['llama', 'mistral', 'codellama', 'llava', 'phi', 'gemma'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: true,
    quantizationSupport: [
      {
        format: 'GGUF',
        quants: [
          { label: 'Q2_K', bytes: 0.25, suffix: '-q2_k' },
          { label: 'Q3_K_S', bytes: 0.35, suffix: '-q3_k_s' },
          { label: 'Q3_K_M', bytes: 0.42, suffix: '-q3_k_m' },
          { label: 'Q3_K_L', bytes: 0.47, suffix: '-q3_k_l' },
          { label: 'Q4_0', bytes: 0.5, suffix: '-q4_0' },
          { label: 'Q4_1', bytes: 0.55, suffix: '-q4_1' },
          { label: 'Q4_K_S', bytes: 0.55, suffix: '-q4_k_s' },
          { label: 'Q4_K_M', bytes: 0.62, suffix: '-q4_k_m' },
          { label: 'Q5_0', bytes: 0.65, suffix: '-q5_0' },
          { label: 'Q5_1', bytes: 0.7, suffix: '-q5_1' },
          { label: 'Q5_K_S', bytes: 0.7, suffix: '-q5_k_s' },
          { label: 'Q5_K_M', bytes: 0.75, suffix: '-q5_k_m' },
          { label: 'Q6_K', bytes: 0.85, suffix: '-q6_k' },
          { label: 'Q8_0', bytes: 1.0, suffix: '-q8_0' },
          { label: 'FP16', bytes: 2.0, suffix: '-fp16' },
          { label: 'FP32', bytes: 4.0, suffix: '-fp32' },
        ],
      },
    ],
  },
  {
    id: 'llama.cpp',
    name: 'llama.cpp',
    icon: '🔥',
    url: 'https://github.com/ggerganov/llama.cpp',
    hfOrg: '',
    supportedFormats: ['GGUF'],
    supportedArchitectures: ['llama', 'mistral', 'codellama', 'llava', 'phi', 'gemma', 'qwen', 'stablelm', 'dbrx'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: true,
    quantizationSupport: [
      {
        format: 'GGUF',
        quants: [
          { label: 'Q2_K', bytes: 0.25, suffix: '-q2_k' },
          { label: 'Q3_K_S', bytes: 0.35, suffix: '-q3_k_s' },
          { label: 'Q3_K_M', bytes: 0.42, suffix: '-q3_k_m' },
          { label: 'Q3_K_L', bytes: 0.47, suffix: '-q3_k_l' },
          { label: 'Q4_0', bytes: 0.5, suffix: '-q4_0' },
          { label: 'Q4_1', bytes: 0.55, suffix: '-q4_1' },
          { label: 'Q4_K_S', bytes: 0.55, suffix: '-q4_k_s' },
          { label: 'Q4_K_M', bytes: 0.62, suffix: '-q4_k_m' },
          { label: 'Q5_0', bytes: 0.65, suffix: '-q5_0' },
          { label: 'Q5_1', bytes: 0.7, suffix: '-q5_1' },
          { label: 'Q5_K_S', bytes: 0.7, suffix: '-q5_k_s' },
          { label: 'Q5_K_M', bytes: 0.75, suffix: '-q5_k_m' },
          { label: 'Q6_K', bytes: 0.85, suffix: '-q6_k' },
          { label: 'Q8_0', bytes: 1.0, suffix: '-q8_0' },
          { label: 'FP16', bytes: 2.0, suffix: '-fp16' },
          { label: 'FP32', bytes: 4.0, suffix: '-fp32' },
        ],
      },
    ],
  },
  {
    id: 'mlx-lm',
    name: 'MLX-LM',
    icon: '🍎',
    url: 'https://github.com/ml-explore/mlx-examples',
    hfOrg: 'mlx-community',
    supportedFormats: ['MLX'],
    supportedArchitectures: ['llama', 'mistral', 'phi', 'gemma', 'stablelm'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: true,
    quantizationSupport: [
      {
        format: 'MLX',
        quants: [
          { label: 'Q4_0', bytes: 0.5, suffix: '-mlx-q4_0' },
          { label: 'Q4_1', bytes: 0.55, suffix: '-mlx-q4_1' },
          { label: 'Q5_0', bytes: 0.65, suffix: '-mlx-q5_0' },
          { label: 'Q5_1', bytes: 0.7, suffix: '-mlx-q5_1' },
          { label: 'Q6_K', bytes: 0.85, suffix: '-mlx-q6_k' },
          { label: 'Q8_0', bytes: 1.0, suffix: '-mlx-q8_0' },
          { label: 'FP16', bytes: 2.0, suffix: '-mlx-fp16' },
          { label: 'FP32', bytes: 4.0, suffix: '-mlx-fp32' },
        ],
      },
    ],
  },
  {
    id: 'vllm',
    name: 'vLLM',
    icon: '⚡',
    url: 'https://docs.vllm.ai',
    hfOrg: '',
    supportedFormats: ['SAFETENSORS', 'WEIGHTS'],
    supportedArchitectures: ['llama', 'mistral', 'gpt2', 'gptj', 'gpt-neox', 'falcon', 'mpt', 'qwen'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: true,
    quantizationSupport: [
      {
        format: 'SAFETENSORS',
        quants: [
          { label: 'AWQ (Int4)', bytes: 0.5, suffix: '-awq' },
          { label: 'GPTQ (Int4)', bytes: 0.5, suffix: '-gptq' },
          { label: 'FP16', bytes: 2.0, suffix: '-fp16' },
          { label: 'BF16', bytes: 2.0, suffix: '-bf16' },
          { label: 'FP32', bytes: 4.0, suffix: '-fp32' },
        ],
      },
    ],
  },
  {
    id: 'sglang',
    name: 'SGLang',
    icon: '🚀',
    url: 'https://sglang.readthedocs.io',
    hfOrg: '',
    supportedFormats: ['SAFETENSORS', 'WEIGHTS'],
    supportedArchitectures: ['llama', 'mistral', 'qwen', 'gpt2'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: true,
    quantizationSupport: [
      {
        format: 'SAFETENSORS',
        quants: [
          { label: 'GPTQ (Int4)', bytes: 0.5, suffix: '-gptq' },
          { label: 'FP16', bytes: 2.0, suffix: '-fp16' },
          { label: 'BF16', bytes: 2.0, suffix: '-bf16' },
          { label: 'FP32', bytes: 4.0, suffix: '-fp32' },
        ],
      },
    ],
  },
  {
    id: 'gpt4all',
    name: 'GPT4All',
    icon: '🐘',
    url: 'https://github.com/nomic-ai/gpt4all',
    hfOrg: 'nomic-ai',
    supportedFormats: ['GGML', 'GGUF'],
    supportedArchitectures: ['llama', 'mistral', 'gptj', 'gpt2'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: false,
    quantizationSupport: [
      {
        format: 'GGUF',
        quants: [
          { label: 'Q4_0', bytes: 0.5, suffix: '-q4_0' },
          { label: 'Q4_1', bytes: 0.55, suffix: '-q4_1' },
          { label: 'Q5_0', bytes: 0.65, suffix: '-q5_0' },
          { label: 'Q5_1', bytes: 0.7, suffix: '-q5_1' },
          { label: 'Q8_0', bytes: 1.0, suffix: '-q8_0' },
          { label: 'FP16', bytes: 2.0, suffix: '-fp16' },
        ],
      },
    ],
  },
  {
    id: 'unsloth',
    name: 'Unsloth Studio',
    icon: '🦥',
    url: 'https://unsloth.ai',
    hfOrg: 'unsloth',
    supportedFormats: ['SAFETENSORS'],
    supportedArchitectures: ['llama', 'mistral', 'gemma', 'qwen'],
    defaultKVCacheQuant: 'fp16',
    supportsCustomKVCache: true,
    quantizationSupport: [
      {
        format: 'SAFETENSORS',
        quants: [
          { label: 'NF4 (4-bit)', bytes: 0.5, suffix: '-nf4' },
          { label: 'FP4 (4-bit)', bytes: 0.5, suffix: '-fp4' },
          { label: 'FP16', bytes: 2.0, suffix: '-fp16' },
          { label: 'BF16', bytes: 2.0, suffix: '-bf16' },
        ],
      },
    ],
  },
];

export const PROVIDER_OPTIONS = PROVIDERS.map(p => ({
  value: p.id,
  label: `${p.icon} ${p.name}`,
}));
