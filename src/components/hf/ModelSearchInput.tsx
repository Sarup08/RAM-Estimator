import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { searchModels } from '../../lib/hf/api';

interface ModelSearchInputProps {
  providerOrg: string;
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

interface SearchResult {
  id: string;
  author: string;
  downloads: number;
  likes: number;
}

export const ModelSearchInput: React.FC<ModelSearchInputProps> = ({
  providerOrg,
  value,
  onChange,
  disabled = false,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const models = await searchModels(searchQuery, providerOrg);
      setResults(models.slice(0, 10)); // Limit to 10 results
      setIsOpen(true);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsSearching(false);
    }
  }, [providerOrg]);

  // Debounce handler
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value) {
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(value);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, debouncedSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSelect = (modelId: string) => {
    setQuery(modelId);
    onChange(modelId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-medium text-neutral">Model</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 && query.length >= 3) {
              setIsOpen(true);
            }
          }}
          placeholder="Type model ID (e.g., llama, qwen, mistral)..."
          disabled={disabled}
          className="w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 pl-10 pr-10 text-white placeholder:text-neutral/50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-50"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-2 border border-neutral/20 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-neutral">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-neutral text-sm">
              <p>No models found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={`px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-primary/20' : ''
                  }`}
                  onMouseDown={() => handleSelect(result.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{result.id}</p>
                      <p className="text-neutral text-xs mt-1">by {result.author}</p>
                    </div>
                    <div className="text-right text-xs text-neutral">
                      <p>⬇️ {result.downloads?.toLocaleString()}</p>
                      <p>❤️ {result.likes || 0}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {query && !isOpen && (
        <p className="text-xs text-neutral">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
};
