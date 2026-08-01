import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import UserDuties from './UserDuties';

// Mock the Skeleton UI primitive so we can assert on it deterministically
// without depending on its internal markup.
vi.mock('@/components/ui/skeleton.jsx', () => ({
  Skeleton: (props: { className?: string }) => (
    <div data-testid="skeleton" className={props.className} />
  ),
}));

// Mock the lucide-react icon so we can reliably query for it.
vi.mock('lucide-react', () => ({
  OctagonX: (props: Record<string, unknown>) => (
    <svg data-testid="octagon-x-icon" {...props} />
  ),
}));

// Mock the duty-hours formatter so the component test is isolated from its
// implementation details; we only care that it's called and its output is
// rendered.
vi.mock('@/utils/userDutiesConverter.js', () => ({
  convertToDutyString: vi.fn((hours: number[]) => `Hours: ${hours.join(', ')}`),
}));

import { convertToDutyString } from '@/utils/userDutiesConverter.js';
import { ApiStatus } from '@/types/apiStatus';

// --- Fixtures

const mockDuties = [
  { date: '2024-01-15', hours: [9, 10, 11] },
  { date: '2024-01-16', hours: [14, 15] },
];

const expectedDateLabel = (dateStr: string) =>
  format(dateStr, 'dd.MM (EEEE)', { locale: ru });

// --- Tests

describe('UserDuties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('common rendering', () => {
    it.each<ApiStatus>(['pending', 'error', 'success'])('always renders heading regardless of status (%s)', (status) => {
      render(<UserDuties status={status} duties={[]} />);
      expect(screen.getByRole('heading', { name: 'Смены' })).toBeInTheDocument();
    });
  });

  describe('when status is "pending"', () => {
    it('renders two skeleton placeholders', () => {
      render(<UserDuties status="pending" duties={[]} />);
      expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
    });

    it('does not render the error alert', () => {
      render(<UserDuties status="pending" duties={[]} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not render duty entries or the empty-state message', () => {
      render(<UserDuties status="pending" duties={mockDuties} />);
      expect(screen.queryByText('Смен нет :(')).not.toBeInTheDocument();
      expect(convertToDutyString).not.toHaveBeenCalled();
    });
  });

  describe('when status is "error"', () => {
    it('renders an alert with the error message', () => {
      render(<UserDuties status="error" duties={[]} />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Ошибка загрузки!');
    });

    it('renders the error icon', () => {
      render(<UserDuties status="error" duties={[]} />);
      expect(screen.getByTestId('octagon-x-icon')).toBeInTheDocument();
    });

    it('does not render skeletons or duty entries', () => {
      render(<UserDuties status="error" duties={mockDuties} />);
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      expect(convertToDutyString).not.toHaveBeenCalled();
    });
  });

  describe('when status is "success" with duties', () => {
    it('renders one entry per duty', () => {
      render(<UserDuties status="success" duties={mockDuties} />);
      expect(convertToDutyString).toHaveBeenCalledTimes(mockDuties.length);
    });

    it('formats and displays the date for each duty', () => {
      render(<UserDuties status="success" duties={mockDuties} />);
      mockDuties.forEach((duty) => {
        expect(
          screen.getByText(`${expectedDateLabel(duty.date)}:`, { exact: false })
        ).toBeInTheDocument();
      });
    });

    it('passes each duty\'s hours to convertToDutyString and renders the result', () => {
      render(<UserDuties status="success" duties={mockDuties} />);
      mockDuties.forEach((duty) => {
        expect(convertToDutyString).toHaveBeenCalledWith(duty.hours);
        expect(
          screen.getByText(`Hours: ${duty.hours.join(', ')}`)
        ).toBeInTheDocument();
      });
    });

    it('does not render the skeleton, error alert, or empty-state message', () => {
      render(<UserDuties status="success" duties={mockDuties} />);
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByText('Смен нет :(')).not.toBeInTheDocument();
    });
  });

  describe('when status is "success" with no duties', () => {
    it('renders the empty-state message', () => {
      render(<UserDuties status="success" duties={[]} />);
      expect(screen.getByText('Смен нет :(')).toBeInTheDocument();
    });

    it('does not call convertToDutyString or render duty entries', () => {
      render(<UserDuties status="success" duties={[]} />);
      expect(convertToDutyString).not.toHaveBeenCalled();
    });

    it('does not render the skeleton or error alert', () => {
      render(<UserDuties status="success" duties={[]} />);
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
