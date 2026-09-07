import RotaSlot from "./RotaSlot";
import type { Meta, StoryObj } from "@storybook/react";
import { User } from '@/types/user';
import { fn } from "storybook/test";

const defaultUser: User = {
  id: 12345,
  username: '@username',
  nick: 'Lin Елена',
  color: 1,
}

type Story = StoryObj<typeof meta>;
const meta: Meta<typeof RotaSlot> = {
  component: RotaSlot,
  tags: ['autodocs'],
  args: {
    department: 'lns',
    label: '00:00-01:00',
    users: [defaultUser],
    canAddSelf: true,
    canAddOthers: true,
    canRemove: true,
    onRemove: fn(),
    onAddSelf: fn(),
    onOpenUserSearch: fn(),
  }
}
export default meta;

export const SingleUser: Story = {}

export const TwoUsers: Story = {
  args: {
    users: [defaultUser, {...defaultUser, color: 2, nick: 'Сплин Наталья'}]
  }
}

export const OnlyAddSelf: Story = {
  args: {
    canAddOthers: false,
    canRemove: false
  }
}

export const ReadOnly: Story = {
  args: {
    canAddSelf: false,
    canAddOthers: false,
    canRemove: false
  }
}

export const SecondaryRota: Story = {
  args: {
    secondaryUsers: [defaultUser, {...defaultUser, color: 3}]
  }
}

export const SecondaryRotaMainEmpty: Story = {
  args: {
    users: [],
    secondaryUsers: [defaultUser, {...defaultUser, color: 3}]
  }
}

export const Empty: Story = {
  args: {
    users: []
  }
}

export const EmptyGP: Story = {
  args: {
    department: 'gp',
    users: []
  }
}
