
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import SessionReplay from '@/components/SessionReplay';
import ABTestManager from '@/components/ABTestManager';
import HeatmapViewer from '@/components/HeatmapViewer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, MousePointer, TrendingUp } from 'lucide-react';

const Analytics = () => {
  // Fetch live sessions for analytics
  const { data: sessions = [] } = useQuery({
    queryKey: ['analytics_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch interaction counts
  const { data: interactionStats } = useQuery({
    queryKey: ['interaction_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_interactions')
        .select('interaction_type, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const activeSessions = sessions.filter(s => s.is_active).length;
  const totalSessions = sessions.length;
  const avgSessionDuration = sessions.reduce((acc, session) => {
    if (session.ended_at) {
      const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
      return acc + duration / 1000;
    }
    return acc;
  }, 0) / sessions.filter(s => s.ended_at).length || 0;

  // Process data for charts
  const dailySessionsData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const sessionsOnDate = sessions.filter(s => 
        s.started_at.split('T')[0] === date
      ).length;
      
      return {
        date,
        sessions: sessionsOnDate
      };
    });
  }, [sessions]);

  const interactionTypeData = React.useMemo(() => {
    if (!interactionStats) return [];
    
    const counts = interactionStats.reduce((acc: Record<string, number>, interaction) => {
      acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count
    }));
  }, [interactionStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive user behavior tracking and analysis
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently recording
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgSessionDuration)}s</div>
            <p className="text-xs text-muted-foreground">
              Per session
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactionStats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interactionTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
          <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
          <TabsTrigger value="abtests">A/B Testing</TabsTrigger>
          <TabsTrigger value="replay">Session Replay</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{session.session_token}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.page_url} • {new Date(session.started_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          Ended
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmaps">
          <HeatmapViewer />
        </TabsContent>

        <TabsContent value="abtests">
          <ABTestManager />
        </TabsContent>

        <TabsContent value="replay">
          <Card>
            <CardHeader>
              <CardTitle>Session Replay</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a session to view its replay
              </p>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <SessionReplay sessionId={sessions[0].id} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No sessions available for replay
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
