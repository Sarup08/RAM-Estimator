import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

beforeEach(cleanup);

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles click with user event', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders loading spinner', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('passes additional props', () => {
    render(
      <Button type="button" className="custom-class" id="test-btn" data-testid="my-btn">
        Test
      </Button>
    );
    const button = screen.getByTestId('my-btn');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('id', 'test-btn');
  });

  it('supports default variant and size', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });
});