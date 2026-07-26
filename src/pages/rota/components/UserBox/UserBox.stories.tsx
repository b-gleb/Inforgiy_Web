import UserBox from "./UserBox";
import type { Meta, StoryObj } from "@storybook/react";
import { User } from "@/types/user";
import { fn } from "storybook/test";

const defaultUser: User = {
  id: 12345,
  username: '@username',
  nick: 'Lin Елена',
  color: 1,
}

type Story = StoryObj<typeof meta>;
const meta: Meta<typeof UserBox> = {
  component: UserBox,
  tags: ['autodocs'],
  args: {
    userObj: defaultUser,
    rotaAdmin: true,
    onRemove: fn(),
  },
  decorators: [
    (Story) => (
      <div className="usernames-container">
        <Story />
      </div>
    )
  ]
}
export default meta;


export const Admin: Story = {}

export const NotAnAdmin: Story = {
  args: {
    rotaAdmin: false
  }
}

export const UserIsRemoved: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: undefined,
    },
  },
};

export const color0: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 0,
    },
  },
};

export const color1: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 1,
    },
  },
};

export const color2: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 2,
    },
  },
};

export const color3: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 3,
    },
  },
};

export const color4: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 4,
    },
  },
};

export const color5: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 5,
    },
  },
};

export const color6: Story = {
  args: {
    userObj: {
      ...defaultUser,
      color: 6,
    },
  },
};