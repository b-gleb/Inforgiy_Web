import MyDuties from "./MyDuties";
import type { Meta, StoryObj } from "@storybook/react";

type Story = StoryObj<typeof meta>;
const meta: Meta<typeof MyDuties> = {
  component: MyDuties,
  tags: ['autodocs'],
  args: {
    duties: [
      {
          "date": "2024-12-31T00:00:00.000Z",
          "hours": [16, 17, 18]
      },
      {
          "date": "2025-01-02T00:00:00.000Z",
          "hours": [4, 5]
      }
    ],
    status: 'success',
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-1/2">
        <Story />
      </div>
    ),
  ],
}
export default meta

export const Default: Story = {}

export const NoDuties: Story = {
  args: {
    duties: []
  }
}

export const Loading: Story = {
  args: {
    status: 'pending'
  }
}

export const Error: Story = {
  args: {
    status: 'error',
  }
}