import React from 'react';
import { RAMBreakdown, getMemoryRecommendation } from '../../lib/hf/kvCache';
import { formatBytes } from '../../lib/hf/parsers';

interface RAMBreakdownProps {
  breakdown: RAMBreakdown;
  contextLength: number;
  kvCacheQuant: string;
}

export const RAMBreakdown: React.FC<RAMBreakdownProps> = ({
  breakdown,
  contextLength,
  kvCacheQuant,
}) => {
  const recommendation = getMemoryRecommendation(breakdown.total);

  const getRecommendationStyles = () => {
    switch (recommendation.type) {
      case 'suitable':
        return 'bg-accent/10 border-accent/20 text-accent';
      case 'caution':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'unsuitable':
        return 'bg-danger/10 border-danger/20 text-danger';
      default:
        return 'bg-accent/10 border-accent/20 text-accent';
    }
  };

  return (
    <div className="bg-surface-2 rounded-lg p-4 border border-neutral/10">
      <h3 className="text-white font-display font-semibold text-lg mb-4">
        RAM Estimate
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-neutral/10">
          <span className="text-neutral">Base Model</span>
          <span className="text-white font-data">{breakdown.baseModel.toFixed(1)} GB</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-neutral/10">
          <span className="text-neutral">
            KV Cache
            <span className="text-xs ml-1">({contextLength.toLocaleString()} ctx, {kvCacheQuant})</span>
          </span>
          <span className="text-white font-data">{breakdown.kvCache.toFixed(1)} GB</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-neutral/10">
          <span className="text-neutral">Activation</span>
          <span className="text-white font-data">{breakdown.activation.toFixed(1)} GB</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-neutral/10">
          <span className="text-neutral">Overhead (10%)</span>
          <span className="text-white font-data">{breakdown.overhead.toFixed(1)} GB</span>
        </div>

        <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-3 -mx-3">
          <span className="text-white font-medium">Total RAM Required</span>
          <span className="text-accent font-data text-xl font-bold">{breakdown.total.toFixed(1)} GB</span>
        </div>
      </div>

      {/* Memory Recommendation */}
      <div className={`mt-4 p-3 rounded-lg border ${getRecommendationStyles()}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">
            {recommendation.type === 'suitable' ? '✅' : 
             recommendation.type === 'caution' ? '⚠️' : '🚨'}
          </span>
          <div>
            <p className="font-medium text-sm">{recommendation.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
