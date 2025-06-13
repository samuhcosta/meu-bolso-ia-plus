
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const DebtSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSkeleton;
