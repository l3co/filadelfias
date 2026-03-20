import { useForm } from 'react-hook-form';
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
import { useEffect } from 'react';
import type { CreateSocialProjectDTO, SocialProject } from '../../../services/missions';

type Props = {
  initialData?: SocialProject | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSocialProjectDTO) => void;
};

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planejamento' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'COMPLETED', label: 'Concluído' },
];

export function CreateSocialProjectDialog({ initialData, isOpen, isSubmitting, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateSocialProjectDTO>({
    defaultValues: {
      status: 'PLANNING',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (!isOpen) {
      reset({ status: 'PLANNING' });
      return;
    }

    if (initialData) {
      reset({
        contact_info: initialData.contact_info || '',
        coordinator_name: initialData.coordinator_name || '',
        end_date: initialData.end_date || '',
        location: initialData.location || '',
        start_date: initialData.start_date || '',
        status: initialData.status,
        summary: initialData.summary,
        target_audience: initialData.target_audience || '',
        title: initialData.title,
      });
      return;
    }

    reset({ status: 'PLANNING' });
  }, [initialData, isOpen, reset]);

  const submit = (data: CreateSocialProjectDTO) => {
    onSubmit({
      ...data,
      contact_info: data.contact_info?.trim() || undefined,
      coordinator_name: data.coordinator_name?.trim() || undefined,
      end_date: data.end_date || undefined,
      location: data.location?.trim() || undefined,
      start_date: data.start_date || undefined,
      target_audience: data.target_audience?.trim() || undefined,
    });
    reset({ status: 'PLANNING' });
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Projeto Social' : 'Novo Projeto Social'}</DialogTitle>
          <DialogDescription>
            Registre iniciativas de ação social apoiadas pela igreja.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <Input {...register('title', { required: 'Título é obrigatório' })} placeholder="Ex: Cesta Solidária" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Resumo</label>
            <Textarea
              {...register('summary', { required: 'Resumo é obrigatório' })}
              placeholder="Objetivo, formato e impacto esperado do projeto."
            />
            {errors.summary && <p className="text-xs text-red-500">{errors.summary.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Local</label>
              <Input {...register('location')} placeholder="Ex: Bairro São José" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <input type="hidden" {...register('status')} />
              <Select onValueChange={(value) => setValue('status', value)} value={status}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Público-alvo</label>
              <Input {...register('target_audience')} placeholder="Ex: famílias vulneráveis" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Coordenador</label>
              <Input {...register('coordinator_name')} placeholder="Ex: Diácono João" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contato</label>
              <Input {...register('contact_info')} placeholder="Telefone, email ou responsável" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Início</label>
                <Input {...register('start_date', { setValueAs: (value) => value || undefined })} type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fim</label>
                <Input {...register('end_date', { setValueAs: (value) => value || undefined })} type="date" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button isLoading={isSubmitting} type="submit">
              {initialData ? 'Salvar alterações' : 'Salvar projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
