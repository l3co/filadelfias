import { View, Text, Pressable } from 'react-native';
import { memo } from 'react';
import { Heart, Clock, User, Trash2 } from 'lucide-react-native';
import { ListCard } from '@/components/ui/ListCard';
import { PrayerRequest } from '@/services/prayer';
import { formatRelativeDate } from '@/lib/utils';
import { CATEGORY_COLORS, CategoryKey } from '@/constants/theme';

export const CATEGORY_LABELS = CATEGORY_COLORS;

function getCategoryConfig(category: string) {
    return CATEGORY_COLORS[category as CategoryKey] || CATEGORY_COLORS.other;
}

interface PrayerRequestCardProps {
    item: PrayerRequest;
    isMyRequest: boolean;
    hasPrayed: boolean;
    onPray: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export const PrayerRequestCard = memo(function PrayerRequestCard({
    item,
    isMyRequest,
    hasPrayed,
    onPray,
    onDelete,
    isDeleting,
}: PrayerRequestCardProps) {
    const category = getCategoryConfig(item.category);

    return (
        <ListCard>
            {/* Header com avatar, nome e categoria */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ 
                        height: 36, 
                        width: 36, 
                        borderRadius: 18, 
                        backgroundColor: '#f1f5f9', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <User size={18} color="#64748b" />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: '500', color: '#0f172a' }}>
                            {item.is_anonymous ? 'Anônimo' : item.author_name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <Clock size={12} color="#94a3b8" />
                            <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
                                {formatRelativeDate(item.created_at)}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Badge de categoria */}
                <View style={{ 
                    backgroundColor: category.bg, 
                    paddingHorizontal: 10, 
                    paddingVertical: 4, 
                    borderRadius: 12 
                }}>
                    <Text style={{ fontSize: 11, fontWeight: '500', color: category.text }}>
                        {category.label}
                    </Text>
                </View>
            </View>

            {/* Conteúdo do pedido */}
            <Text style={{ color: '#374151', lineHeight: 22, marginBottom: 14 }}>
                {item.content}
            </Text>

            {/* Footer com contador e botões */}
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#f1f5f9',
            }}>
                <Text style={{ fontSize: 13, color: '#64748b' }}>
                    {item.prayer_count} {item.prayer_count === 1 ? 'pessoa orou' : 'pessoas oraram'}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isMyRequest && (
                        <Pressable
                            onPress={onDelete}
                            disabled={isDeleting}
                            accessibilityLabel="Excluir pedido de oração"
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isDeleting }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                backgroundColor: '#fef2f2',
                                borderRadius: 10,
                            }}
                        >
                            <Trash2 size={16} color="#ef4444" />
                        </Pressable>
                    )}
                    
                    <Pressable
                        onPress={onPray}
                        disabled={hasPrayed}
                        accessibilityLabel={hasPrayed ? 'Você já orou por este pedido' : 'Orar por este pedido'}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: hasPrayed }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            backgroundColor: hasPrayed ? '#10b981' : '#ffffff',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: hasPrayed ? '#10b981' : '#e2e8f0',
                        }}
                    >
                        <Heart
                            size={16}
                            color={hasPrayed ? '#ffffff' : '#64748b'}
                            fill={hasPrayed ? '#ffffff' : 'transparent'}
                        />
                        <Text style={{ 
                            fontSize: 13, 
                            fontWeight: '500', 
                            marginLeft: 6,
                            color: hasPrayed ? '#ffffff' : '#374151',
                        }}>
                            {hasPrayed ? 'Orei!' : 'Orar'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ListCard>
    );
});
