import React from 'react';
import { HFModelConfig } from '../../lib/hf/api';
import { formatBytes, formatContextLength, detectArchitecture } from '../../lib/hf/parsers';

interface HFModelCardProps {
  modelId: string;
  author: string;
  config: HFModelConfig | null;
  modelSizeGB: number;
  downloads?: number;
  likes?: number;
}

export const HFModelCard: React.FC<HFModelCardProps> = ({
  modelId,
  author,
  config,
  modelSizeGB,
  downloads,
  likes,
}) => {
  const architecture = config ? detectArchitecture(config) : 'unknown';
  const maxContext = config?.max_position_embeddings || 0;
  const numLayers = config?.num_hidden_layers || 0;
  const hiddenSize = config?.hidden_size || 0;
  const params = estimateParams(config);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="bg-surface-2 rounded-lg p-4 border border-neutral/10">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-display font-semibold text-lg">{modelId}</h3>
          <p className="text-neutral text-sm mt-1">by {author}</p>
        </div>
        {downloads !== undefined && (
          <div className="text-right">
            <p className="text-xs text-neutral">{formatNumber(downloads)} downloads</p>
            {likes !== undefined && (
              <p className="text-xs text-neutral">❤️ {likes}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-neutral">Architecture:</span>
          <span className="text-white ml-2 capitalize">{architecture}</span>
        </div>
        <div>
          <span className="text-neutral">Parameters:</span>
          <span className="text-white ml-2">{params.toFixed(1)}B</span>
        </div>
        <div>
          <span className="text-neutral">Model Size:</span>
          <span className="text-accent ml-2 font-data">{modelSizeGB.toFixed(1)} GB</span>
        </div>
        <div>
          <span className="text-neutral">Max Context:</span>
          <span className="text-white ml-2">{formatContextLength(maxContext)}</span>
        </div>
        {numLayers > 0 && (
          <div>
            <span className="text-neutral">Layers:</span>
            <span className="text-white ml-2">{numLayers}</span>
          </div>
        )}
        {hiddenSize > 0 && (
          <div>
            <span className="text-neutral">Hidden Size:</span>
            <span className="text-white ml-2">{hiddenSize}</span>
          </div>
        )}
      </div>
    </div>
  );
};

function estimateParams(config: HFModelConfig | null): number {
  if (!config) return 0;
  
  const hiddenSize = config.hidden_size || 4096;
  const numLayers = config.num_hidden_layers || 32;
  const vocabSize = config.vocab_size || 32000;
  
  // Rough estimation: 4 * hidden_size * hidden_size * num_layers + vocab_size * hidden_size
  const params = 4 * hiddenSize * hiddenSize * numLayers + vocabSize * hiddenSize;
  
  return params / 1000000000; // Convert to billions
}
