
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinancial();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline
    };

    if (editingId) {
      updateGoal(editingId, goalData);
      toast({
        title: "Meta atualizada!",
        description: "As informações da meta foram salvas com sucesso.",
      });
      setEditingId(null);
    } else {
      addGoal(goalData);
      toast({
        title: "Meta criada!",
        description: "Sua nova meta foi adicionada com sucesso.",
      });
    }

    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: '',
      deadline: ''
    });
  };

  const handleEdit = (goal: any) => {
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline
    });
    setEditingId(goal.id);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    toast({
      title: "Meta excluída",
      description: "A meta foi removida com sucesso.",
    });
  };

  const handleUpdateProgress = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      updateGoal(goalId, { currentAmount: goal.currentAmount + amount });
      toast({
        title: "Progresso atualizado!",
        description: `Adicionado ${formatCurrency(amount)} à sua meta.`,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Metas Financeiras</h1>
        <p className="text-muted-foreground">
          Defina e acompanhe seus objetivos financeiros
        </p>
      </div>

      {/* Add/Edit Goal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            {editingId ? 'Editar Meta' : 'Nova Meta'}
          </CardTitle>
          <CardDescription>
            {editingId ? 'Atualize os dados da sua meta' : 'Defina um novo objetivo financeiro'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Viagem para Europa"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor da Meta (R$) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="10000,00"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.currentAmount}
                  onChange={(e) => handleInputChange('currentAmount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Data Limite *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Atualizar Meta' : 'Criar Meta'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: '',
                      targetAmount: '',
                      currentAmount: '',
                      deadline: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Suas Metas</h2>
        
        {goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira meta financeira
              </p>
              <p className="text-sm text-muted-foreground">
                Defina objetivos claros e acompanhe seu progresso!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysLeft = getDaysUntilDeadline(goal.deadline);
              const isCompleted = progress >= 100;
              const isOverdue = daysLeft < 0 && !isCompleted;

              return (
                <Card key={goal.id} className={`${isCompleted ? 'border-secondary' : isOverdue ? 'border-destructive' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        {isCompleted && <CheckCircle className="w-5 h-5 text-secondary mr-2" />}
                        {goal.title}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {isCompleted ? (
                        <span className="text-secondary font-medium">✓ Meta concluída!</span>
                      ) : isOverdue ? (
                        <span className="text-destructive">Prazo vencido há {Math.abs(daysLeft)} dias</span>
                      ) : (
                        <span>{daysLeft} dias restantes</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            isCompleted ? 'bg-secondary' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="space-y-2">
                        <Label>Adicionar valor à meta</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Valor"
                            id={`add-amount-${goal.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`add-amount-${goal.id}`) as HTMLInputElement;
                              const amount = parseFloat(input.value);
                              if (amount > 0) {
                                handleUpdateProgress(goal.id, amount);
                                input.value = '';
                              }
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Meta criada em {new Date(goal.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
