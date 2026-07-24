import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './StatCard';

const defaultProps = {
  status: 'success',
  label: 'Week',
  sublabel: 'vs last week',
  value: 100,
};


describe('StatCard', () => {
  describe('Status states', () => {
    it('renders skeletons when pending', () => {
      const { container } = render(<StatCard {...defaultProps} status='pending' />);
      expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBe(2);
    });

    it('renders an error message when status is error', () => {
      render(<StatCard {...defaultProps} status="error" />);
      expect(screen.getByText('Ошибка')).toBeInTheDocument();
    });
  });


  describe('Rendering', () => {
    it('renders the label', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(
        screen.getByRole('heading', { level: 3, name: 'Week' })
      ).toBeInTheDocument();
    });

    it('renders the sublabel', () => {
      render(<StatCard {...defaultProps} previousValue={80} />);
      expect(screen.getByText('vs last week')).toBeInTheDocument();
    });
  });


  describe('Comparison values', () => {
    it('renders the value without comparison when previousValue is missing', () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.queryByText('vs last week')).not.toBeInTheDocument();
    });

    it('shows a positive change in green when value increased', () => {
      render(<StatCard {...defaultProps} previousValue={80} />);

      const change = screen.getByText('+20');
      expect(change).toBeInTheDocument();
      expect(change).toHaveClass('text-green-500');
    });

    it('shows a negative change in red when value decreased', () => {
      render(<StatCard {...defaultProps} previousValue={120} />);

      const change = screen.getByText('-20');
      expect(change).toBeInTheDocument();
      expect(change).toHaveClass('text-red-500');
    });

    it('shows no change when value is the same', () => {
      render(<StatCard {...defaultProps} previousValue={100} />);

      const change = screen.getByText('0');
      expect(change).toBeInTheDocument();
      expect(change).toHaveClass('text-muted-foreground')
    });
  });
});