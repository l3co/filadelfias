const brlCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function parseDateInput(dateStr: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateStr);
}

export function formatCurrencyBRL(value: number) {
  return brlCurrencyFormatter.format(value);
}

export function formatDateBR(dateStr: string, options?: Intl.DateTimeFormatOptions) {
  return parseDateInput(dateStr).toLocaleDateString('pt-BR', options);
}

export function formatTimeBR(dateStr: string, options?: Intl.DateTimeFormatOptions) {
  return parseDateInput(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}
