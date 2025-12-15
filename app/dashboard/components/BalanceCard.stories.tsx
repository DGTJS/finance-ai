/**
 * Storybook Stories para BalanceCard
 */

import type { Meta, StoryObj } from '@storybook/react';
import { BalanceCard } from './BalanceCard';

const meta = {
  title: 'Dashboard/BalanceCard',
  component: BalanceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    balance: { control: 'number' },
    changePercent: { control: 'number' },
    onRefresh: { action: 'refreshed' },
    isLoading: { control: 'boolean' },
  },
} satisfies Meta<typeof BalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story com saldo positivo
export const Positive: Story = {
  args: {
    balance: 1245.5,
    changePercent: 4.5,
    sparklineData: [1200, 1220, 1250, 1245, 1230, 1240, 1245.5],
    isLoading: false,
  },
};

// Story com saldo negativo
export const Negative: Story = {
  args: {
    balance: -150.0,
    changePercent: -10.2,
    sparklineData: [100, 50, -50, -100, -120, -140, -150],
    isLoading: false,
  },
};

// Story com loading
export const Loading: Story = {
  args: {
    balance: 0,
    changePercent: 0,
    sparklineData: [],
    isLoading: true,
  },
};

// Story com variação positiva
export const PositiveChange: Story = {
  args: {
    balance: 5000.0,
    changePercent: 15.8,
    sparklineData: [4000, 4100, 4300, 4500, 4700, 4800, 5000],
    isLoading: false,
  },
};



