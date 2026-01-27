import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { X, DollarSign } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';

interface CreateTitheModalProps {
    visible: boolean;
    onClose: () => void;
    amount: string;
    onAmountChange: (value: string) => void;
    type: 'DIZIMO' | 'OFERTA';
    onTypeChange: (type: 'DIZIMO' | 'OFERTA') => void;
    notes: string;
    onNotesChange: (value: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function CreateTitheModal({
    visible,
    onClose,
    amount,
    onAmountChange,
    type,
    onTypeChange,
    notes,
    onNotesChange,
    onSubmit,
    isSubmitting,
}: CreateTitheModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
                    <Pressable onPress={onClose}>
                        <X size={24} color={colors.slate[600]} />
                    </Pressable>
                    <Text className="text-lg font-bold text-slate-900">Novo Registro</Text>
                    <View className="w-6" />
                </View>

                <View className="p-4 flex-1">
                    {/* Tipo */}
                    <Text className="text-sm font-medium text-slate-700 mb-2">Tipo</Text>
                    <View className="flex-row gap-3 mb-6">
                        <Pressable
                            onPress={() => onTypeChange('DIZIMO')}
                            className={`flex-1 py-3 rounded-xl items-center border-2 ${type === 'DIZIMO' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                                }`}
                        >
                            <Text className={type === 'DIZIMO' ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                                Dízimo
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => onTypeChange('OFERTA')}
                            className={`flex-1 py-3 rounded-xl items-center border-2 ${type === 'OFERTA' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                                }`}
                        >
                            <Text className={type === 'OFERTA' ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                                Oferta
                            </Text>
                        </Pressable>
                    </View>

                    {/* Valor */}
                    <Text className="text-sm font-medium text-slate-700 mb-2">Valor</Text>
                    <View className="flex-row items-center bg-slate-50 rounded-xl px-4 mb-6">
                        <DollarSign size={20} color={colors.slate[400]} />
                        <TextInput
                            placeholder="0,00"
                            value={amount}
                            onChangeText={onAmountChange}
                            keyboardType="decimal-pad"
                            className="flex-1 py-3.5 text-lg text-slate-900 ml-2"
                            placeholderTextColor={colors.slate[400]}
                        />
                    </View>

                    {/* Observações */}
                    <Text className="text-sm font-medium text-slate-700 mb-2">Observações (opcional)</Text>
                    <TextInput
                        placeholder="Ex: Oferta missionária..."
                        value={notes}
                        onChangeText={onNotesChange}
                        multiline
                        numberOfLines={3}
                        className="bg-slate-50 rounded-xl px-4 py-3 text-base text-slate-900"
                        placeholderTextColor={colors.slate[400]}
                        textAlignVertical="top"
                    />
                </View>

                <View className="p-4 border-t border-slate-100">
                    <Button
                        onPress={onSubmit}
                        loading={isSubmitting}
                        disabled={!amount}
                        size="lg"
                    >
                        Enviar Registro
                    </Button>
                </View>
            </View>
        </Modal>
    );
}
