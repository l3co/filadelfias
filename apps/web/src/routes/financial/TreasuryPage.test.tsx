import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/utils';
import { TreasuryPage } from './TreasuryPage';

vi.mock('../../features/financial/hooks/useTreasuryPageData', () => ({
  useTreasuryPageData: vi.fn(),
}));

import { useTreasuryPageData } from '../../features/financial/hooks/useTreasuryPageData';

const mockUseTreasuryPageData = vi.mocked(useTreasuryPageData);

function createTreasuryState(overrides: Partial<ReturnType<typeof useTreasuryPageData>> = {}) {
  return {
    accounts: [{ id: 'acc-1', name: 'Caixa', balance: 1000 }],
    assets: [],
    assetsLoading: false,
    canViewFinancial: true,
    categories: [],
    closeModal: vi.fn(),
    createAsset: { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
    createAccount: { mutateAsync: vi.fn(), isPending: false },
    createCategory: { mutateAsync: vi.fn(), isPending: false },
    createTransaction: { mutate: vi.fn(), isPending: false },
    deleteAsset: { mutate: vi.fn(), isPending: false },
    expensesLoading: false,
    filters: { month: 3, year: 2026, page: 1 },
    handleAssetSubmit: vi.fn(),
    handleCloseAssetDialog: vi.fn(),
    handleCloseCsvDialog: vi.fn(),
    handleCloseReport: vi.fn(),
    handleDownloadTemplate: vi.fn(),
    handleImportCsv: vi.fn(),
    handleOpenAssetDialog: vi.fn(),
    handleOpenCsvDialog: vi.fn(),
    handleOpenReport: vi.fn(),
    handleTransactionSubmit: vi.fn(),
    isAssetDialogOpen: false,
    isCsvDialogOpen: false,
    isLoading: false,
    isReportOpen: false,
    members: [],
    modalState: { isOpen: false, type: 'CREDIT' as const },
    nextPage: vi.fn(),
    openCreditModal: vi.fn(),
    openDebitModal: vi.fn(),
    pendingExpenses: [],
    pendingTithes: [],
    prevPage: vi.fn(),
    setMonth: vi.fn(),
    setYear: vi.fn(),
    showTreasuryControls: true,
    tenant: { id: 'tenant-1', name: 'Igreja Teste', slug: 'igreja-teste' },
    tithesLoading: false,
    totalBalance: 1000,
    transactions: [],
    report: undefined,
    reportLoading: false,
    approveExpense: { mutate: vi.fn(), isPending: false },
    approveRecord: { mutate: vi.fn(), isPending: false },
    ...overrides,
  } as ReturnType<typeof useTreasuryPageData>;
}

describe('TreasuryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders financial dashboard state with controls', () => {
    mockUseTreasuryPageData.mockReturnValue(createTreasuryState());

    renderWithProviders(<TreasuryPage />);

    expect(screen.getByText('Tesouraria')).toBeInTheDocument();
    expect(screen.getByText('Importar CSV')).toBeInTheDocument();
    expect(screen.getByText('Nova Receita')).toBeInTheDocument();
    expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
    expect(screen.getByText('Saldo Total')).toBeInTheDocument();
    expect(screen.getByText('Contas Ativas')).toBeInTheDocument();
  });

  it('triggers treasury actions from header controls', () => {
    const handleOpenCsvDialog = vi.fn();
    const openCreditModal = vi.fn();
    const openDebitModal = vi.fn();

    mockUseTreasuryPageData.mockReturnValue(
      createTreasuryState({
        handleOpenCsvDialog,
        openCreditModal,
        openDebitModal,
      }),
    );

    renderWithProviders(<TreasuryPage />);

    fireEvent.click(screen.getByRole('button', { name: /importar csv/i }));
    fireEvent.click(screen.getByRole('button', { name: /nova receita/i }));
    fireEvent.click(screen.getByRole('button', { name: /nova despesa/i }));

    expect(handleOpenCsvDialog).toHaveBeenCalledTimes(1);
    expect(openCreditModal).toHaveBeenCalledTimes(1);
    expect(openDebitModal).toHaveBeenCalledTimes(1);
  });

  it('renders access denied state when user cannot view financial data', () => {
    mockUseTreasuryPageData.mockReturnValue(
      createTreasuryState({
        canViewFinancial: false,
      }),
    );

    renderWithProviders(<TreasuryPage />);

    expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
    expect(
      screen.getByText('Você não tem permissão para acessar a tesouraria.'),
    ).toBeInTheDocument();
  });
});
