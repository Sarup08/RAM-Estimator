import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Select } from './Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

beforeEach(() => {
  cleanup();
});

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Test Select" options={options} value="" onChange={() => {}} />);
    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Select options={options} value="" onChange={() => {}} />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={options} value="" onChange={() => {}} />);
    expect(screen.getAllByText('Option A')).toHaveLength(1);
    expect(screen.getAllByText('Option B')).toHaveLength(1);
    expect(screen.getAllByText('Option C')).toHaveLength(1);
  });

  it('renders with selected value', () => {
    render(<Select options={options} value="b" onChange={() => {}} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[0].value).toBe('b');
  });

  it('renders error message', () => {
    render(<Select options={options} value="" onChange={() => {}} error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('does not render error when not provided', () => {
    render(<Select options={options} value="" onChange={() => {}} />);
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={options} value="" onChange={handleChange} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'c' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('c');
  });

  it('renders custom className', () => {
    const { container } = render(
      <Select options={options} value="" onChange={() => {}} className="custom-select" />
    );
    const select = container.querySelector('select');
    expect(select?.className).toContain('custom-select');
  });
});
