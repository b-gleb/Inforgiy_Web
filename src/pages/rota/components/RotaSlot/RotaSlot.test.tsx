import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { User as UserType } from '@/types/user';
import RotaSlot, { RotaSlotProps } from '@/pages/rota/components/RotaSlot/RotaSlot';


// framer-motion's AnimatePresence is purely an animation wrapper; for logic
// tests we only care that its children are rendered, so we strip the
// animation behaviour out entirely.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// lucide-react icons are presentational only. Replace with simple, queryable
// stand-ins so we can assert on their presence without depending on SVG internals.
vi.mock('lucide-react', () => ({
  User: () => <span data-testid="icon-user" />,
  Plus: () => <span data-testid="icon-plus" />,
}));

// UserBox is a separate, independently-tested component. We stub it so that
// RotaSlot's tests exercise RotaSlot's own logic (what props it computes and
// passes down, not how UserBox renders them internally).
vi.mock('@/pages/rota/components/UserBox/UserBox', () => ({
  default: vi.fn(({ userObj, canRemove, onRemove }) => (
    <div data-testid={`user-box-${userObj.id}`} data-rota-admin={String(canRemove)}>
      {userObj.name}
      <button aria-label={`remove-${userObj.id}`} onClick={onRemove}>
        remove
      </button>
    </div>
  )),
}));

// --- Test helpers ------------------------------------------------------------

const makeUser = (overrides: Partial<UserType> = {}): UserType =>
  ({
    id: 1,
    name: 'Jane Doe',
    color: 0,
    ...overrides,
  }) as UserType;

const baseProps: RotaSlotProps = {
  department: 'lns',
  label: '09:00-10:00',
  users: [],
  onRemove: vi.fn(),
  onAddSelf: vi.fn(),
  onOpenUserSearch: vi.fn(),
};

const setup = (overrides: Partial<RotaSlotProps> = {}) => {
  const props: RotaSlotProps = { ...baseProps, ...overrides };
  const { container } = render(<RotaSlot {...props} />);
  return { container, props };
};

describe('RotaSlot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('container styling', () => {
    it('marks the slot as empty and includes the department when there are no users', () => {
      const { container } = setup({ users: [], department: 'lns' });
      const root = container.firstElementChild as HTMLElement;

      expect(root.className).toContain('empty');
      expect(root.className).toContain('lns');
    });

    it('does not mark the slot as empty when at least one user is present', () => {
      const { container } = setup({ users: [makeUser()] });
      const root = container.firstElementChild as HTMLElement;

      expect(root.className).not.toContain('empty');
    });

    it('reflects a different department slug in the empty-state class', () => {
      const { container } = setup({ users: [], department: 'gp' });
      const root = container.firstElementChild as HTMLElement;

      expect(root.className).toContain('gp');
    });
  });

  describe('label rendering', () => {
    it('displays the provided label text', () => {
      setup({ label: '14:00-15:00' });
      expect(screen.getByText('14:00-15:00')).toBeInTheDocument();
    });
  });

  describe('secondary users display', () => {
    it('renders nothing extra when secondaryUsers is null', () => {
      const { container } = setup({ secondaryUsers: null });
      expect(container.querySelectorAll('[class*="color-"]').length).toBe(0);
    });

    it('renders nothing extra when secondaryUsers is an empty array', () => {
      const { container } = setup({ secondaryUsers: [] });
      expect(container.querySelectorAll('[class*="color-"]').length).toBe(0);
    });

    it('renders one indicator per secondary user, using their color', () => {
      const secondaryUsers = [
        makeUser({ id: 10, color: 2 }),
        makeUser({ id: 11, color: 3 }),
      ];
      const { container } = setup({ secondaryUsers });

      const indicators = container.querySelectorAll('[class*="color-"]');
      expect(indicators.length).toBe(2);
      expect(indicators[0].className).toContain('color-2');
      expect(indicators[1].className).toContain('color-3');
    });
  });

  describe('primary users rendering', () => {
    it('renders a UserBox for every user passed in', () => {
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 }), makeUser({ id: 3 })];
      setup({ users });

      users.forEach((user) => {
        expect(screen.getByTestId(`user-box-${user.id}`)).toBeInTheDocument();
      });
    });

    it('renders no UserBox when the users array is empty', () => {
      const { container } = setup({ users: [] });
      expect(container.querySelectorAll('[data-testid^="user-box-"]').length).toBe(0);
    });

    it('invokes onRemove independently for each user', () => {
      const onRemove = vi.fn();
      const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
      setup({ users, label: '08:00-09:00', onRemove });

      fireEvent.click(screen.getByLabelText('remove-1'));
      fireEvent.click(screen.getByLabelText('remove-2'));

      expect(onRemove).toHaveBeenNthCalledWith(1, 1, '08:00-09:00');
      expect(onRemove).toHaveBeenNthCalledWith(2, 2, '08:00-09:00');
    });
  });

  describe('assign-others button (canAddOthers)', () => {
    it('is not rendered when canAddOthers is false', () => {
      setup({ canAddOthers: false });
      expect(screen.queryByLabelText('Assign user')).not.toBeInTheDocument();
    });

    it('is not rendered by default (canAddOthers omitted)', () => {
      setup({});
      expect(screen.queryByLabelText('Assign user')).not.toBeInTheDocument();
    });

    it('is rendered when canAddOthers is true', () => {
      setup({ canAddOthers: true });
      expect(screen.getByLabelText('Assign user')).toBeInTheDocument();
    });

    it('calls onOpenUserSearch when clicked', () => {
      const onOpenUserSearch = vi.fn();
      setup({ canAddOthers: true, onOpenUserSearch });

      fireEvent.click(screen.getByLabelText('Assign user'));

      expect(onOpenUserSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('add-self button (canAddSelf)', () => {
    it('is not rendered when canAddSelf is false', () => {
      setup({ canAddSelf: false });
      expect(screen.queryByLabelText('Add yourself')).not.toBeInTheDocument();
    });

    it('is not rendered by default (canAddSelf omitted)', () => {
      setup({});
      expect(screen.queryByLabelText('Add yourself')).not.toBeInTheDocument();
    });

    it('is rendered when canAddSelf is true', () => {
      setup({ canAddSelf: true });
      expect(screen.getByLabelText('Add yourself')).toBeInTheDocument();
    });

    it('calls onAddSelf with the slot label when clicked', () => {
      const onAddSelf = vi.fn();
      setup({ canAddSelf: true, label: '16:00-17:00', onAddSelf });

      fireEvent.click(screen.getByLabelText('Add yourself'));

      expect(onAddSelf).toHaveBeenCalledTimes(1);
      expect(onAddSelf).toHaveBeenCalledWith('16:00-17:00');
    });
  });

  describe('button combinations', () => {
    it('renders both buttons when both permissions are granted', () => {
      setup({ canAddOthers: true, canAddSelf: true });
      expect(screen.getByLabelText('Assign user')).toBeInTheDocument();
      expect(screen.getByLabelText('Add yourself')).toBeInTheDocument();
    });

    it('renders neither button when both permissions are denied', () => {
      setup({ canAddOthers: false, canAddSelf: false });
      expect(screen.queryByLabelText('Assign user')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Add yourself')).not.toBeInTheDocument();
    });
  });
});