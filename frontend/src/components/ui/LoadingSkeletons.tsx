import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent, CardHeader } from './card';

export const CardSkeleton: React.FC = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton height={24} className="mb-2" />
      <Skeleton height={16} width="60%" />
    </CardHeader>
    <CardContent>
      <Skeleton height={200} className="mb-4" />
      <Skeleton height={16} count={3} className="mb-2" />
      <div className="flex justify-between mt-4">
        <Skeleton height={20} width="40%" />
        <Skeleton height={20} width="30%" />
      </div>
      <div className="mt-4">
        <Skeleton height={40} />
      </div>
    </CardContent>
  </Card>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="border rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <Skeleton circle height={40} width={40} />
          <div className="flex-1">
            <Skeleton height={20} width="40%" className="mb-2" />
            <Skeleton height={16} count={2} className="mb-2" />
            <div className="flex space-x-4 mt-3">
              <Skeleton height={14} width="20%" />
              <Skeleton height={14} width="15%" />
              <Skeleton height={14} width="25%" />
            </div>
          </div>
          <Skeleton height={32} width={80} />
        </div>
      </div>
    ))}
  </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="border rounded-lg overflow-hidden">
    <div className="bg-muted p-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} height={16} />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="border-t p-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} height={16} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <Skeleton circle height={80} width={80} />
      <div className="flex-1">
        <Skeleton height={24} width="40%" className="mb-2" />
        <Skeleton height={16} width="60%" className="mb-2" />
        <Skeleton height={14} width="30%" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton height={16} width="60%" className="mb-2" />
            <Skeleton height={24} width="40%" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const AuctionSkeleton: React.FC = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton height={24} className="mb-2" />
          <Skeleton height={16} width="70%" />
        </div>
        <Skeleton height={20} width={60} />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton height={150} className="mb-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton height={16} width="40%" />
          <Skeleton height={16} width="30%" />
        </div>
        <div className="flex justify-between">
          <Skeleton height={16} width="35%" />
          <Skeleton height={16} width="25%" />
        </div>
        <Skeleton height={8} className="my-4" />
        <div className="flex space-x-2">
          <Skeleton height={40} className="flex-1" />
          <Skeleton height={40} width={80} />
        </div>
      </div>
    </CardContent>
  </Card>
); 