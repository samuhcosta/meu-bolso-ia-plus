
export interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  first_installment_date: string;
  monthly_due_day: number;
  category: string;
  notes?: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DebtInstallment {
  id: string;
  debt_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DebtContextType {
  debts: Debt[];
  installments: DebtInstallment[];
  loading: boolean;
  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  markInstallmentAsPaid: (installmentId: string) => Promise<void>;
  markInstallmentAsUnpaid: (installmentId: string) => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchInstallments: (debtId?: string) => Promise<void>;
}
