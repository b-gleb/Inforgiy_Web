import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSearch from './UserSearch';
import type { User } from '@/types/user';

// --- Mocks for presentational/animation dependencies -----------------------
// We stub these out so tests exercise UserSearch's own logic (filtering,
// status branching, callback wiring) rather than the internals of the design
// system or the animation library.

vi.mock('framer-motion', () => ({
  motion: {
    // Strip animation props, just render a plain div
    div: ({ children, initial, animate, transition, ...rest }: any) => (
      <div {...rest}>{children}</div>
    ),
  },
}));

vi.mock('lucide-react', () => ({
  OctagonX: () => <svg data-testid="octagon-x-icon" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...rest }: any) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...rest }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  ),
}));

// --- Test data ---------------------------------------------------------

const makeUser = (id: number, nick: string, username: string): User => ({ id, nick, username } as User);

const users: User[] = [
  makeUser(1, 'Alice', '@alice'),
  makeUser(2, 'Bob', '@bob'),
  makeUser(3, 'alicia', '@alicia'),
  makeUser(4, 'Charlie', '@charlie'),
];

const noop = () => {};

const defaultProps = {
  status: 'success' as const,
  users,
  onSelectUser: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('UserSearch - filtering logic', () => {
  it('shows all users when the search query is empty', () => {
    render(<UserSearch {...defaultProps} onSelectUser={vi.fn()} onClose={noop} />);

    users.forEach((user) => {
      expect(screen.getByText(user.nick)).toBeInTheDocument();
    });
  });

  it('filters users whose nick contains the query (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<UserSearch {...defaultProps} onSelectUser={vi.fn()} onClose={noop} />);

    const input = screen.getByPlaceholderText('Поиск...');
    await user.type(input, 'ali');

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alicia')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('shows no user results when the query matches nothing', async () => {
    const user = userEvent.setup();
    render(<UserSearch {...defaultProps} onSelectUser={vi.fn()} onClose={noop} />);

    const input = screen.getByPlaceholderText('Поиск...');
    await user.type(input, 'zzz-not-a-match');

    users.forEach((u) => {
      expect(screen.queryByText(u.nick)).not.toBeInTheDocument();
    });
  });

  it('re-filters when the users prop changes', () => {
    const { rerender } = render(
      <UserSearch {...defaultProps} users={[makeUser(1, 'Alice', '@alice')]} onClose={noop} />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();

    rerender(
      <UserSearch {...defaultProps} users={[makeUser(2, 'Bob', '@bob')]} onClose={noop} />
    );
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});

describe('UserSearch - status handling', () => {
  it('renders an error message and no user list when status is "error"', () => {
    render(<UserSearch {...defaultProps} status="error" onClose={noop} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Ошибка загрузки!')).toBeInTheDocument();
    users.forEach((u) => {
      expect(screen.queryByText(u.nick)).not.toBeInTheDocument();
    });
  });

  it('renders skeleton placeholders and no user list when status is "pending"', () => {
    const { container } = render(
      <UserSearch {...defaultProps} status="pending" onClose={noop} />
    );

    // 22 skeleton placeholders as defined by the component's logic
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(22);

    users.forEach((u) => {
      expect(screen.queryByText(u.nick)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the filtered user list when status is "success"', () => {
    render(<UserSearch {...defaultProps} status="success" onClose={noop} />);

    users.forEach((u) => {
      expect(screen.getByText(u.nick)).toBeInTheDocument();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('UserSearch - user interactions / callbacks', () => {
  it('calls onSelectUser with the correct user when a result is clicked', async () => {
    const onSelectUser = vi.fn();
    const user = userEvent.setup();
    render(
      <UserSearch {...defaultProps} onSelectUser={onSelectUser} onClose={noop} />
    );

    await user.click(screen.getByText('Bob'));

    expect(onSelectUser).toHaveBeenCalledTimes(1);
    expect(onSelectUser).toHaveBeenCalledWith(users.find((u) => u.nick === 'Bob'));
  });

  it('calls onClose when the close button is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserSearch {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByText('✕'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates the input value as the user types', () => {
    render(<UserSearch {...defaultProps} onClose={noop} />);

    const input = screen.getByPlaceholderText('Поиск...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(input.value).toBe('test query');
  });
});

describe('UserSearch - "Add User" button visibility', () => {
  it('does not render the "Add User" button by default', () => {
    render(<UserSearch {...defaultProps} onClose={noop} />);

    expect(
      screen.queryByText('+ Добавить пользователя')
    ).not.toBeInTheDocument();
  });

  it('does not render the "Add User" button when showAddUserButton is false', () => {
    render(
      <UserSearch {...defaultProps} showAddUserButton={false} onClose={noop} />
    );

    expect(
      screen.queryByText('+ Добавить пользователя')
    ).not.toBeInTheDocument();
  });

  it('renders the "Add User" button when showAddUserButton is true', () => {
    render(
      <UserSearch {...defaultProps} showAddUserButton onClose={noop} />
    );

    expect(screen.getByText('+ Добавить пользователя')).toBeInTheDocument();
  });

  it('calls onAddUser when the "Add User" button is clicked', async () => {
    const onAddUser = vi.fn();
    const user = userEvent.setup();
    render(
      <UserSearch
        {...defaultProps}
        showAddUserButton
        onAddUser={onAddUser}
        onClose={noop}
      />
    );

    await user.click(screen.getByText('+ Добавить пользователя'));
    expect(onAddUser).toHaveBeenCalledTimes(1);
  });
});