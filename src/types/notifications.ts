
export interface Notification {
  id: string;
  type: 'due_soon' | 'overdue' | 'paid';
  title: string;
  message: string;
  debtName: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  isRead: boolean;
}
