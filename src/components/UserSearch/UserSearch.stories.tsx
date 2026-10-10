import UserSearch from "./UserSearch";
import { User } from "@/types/user";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

const defaultUser: User = {
  id: 12345,
  username: "@username",
  nick: 'Lin Елена',
  color: 1,
}

type Story = StoryObj<typeof meta>;
const meta: Meta<typeof UserSearch> = {
  component: UserSearch,
  tags: ['autodocs'],
  args: {
    status: 'success',
    users: [defaultUser, defaultUser, defaultUser],
    onSelectUser: fn(),
    onAddUser: fn(),
    onClose: fn()
  }
};

export default meta

export const Default: Story = {}

export const ShowAddUser: Story = {
  args: {
    showAddUserButton: true
  }
}

export const Loading: Story = {
  args: {
    status: 'pending'
  }
}

export const Error: Story = {
  args: {
    status: 'error'
  }
}
