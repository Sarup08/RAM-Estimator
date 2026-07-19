import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { HFModel } from '../../lib/hf/api';

interface ModelSearchProps {
  providerOrg: string;
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSearch: React.FC<ModelSearchProps> = ({
  providerOrg,
  value,
  onChange,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HFModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Search models when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { searchModelsByProvider } = await import('../../lib/hf/api');
        const models = await searchModelsByProvider(providerOrg, query, 10);
        setResults(models);
        setIsOpen(true);
      } catch (err) {
        setError('Failed to search models');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, providerOrg]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.model-search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setIsOpen(false);
    setQuery('');
  };

  const formatDownloads = (downloads: number): string => {
    if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`;
    if (downloads >= 1000) return `${(downloads / 1000).toFixed(0)}K`;
    return downloads.toString();
  };

  return (
    <div className="flex flex-col gap-1.5 model-search-container">
      <label className="text-sm font-medium text-neutral">
        Model
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        <input
          type="text"
          value={query || value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search models..."
          disabled={disabled}
          className="w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 pl-10 text-white placeholder:text-neutral/50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-neutral/20 bg-surface shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-neutral">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-4 text-center text-danger">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-4 text-center text-neutral">
              <p className="text-sm">No models found</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto py-1">
              {results.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-2 transition-colors duration-150 border-b border-neutral/10 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{model.id}</p>
                      <p className="text-xs text-neutral mt-1">
                        by {model.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral">
                        {formatDownloads(model.downloads)} downloads
                      </p>
                      <p className="text-xs text-neutral">
                        ❤️ {model.likes}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {value && !query && (
        <p className="text-xs text-neutral">
          Selected: {value}
        </p>
      )}
    </div>
  );
};
