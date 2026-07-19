import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { searchModels } from '../../lib/hf/api';

interface ModelSearchInputProps {
  providerOrg: string;
  value: string;
  onChange: (modelId: string) => void;
  onSelect?: (modelId: string) => void;
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
  onSelect,
  disabled = false,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search - only search after 3+ characters
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    console.log('[ModelSearch] Searching for:', searchQuery, 'with org:', providerOrg);
    
    if (!searchQuery || searchQuery.length < 3) {
      console.log('[ModelSearch] Query too short, clearing results');
      setResults([]);
      // Don't close if user is actively typing
      if (searchQuery.length === 0) {
        setIsOpen(false);
      }
      setIsSearching(false);
      return;
    }

    console.log('[ModelSearch] Starting search...');
    setIsSearching(true);
    // Keep dropdown open while searching
    setIsOpen(true);
    try {
      const models = await searchModels(searchQuery, providerOrg);
      console.log('[ModelSearch] Got results:', models.length);
      setResults(models.slice(0, 8)); // Limit to 8 results
    } catch (err) {
      console.error('[ModelSearch] Search failed:', err);
      // Only show error after 5+ characters
      if (searchQuery.length >= 5) {
        setResults([]);
        // Keep dropdown open to show error message
      }
    } finally {
      console.log('[ModelSearch] Search complete');
      setIsSearching(false);
    }
  }, [providerOrg]);

  // Debounce handler
  useEffect(() => {
    console.log('[ModelSearch] useEffect triggered, value:', value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value && value.length >= 3) {
      console.log('[ModelSearch] Setting timeout for debounced search');
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(value);
      }, 300);
    } else if (value && value.length > 0) {
      console.log('[ModelSearch] Value too short, waiting...');
    } else {
      console.log('[ModelSearch] Empty value, clearing');
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
    if (onSelect) {
      onSelect(modelId);
    }
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
            // Open dropdown when focused, even if no results yet
            if (query.length >= 3) {
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
        <div 
          className="absolute z-50 w-full mt-1 bg-surface-2 border border-neutral/20 rounded-lg shadow-lg overflow-hidden"
          style={{
            maxHeight: '240px',
            top: '100%',
            left: 0,
            right: 0,
          }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-neutral text-xs">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 text-center text-neutral text-xs">
                <p>No models found</p>
              </div>
            ) : (
              <ul className="py-1">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={`px-3 py-2 hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-between ${
                    index === selectedIndex ? 'bg-primary/20' : ''
                  }`}
                  onMouseDown={() => handleSelect(result.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-xs truncate">{result.id}</p>
                    <p className="text-neutral text-[10px] mt-0.5">by {result.author}</p>
                  </div>
                  <div className="text-right text-[10px] text-neutral ml-3 flex-shrink-0">
                    <p>⬇️ {result.downloads?.toLocaleString()}</p>
                    <p>❤️ {result.likes || 0}</p>
                  </div>
                </li>
              ))} 
            </ul>
            )}
          </div>
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
