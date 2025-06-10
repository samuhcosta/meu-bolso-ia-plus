
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DebtInstallment {
  id: string
  debt_id: string
  installment_number: number
  due_date: string
  amount: number
  is_paid: boolean
  debts: {
    name: string
    user_id: string
    notifications_enabled: boolean
    profiles: {
      name: string
      email: string
      whatsapp: string
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Get installments for notifications
    const notifications = [
      { type: '2_days_before', date: formatDate(dayAfterTomorrow) },
      { type: 'due_date', date: formatDate(tomorrow) },
      { type: '1_day_after', date: formatDate(yesterday) }
    ]

    for (const notification of notifications) {
      const { data: installments, error } = await supabaseClient
        .from('debt_installments')
        .select(`
          *,
          debts!inner(
            name,
            user_id,
            notifications_enabled,
            profiles!inner(name, email, whatsapp)
          )
        `)
        .eq('due_date', notification.date)
        .eq('is_paid', false)
        .eq('debts.notifications_enabled', true)

      if (error) {
        console.error('Error fetching installments:', error)
        continue
      }

      for (const installment of installments as DebtInstallment[]) {
        // Check if notification already sent
        const { data: existingNotification } = await supabaseClient
          .from('debt_notifications')
          .select('id')
          .eq('installment_id', installment.id)
          .eq('notification_type', notification.type)
          .single()

        if (existingNotification) continue

        // Create notification message
        let message = ''
        const amount = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(installment.amount)

        switch (notification.type) {
          case '2_days_before':
            message = `Lembrete: A parcela ${installment.installment_number} da sua dívida "${installment.debts.name}" vence em 2 dias (${new Date(installment.due_date).toLocaleDateString('pt-BR')}). Valor: ${amount}`
            break
          case 'due_date':
            message = `Atenção: A parcela ${installment.installment_number} da sua dívida "${installment.debts.name}" vence hoje! Valor: ${amount}`
            break
          case '1_day_after':
            message = `Urgente: A parcela ${installment.installment_number} da sua dívida "${installment.debts.name}" está em atraso desde ontem. Valor: ${amount}`
            break
        }

        // Insert notification in platform
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: installment.debts.user_id,
            title: 'Lembrete de Vencimento de Dívida',
            message: message,
            type: 'debt_reminder'
          })

        // Mark as sent
        await supabaseClient
          .from('debt_notifications')
          .insert({
            debt_id: installment.debt_id,
            installment_id: installment.id,
            notification_type: notification.type,
            sent_at: new Date().toISOString()
          })

        // TODO: Implement WhatsApp and Push notification integrations here
        console.log(`Notification sent for installment ${installment.id}: ${message}`)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Notifications processed successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
