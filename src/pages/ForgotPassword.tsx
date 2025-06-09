
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro de validação",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setIsEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Enviamos um link de redefinição para seu email.",
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro desconhecido. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Email Enviado!
            </CardTitle>
            <CardDescription>
              Enviamos um link de redefinição de senha para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Próximos passos:</strong>
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link do email recebido</li>
                  <li>Defina sua nova senha</li>
                  <li>O link expira em 1 hora</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Link 
                  to="/login"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar para o login
                </Link>
              </div>
              
              <Button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Enviar para outro email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Recuperar Senha
          </CardTitle>
          <CardDescription>
            Digite seu email para receber um link de redefinição de senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar Link de Redefinição
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
