
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Users, LinkIcon, Calendar } from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';

const AdminDashboard = () => {
  const { sessions } = useSessionContext();
  
  // Calculate analytics
  const totalSessions = sessions.length;
  const totalEntries = sessions.reduce((sum, session) => sum + session.data.length, 0);
  const activeSessionsCount = sessions.filter(session => session.data.length === 0).length;

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of system activity and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <LinkIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">4%</span>
              <span className="text-muted-foreground ml-1">from last week</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Entries</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="text-muted-foreground ml-1">from last week</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">7%</span>
              <span className="text-muted-foreground ml-1">from last week</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Event</th>
                  <th className="text-left py-3 px-4 font-medium">Session ID</th>
                  <th className="text-left py-3 px-4 font-medium">Page Type</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((session, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Session Created</td>
                    <td className="py-3 px-4 font-mono text-sm">{session.id}</td>
                    <td className="py-3 px-4">{session.pageType}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                      No recent activities
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">All systems operational</p>
                <p className="text-sm text-gray-500">Last checked: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
