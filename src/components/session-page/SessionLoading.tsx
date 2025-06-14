
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SessionLoading = () => (
  <div className="container mx-auto p-4 sm:p-6 lg:p-8">
    <div className="space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="pt-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

export default SessionLoading;
