
import React from 'react';

interface SectionErrorFallbackProps {
  sectionName: string;
}

const SectionErrorFallback: React.FC<SectionErrorFallbackProps> = ({ sectionName }) => (
  <div className="border border-red-200 rounded-lg p-6">
    <div className="flex items-center justify-center space-x-2 text-red-600">
      <span>Erro ao carregar {sectionName}</span>
    </div>
    <p className="text-sm text-muted-foreground text-center mt-2">
      Esta seção não pôde ser carregada, mas o resto do dashboard está funcionando.
    </p>
  </div>
);

export default SectionErrorFallback;
