import type { Meta, StoryObj } from '@storybook/react';
import StatCard from './StatCard.js';

type Story = StoryObj<typeof StatCard>;

const meta: Meta<typeof StatCard> = {
  component: StatCard,
  tags: ['autodocs'],
  args: {
    status: 'success',
    label: 'Неделя',
    sublabel: 'от прошлой',
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-25">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Positive: Story = {
  args: {
    value: 10,
    previousValue: 5,
  },
};

export const Negative: Story = {
  args: {
    value: 20,
    previousValue: 50,
  },
};

export const Equal: Story = {
  args: {
    value: 20,
    previousValue: 20,
  },
};

export const NoPreviousPeriod: Story = {
  args: {
    value: 10,
    previousValue: undefined,
  },
};

export const Loading: Story = {
  args: {
    status: 'pending',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};