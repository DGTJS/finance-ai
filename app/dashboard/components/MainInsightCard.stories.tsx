/**
 * Storybook Stories para MainInsightCard
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MainInsightCard } from './MainInsightCard';

const meta = {
  title: 'Dashboard/MainInsightCard',
  component: MainInsightCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onActionClick: { action: 'action-clicked' },
  },
} satisfies Meta<typeof MainInsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story com severidade alta
export const HighSeverity: Story = {
  args: {
    insight: {
      severity: 'high',
      message: 'Gastos mensais excederam 90% da renda. Ação imediata recomendada.',
      actions: [
        { id: 'create_budget', label: 'Criar orçamento' },
        { id: 'review_expenses', label: 'Revisar despesas' },
      ],
    },
  },
};

// Story com severidade média
export const MediumSeverity: Story = {
  args: {
    insight: {
      severity: 'medium',
      message: 'Gastou 17% a mais em alimentação comparado ao mês anterior',
      actions: [
        { id: 'create_limit', label: 'Criar limite de alimentação' },
        { id: 'review_expenses', label: 'Revisar despesas' },
      ],
    },
  },
};

// Story com severidade baixa
export const LowSeverity: Story = {
  args: {
    insight: {
      severity: 'low',
      message: 'Parabéns! Você está mantendo seus gastos dentro do orçamento.',
      actions: [
        { id: 'set_goal', label: 'Definir nova meta' },
      ],
    },
  },
};






