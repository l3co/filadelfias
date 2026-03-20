import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthTenant } from '../../../contexts/AuthContext';
import { usePendingExpenses, useExpenseMutations } from '../../expense/hooks/useExpense';
import { useFinancialData } from './useFinancial';
import { useTitheMutations, usePendingTitheRecords } from '../../tithe/hooks/useTithe';
import { membersService } from '../../../services/members';
import { financialService } from '../../../services/financial';
import { usePermissions } from '../../../hooks/usePermissions';

export function useTreasuryPageData() {
  const tenant = useAuthTenant();
  const {
    accounts,
    categories,
    transactions,
    totalBalance,
    createTransaction,
    createAccount,
    createCategory,
    isLoading,
    filters,
    nextPage,
    prevPage,
    setMonth,
    setYear,
  } = useFinancialData(tenant?.id);
  const { canViewFinancial, canManageFinancial, isTreasurer } = usePermissions();
  const { data: pendingTithes, isLoading: tithesLoading } = usePendingTitheRecords(tenant?.id);
  const { approveRecord } = useTitheMutations(tenant?.id);
  const { data: pendingExpenses, isLoading: expensesLoading } = usePendingExpenses(tenant?.id);
  const { approveExpense } = useExpenseMutations(tenant?.id);
  const { data: members } = useQuery({
    queryKey: ['members', tenant?.id],
    queryFn: () => membersService.listMembers(tenant!.id),
    enabled: !!tenant?.id,
  });

  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'CREDIT' | 'DEBIT' }>({
    isOpen: false,
    type: 'CREDIT',
  });
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

  const openCreditModal = useCallback(() => {
    setModalState({ isOpen: true, type: 'CREDIT' });
  }, []);

  const openDebitModal = useCallback(() => {
    setModalState({ isOpen: true, type: 'DEBIT' });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleOpenCsvDialog = useCallback(() => {
    setIsCsvDialogOpen(true);
  }, []);

  const handleCloseCsvDialog = useCallback(() => {
    setIsCsvDialogOpen(false);
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    if (tenant?.id) {
      financialService.downloadCsvTemplate(tenant.id);
    }
  }, [tenant?.id]);

  const handleImportCsv = useCallback(
    async (file: File) => {
      if (!tenant?.id) throw new Error('Tenant não encontrado');
      return financialService.importCsv(tenant.id, file);
    },
    [tenant?.id],
  );

  const showTreasuryControls = isTreasurer || canManageFinancial;

  return {
    accounts,
    canViewFinancial,
    categories,
    closeModal,
    createAccount,
    createCategory,
    createTransaction,
    expensesLoading,
    filters,
    handleCloseCsvDialog,
    handleDownloadTemplate,
    handleImportCsv,
    handleOpenCsvDialog,
    isCsvDialogOpen,
    isLoading,
    members,
    modalState,
    nextPage,
    openCreditModal,
    openDebitModal,
    pendingExpenses,
    pendingTithes,
    prevPage,
    setMonth,
    setYear,
    showTreasuryControls,
    tenant,
    tithesLoading,
    totalBalance,
    transactions,
    approveExpense,
    approveRecord,
    handleTransactionSubmit: (
      data: Parameters<typeof createTransaction.mutate>[0],
      resetForm: () => void,
    ) => {
      createTransaction.mutate(data, {
        onSuccess: () => {
          toast.success(
            modalState.type === 'CREDIT'
              ? 'Receita cadastrada com sucesso!'
              : 'Despesa cadastrada com sucesso!',
          );
          resetForm();
          closeModal();
        },
        onError: (error) => {
          toast.error(`Erro ao cadastrar: ${error.message}`);
        },
      });
    },
  };
}
