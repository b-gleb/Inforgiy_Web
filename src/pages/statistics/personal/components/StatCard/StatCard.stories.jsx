import StatCard from "./StatCard";

export default {
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
}

export const Positive = {
  args: {
    value: 10,
    previousValue: 5
  }
}

export const Negative = {
  args: {
    value: 20,
    previousValue: 50
  }
}

export const Equal = {
  args: {
    value: 20,
    previousValue: 20
  }
}

export const NoPreviousPeriod = {
  args: {
    value: 10,
    previousValue: undefined
  }
}

export const Loading = {
  args: {
    status: 'pending'
  }
}

export const Error = {
  args: {
    status: 'error',
  }
}