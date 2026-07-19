const HF_API_BASE = 'https://huggingface.co/api';

export interface HFModel {
  id: string;
  author: string;
  pipeline_tag: string;
  tags: string[];
  downloads: number;
  likes: number;
  lastModified: string;
}

export interface HFModelFile {
  path: string;
  size: number;
  type: string;
  oid?: string;
  lfs?: {
    oid: string;
    size: number;
    pointerSize: number;
  };
}

export interface HFModelConfig {
  architectures?: string[];
  hidden_size?: number;
  num_hidden_layers?: number;
  num_attention_heads?: number;
  num_key_value_heads?: number;
  head_dim?: number;
  max_position_embeddings?: number;
  vocab_size?: number;
  [key: string]: any;
}

export interface HFModelDetails {
  id: string;
  author: string;
  pipeline_tag: string;
  tags: string[];
  downloads: number;
  likes: number;
  lastModified: string;
  config?: HFModelConfig;
  siblings?: HFModelFile[];
}

/**
 * Search models on Hugging Face
 */
export async function searchModels(
  query: string,
  providerOrg?: string,
  limit: number = 20
): Promise<HFModel[]> {
  try {
    // If providerOrg is provided, search within that org
    const searchQuery = providerOrg ? `${providerOrg} ${query}` : query;
    const url = `${HF_API_BASE}/models?search=${encodeURIComponent(searchQuery)}&limit=${limit}&sort=downloads&direction=-1`;
    
    console.log('[HF API] Fetching:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HF API] Error response:', response.status, errorText);
      throw new Error(`HF API error: ${response.status} - ${errorText}`);
    }
    
    const models: HFModel[] = await response.json();
    console.log('[HF API] Got', models.length, 'models');
    
    // Filter to only include models from the provider org if specified
    if (providerOrg) {
      const filtered = models.filter(model => model.id.startsWith(providerOrg + '/'));
      console.log('[HF API] Filtered to', filtered.length, 'models from', providerOrg);
      return filtered;
    }
    
    return models;
  } catch (error) {
    console.error('[HF API] Error searching models:', error);
    throw error;
  }
}

/**
 * Get model details including config and files
 */
export async function getModelDetails(modelId: string): Promise<HFModelDetails> {
  try {
    const url = `${HF_API_BASE}/models/${modelId}`;
    console.log('[HF API] Fetching model details:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HF API] Model details error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please try again in a moment.');
      }
      if (response.status === 404) {
        throw new Error('Model not found. Please check the model ID.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(`HF API error: ${response.status} - ${errorText}`);
    }
    
    const model = await response.json();
    console.log('[HF API] Got model details:', modelId);
    return model;
  } catch (error) {
    console.error('[HF API] Error fetching model details:', error);
    throw error;
  }
}

/**
 * Get model files (siblings)
 */
export async function getModelFiles(modelId: string): Promise<HFModelFile[]> {
  try {
    const url = `${HF_API_BASE}/models/${modelId}/tree`;
    console.log('[HF API] Fetching model files:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HF API] Files error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication required for model files.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait.');
      }
      throw new Error(`HF API error: ${response.status}`);
    }
    
    const files = await response.json();
    console.log('[HF API] Got', files.length, 'files');
    return files;
  } catch (error) {
    console.error('[HF API] Error fetching model files:', error);
    throw error;
  }
}

/**
 * Get model configuration
 */
export async function getModelConfig(modelId: string): Promise<HFModelConfig> {
  try {
    const url = `${HF_API_BASE}/models/${modelId}/config`;
    console.log('[HF API] Fetching model config:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HF API] Config error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication required for model config.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait.');
      }
      throw new Error(`HF API error: ${response.status}`);
    }
    
    const config = await response.json();
    console.log('[HF API] Got model config');
    return config;
  } catch (error) {
    console.error('[HF API] Error fetching model config:', error);
    throw error;
  }
}

/**
 * Search models with provider filter
 */
export async function searchModelsByProvider(
  providerOrg: string,
  query?: string,
  limit: number = 20
): Promise<HFModel[]> {
  try {
    const searchQuery = query ? `${providerOrg} ${query}` : providerOrg;
    const url = `${HF_API_BASE}/models?search=${encodeURIComponent(searchQuery)}&limit=${limit}&sort=downloads&direction=-1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    
    const models: HFModel[] = await response.json();
    
    // Filter to only include models from the provider org
    return models.filter(model => model.id.startsWith(providerOrg + '/'));
  } catch (error) {
    console.error('Error searching models by provider:', error);
    throw error;
  }
}
