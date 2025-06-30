import React from 'react';
import { DashboardCards } from './DashboardCards';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();

  const handleQuickAction = (actionId: string) => {
    if (onNavigate) {
      onNavigate(actionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your kitchen today
          </p>
        </div>
      </div>

      <DashboardCards />
      <QuickActions onActionClick={handleQuickAction} />
      <RecentActivity />
    </div>
  );
}