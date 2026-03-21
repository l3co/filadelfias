import { useForm, useWatch } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import type { CreateAssetDTO } from '../../../services/financial';

type CreateAssetDialogProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssetDTO) => void;
};

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excelente' },
  { value: 'GOOD', label: 'Bom' },
  { value: 'FAIR', label: 'Regular' },
  { value: 'NEEDS_REPAIR', label: 'Precisa de reparo' },
];

export function CreateAssetDialog({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateAssetDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateAssetDTO>({
    defaultValues: {
      condition: 'GOOD',
      quantity: 1,
    },
  });

  const selectedCondition = useWatch({ control, name: 'condition' }) ?? 'GOOD';

  const submit = (data: CreateAssetDTO) => {
    onSubmit({
      ...data,
      purchase_value: data.purchase_value ? Number(data.purchase_value) : undefined,
      quantity: Number(data.quantity),
    });
    reset({ condition: 'GOOD', quantity: 1 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Bem Patrimonial</DialogTitle>
          <DialogDescription>
            Cadastre equipamentos, móveis e instrumentos da igreja.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <Input
                {...register('name', { required: 'Nome é obrigatório' })}
                placeholder="Ex: Mesa de som Yamaha"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <Input
                {...register('category', { required: 'Categoria é obrigatória' })}
                placeholder="Ex: Som, Instrumento, Mobiliário"
              />
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Localização</label>
              <Input {...register('location')} placeholder="Ex: Templo principal" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Condição</label>
              <input type="hidden" {...register('condition')} />
              <Select value={selectedCondition} onValueChange={(value) => setValue('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantidade</label>
              <Input {...register('quantity')} min={1} type="number" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor de compra</label>
              <Input {...register('purchase_value')} min={0} step="0.01" type="number" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data de aquisição</label>
              <Input {...register('acquired_date')} type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Observações</label>
            <Textarea {...register('notes')} placeholder="Estado de conservação, histórico, detalhes..." />
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button isLoading={isSubmitting} type="submit">
              Salvar bem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
