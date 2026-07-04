import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RamGauge } from './RamGauge';

beforeEach(cleanup);

describe('RamGauge', () => {
  it('renders label and value', () => {
    render(<RamGauge currentGB={16} maxGB={256} label="System Memory" />);
    expect(screen.getByText('System Memory')).toBeInTheDocument();
    expect(screen.getByText('16.0 GB')).toBeInTheDocument();
  });

  it('renders with default maxGB', () => {
    const { container } = render(<RamGauge currentGB={16} label="Memory" />);
    expect(container.textContent).toContain('Max: 256 GB');
  });

  it('renders custom maxGB', () => {
    const { container } = render(<RamGauge currentGB={16} maxGB={512} label="Memory" />);
    expect(container.textContent).toContain('Max: 512 GB');
  });

  it('clamps percentage at 100%', () => {
    const { container } = render(<RamGauge currentGB={300} maxGB={256} label="Memory" />);
    const bars = container.querySelectorAll('div');
    const filledBar = Array.from(bars).find(b => b.style.width === '100%');
    expect(filledBar).toBeDefined();
  });

  it('renders warning color when >75%', () => {
    const { container } = render(<RamGauge currentGB={200} maxGB={256} label="Memory" />);
    const bars = container.querySelectorAll('div');
    const filledBar = Array.from(bars).find(b => b.style.width === '78.125%');
    expect(filledBar?.className).toContain('bg-yellow-500');
  });

  it('renders critical color when >90%', () => {
    const { container } = render(<RamGauge currentGB={240} maxGB={256} label="Memory" />);
    const bars = container.querySelectorAll('div');
    const filledBar = Array.from(bars).find(b => b.style.width === '93.75%');
    expect(filledBar?.className).toContain('bg-danger');
  });

  it('renders normal color when <75%', () => {
    const { container } = render(<RamGauge currentGB={50} maxGB={256} label="Memory" />);
    const bars = container.querySelectorAll('div');
    const filledBar = Array.from(bars).find(b => b.style.width === '19.53125%');
    expect(filledBar?.className).toContain('bg-accent');
  });

  it('renders 0 GB', () => {
    const { container } = render(<RamGauge currentGB={0} label="Memory" />);
    expect(container.textContent).toContain('0.0 GB');
  });
});
