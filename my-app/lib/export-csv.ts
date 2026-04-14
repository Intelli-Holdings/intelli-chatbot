import { format } from 'date-fns';
import type { WhatsAppOrder } from '@/types/ecommerce';

export function exportOrdersToCSV(orders: WhatsAppOrder[], filename?: string) {
  if (orders.length === 0) return;

  const headers = ['Order ID', 'Customer Name', 'Customer Phone', 'Items Count', 'Total', 'Currency', 'Status', 'Date'];
  const rows = orders.map((order) => [
    order.id,
    order.customer_name || 'Unknown',
    order.customer_phone,
    String(order.items.length),
    String(order.total_amount),
    order.currency,
    order.status,
    format(new Date(order.created_at), 'yyyy-MM-dd'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
