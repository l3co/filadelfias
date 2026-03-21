import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthTenant } from '../../../contexts/AuthContext';
import { usePendingExpenses, useExpenseMutations } from '../../expense/hooks/useExpense';
import { useFinancialData } from './useFinancial';
import { useTitheMutations, usePendingTitheRecords } from '../../tithe/hooks/useTithe';
import { membersService } from '../../../services/members';
import { financialService, type CreateAssetDTO } from '../../../services/financial';
import { usePermissions } from '../../../hooks/usePermissions';

export function useTreasuryPageData() {
  const tenant = useAuthTenant();
  const tenantId = tenant?.id;
  const queryClient = useQueryClient();
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
  } = useFinancialData(tenantId);
  const { canViewFinancial, canManageFinancial, isTreasurer } = usePermissions();
  const { data: pendingTithes, isLoading: tithesLoading } = usePendingTitheRecords(tenantId);
  const { approveRecord } = useTitheMutations(tenantId);
  const { data: pendingExpenses, isLoading: expensesLoading } = usePendingExpenses(tenantId);
  const { approveExpense } = useExpenseMutations(tenantId);
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['financial-report', tenantId, filters.month, filters.year],
    queryFn: () => financialService.getMonthlyReport(tenantId!, filters),
    enabled: !!tenantId && canViewFinancial,
  });
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['financial-assets', tenantId],
    queryFn: () => financialService.listAssets(tenantId!),
    enabled: !!tenantId && canViewFinancial,
  });
  const createAsset = useMutation({
    mutationFn: (data: CreateAssetDTO) => financialService.createAsset(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-assets', tenantId] });
      toast.success('Bem patrimonial cadastrado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar bem: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    },
  });
  const deleteAsset = useMutation({
    mutationFn: (assetId: string) => financialService.deleteAsset(tenantId!, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-assets', tenantId] });
      toast.success('Bem patrimonial excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir bem: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    },
  });
  const { data: members } = useQuery({
    queryKey: ['members', tenantId],
    queryFn: () => membersService.listMembers(tenantId!),
    enabled: !!tenantId,
  });

  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'CREDIT' | 'DEBIT' }>({
    isOpen: false,
    type: 'CREDIT',
  });
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);

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
    if (tenantId) {
      financialService.downloadCsvTemplate(tenantId);
    }
  }, [tenantId]);

  const handleImportCsv = useCallback(
    async (file: File) => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      return financialService.importCsv(tenantId, file);
    },
    [tenantId],
  );

  const showTreasuryControls = isTreasurer || canManageFinancial;

  return {
    accounts,
    assets,
    assetsLoading,
    canViewFinancial,
    categories,
    closeModal,
    createAsset,
    createAccount,
    createCategory,
    createTransaction,
    deleteAsset,
    expensesLoading,
    filters,
    handleCloseCsvDialog,
    handleDownloadTemplate,
    handleImportCsv,
    handleOpenCsvDialog,
    handleOpenReport: () => setIsReportOpen(true),
    handleCloseReport: () => setIsReportOpen(false),
    handleOpenAssetDialog: () => setIsAssetDialogOpen(true),
    handleCloseAssetDialog: () => setIsAssetDialogOpen(false),
    isCsvDialogOpen,
    isAssetDialogOpen,
    isLoading,
    isReportOpen,
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
    report,
    reportLoading,
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
          toast.error(`Erro ao cadastrar: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
        },
      });
    },
    handleAssetSubmit: async (data: CreateAssetDTO) => {
      await createAsset.mutateAsync(data);
      setIsAssetDialogOpen(false);
    },
  };
}
