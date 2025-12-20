/**
 * Storybook Stories para GoalsCard
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GoalsCard } from './GoalsCard';

const meta = {
  title: 'Dashboard/GoalsCard',
  component: GoalsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onAddAmount: { action: 'add-amount' },
    maxItems: { control: 'number' },
  },
} satisfies Meta<typeof GoalsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story com múltiplas metas
export const MultipleGoals: Story = {
  args: {
    goals: [
      {
        id: '1',
        title: 'Viagem',
        current: 400,
        target: 2000,
        dueDate: '2026-06-01',
        isShared: false,
        icon: '✈️',
        color: '#3b82f6',
      },
      {
        id: '2',
        title: 'Reserva de Emergência',
        current: 1500,
        target: 5000,
        dueDate: '2026-12-31',
        isShared: false,
        icon: '💰',
        color: '#10b981',
      },
      {
        id: '3',
        title: 'Notebook',
        current: 800,
        target: 3000,
        dueDate: '2026-03-15',
        isShared: false,
        icon: '💻',
        color: '#8b5cf6',
      },
    ],
    maxItems: 3,
  },
};

// Story com meta quase completa
export const NearCompletion: Story = {
  args: {
    goals: [
      {
        id: '1',
        title: 'Viagem dos Sonhos',
        current: 1800,
        target: 2000,
        dueDate: '2026-06-01',
        isShared: false,
        icon: '✈️',
        color: '#3b82f6',
      },
    ],
  },
};

// Story sem metas
export const NoGoals: Story = {
  args: {
    goals: [],
  },
};






