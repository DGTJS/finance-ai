/**
 * Storybook Stories para CategoryPieCard
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CategoryPieCard } from './CategoryPieCard';

const meta = {
  title: 'Dashboard/CategoryPieCard',
  component: CategoryPieCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onCategoryClick: { action: 'category-clicked' },
  },
} satisfies Meta<typeof CategoryPieCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story com múltiplas categorias
export const MultipleCategories: Story = {
  args: {
    categories: [
      { key: 'FOOD', value: 842.0, emoji: '🍔', color: '#F59E0B' },
      { key: 'TRANSPORTATION', value: 320.0, emoji: '🚗', color: '#3B82F6' },
      { key: 'HOUSING', value: 1200.0, emoji: '🏠', color: '#EF4444' },
      { key: 'ENTERTAINMENT', value: 150.0, emoji: '🎬', color: '#8B5CF6' },
      { key: 'HEALTH', value: 280.0, emoji: '🏥', color: '#10B981' },
    ],
  },
};

// Story com poucas categorias
export const FewCategories: Story = {
  args: {
    categories: [
      { key: 'FOOD', value: 500.0, emoji: '🍔', color: '#F59E0B' },
      { key: 'TRANSPORTATION', value: 300.0, emoji: '🚗', color: '#3B82F6' },
    ],
  },
};

// Story com uma categoria dominante
export const DominantCategory: Story = {
  args: {
    categories: [
      { key: 'HOUSING', value: 2000.0, emoji: '🏠', color: '#EF4444' },
      { key: 'FOOD', value: 300.0, emoji: '🍔', color: '#F59E0B' },
      { key: 'TRANSPORTATION', value: 200.0, emoji: '🚗', color: '#3B82F6' },
    ],
  },
};





