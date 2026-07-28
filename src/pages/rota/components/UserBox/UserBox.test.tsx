import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from "@testing-library/user-event";
import UserBox from './UserBox';
import type { ComponentProps } from 'react';

// framer-motion's AnimatePresence/motion.div add exit-animation timing and
// DOM behaviour that isn't part of this component's own logic. We stub them
// with plain passthrough elements so tests exercise UserBox's actual
// rendering decisions (props -> markup) rather than animation internals.
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children, className, ...rest }: any) => {
      // Strip framer-motion-only props (initial/animate/exit/transition) so
      // they don't leak onto the DOM node as unknown attributes.
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        ...domProps
      } = rest;
      return (
        <div className={className} {...domProps}>
          {children}
        </div>
      );
    },
  },
}));

const defaultProps: ComponentProps<typeof UserBox> = {
  userObj: {
    id: 123,
    username: "@username",
    nick: "Nick",
    color: 3
  },
  rotaAdmin: false,
  onRemove: vi.fn(),
};

describe("UserBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering user information", () => {
    it("displays the user's nickname", () => {
      render(<UserBox {...defaultProps} />);
      expect(screen.getByText(defaultProps.userObj.nick)).toBeInTheDocument();
    });

    it("reflects the user's color as part of the box styling", () => {
      render(<UserBox {...defaultProps} />);
      expect(screen.getByText(defaultProps.userObj.nick).parentElement).toHaveClass(`color-${defaultProps.userObj.color}`);
    });

    describe("remove from rota control visibility based on admin permissions", () => {
      it("does not render a remove button when the interracting user is not an admin", () => {
        render(<UserBox {...defaultProps} rotaAdmin={false} />)
        expect(screen.queryByRole("button", { name: "✕" })).not.toBeInTheDocument();
      });

      it("renders remove button when the interracting user is an admin", () => {
        render(<UserBox {...defaultProps} rotaAdmin={true} />)
        expect(screen.queryByRole("button", { name: "✕" })).toBeInTheDocument();
      });
    });

    describe("remove from rota interaction", () => {
      it("calls onRemove once when remove button is clicked", async () => {
        const user = userEvent.setup();
        render(<UserBox {...defaultProps} rotaAdmin={true} />)

        await user.click(screen.getByRole("button", { name: "✕" }));
        expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
      });

      it("never calls onRemove when rotaAdmin is false", () => {
        render(<UserBox {...defaultProps} rotaAdmin={false} />)
        expect(defaultProps.onRemove).not.toHaveBeenCalled();
      });

      it("should not call onRemove by clicking anywhere else", async () => {
        const user = userEvent.setup();
        render(<UserBox {...defaultProps} rotaAdmin={true} />)

        await user.click(screen.getByText(defaultProps.userObj.nick));
        expect(defaultProps.onRemove).not.toHaveBeenCalled();
      });
    });
  });
});
