import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Input } from './Input';

beforeEach(cleanup);

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Model Size" type="number" value="7" onChange={() => {}} />);
    expect(screen.getByText('Model Size')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input type="text" value="" onChange={() => {}} />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input error="Required field" type="text" value="" onChange={() => {}} />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('does not render error when not provided', () => {
    render(<Input type="text" value="" onChange={() => {}} />);
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Input type="text" value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('passes additional props', () => {
    render(
      <Input type="text" value="" onChange={() => {}} className="custom" id="my-input" />
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.className).toContain('custom');
  });

  it('renders with correct type', () => {
    render(<Input type="number" value="" onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
  });

  it('renders with min/max', () => {
    render(<Input type="number" value="" onChange={() => {}} min={0} max={100} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });
});
