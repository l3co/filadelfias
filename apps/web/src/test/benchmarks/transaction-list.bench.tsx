// @vitest-environment jsdom
import { bench, describe } from 'vitest';
import { render } from '@testing-library/react';
import { TransactionList } from '../../features/financial/components/TransactionList';
import type { Transaction } from '../../services/financial';

const mockTransactions: Transaction[] = Array.from({ length: 250 }, (_, index) => ({
  id: `tx-${index}`,
  tenant_id: 'tenant-1',
  account_id: 'account-1',
  category_id: 'category-1',
  amount: 100 + index,
  type: index % 2 === 0 ? 'CREDIT' : 'DEBIT',
  description: `Transação ${index}`,
  date: '2026-03-19',
  category: {
    id: 'category-1',
    tenant_id: 'tenant-1',
    name: 'Geral',
    type: 'INCOME',
  },
  account: {
    id: 'account-1',
    tenant_id: 'tenant-1',
    name: 'Caixa',
    type: 'CASH',
    balance: 1000,
  },
}));

describe('TransactionList benchmarks', () => {
  bench('render 250 transactions', () => {
    const view = render(
      <TransactionList
        transactions={mockTransactions}
        filters={{ month: 3, year: 2026, page: 1 }}
      />,
    );

    view.unmount();
  });
});
