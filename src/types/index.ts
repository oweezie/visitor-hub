
// Dashboard Stats Type
export interface DashboardStats {
  totalVisitors: number;
  activeVisitors: number;
  averageDuration: string;
  recentSignIns: number;
  recentSignOuts: number;
  signInsByPremise: { name: string; value: number }[];
  visitorHistory: { date: string; visitors: number }[];
  visitorStatuses: { name: string; value: number }[];
  recentActivity?: RecentActivity[];
}

// Recent Activity Type
export interface RecentActivity {
  id: number;
  visitorName: string;
  activityType: 'sign_in' | 'sign_out';
  timestamp: string;
  premise?: string;
  duration?: string;
  notes?: string;
}
