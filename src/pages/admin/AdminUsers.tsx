
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  Eye, 
  LinkIcon, 
  MoreHorizontal, 
  Search, 
  User 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';

// Mock data for users
const mockUsers = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    role: 'user',
    sessions: 12,
    createdAt: '2023-01-15T08:30:00Z',
    subscription: 'premium',
    lastActive: '2023-05-05T14:25:00Z',
    ipAddresses: ['192.168.1.1', '192.168.1.2'],
    locations: ['New York, USA', 'Boston, USA'],
    sessions_data: [
      { id: 'ses_123', type: 'login1', entries: 3, createdAt: '2023-04-28T10:15:00Z' },
      { id: 'ses_456', type: 'login2', entries: 1, createdAt: '2023-05-01T09:45:00Z' },
      { id: 'ses_789', type: 'login3', entries: 5, createdAt: '2023-05-04T16:20:00Z' }
    ]
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    role: 'admin',
    sessions: 8,
    createdAt: '2023-02-20T12:45:00Z',
    subscription: 'enterprise',
    lastActive: '2023-05-04T18:10:00Z',
    ipAddresses: ['192.168.1.3', '192.168.1.4'],
    locations: ['Los Angeles, USA', 'San Francisco, USA'],
    sessions_data: [
      { id: 'ses_321', type: 'login1', entries: 2, createdAt: '2023-04-15T11:30:00Z' },
      { id: 'ses_654', type: 'login4', entries: 7, createdAt: '2023-04-20T13:15:00Z' }
    ]
  },
  {
    id: 'user3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    status: 'inactive',
    role: 'user',
    sessions: 3,
    createdAt: '2023-03-10T15:20:00Z',
    subscription: 'basic',
    lastActive: '2023-04-20T09:30:00Z',
    ipAddresses: ['192.168.1.5'],
    locations: ['Chicago, USA'],
    sessions_data: [
      { id: 'ses_987', type: 'login2', entries: 1, createdAt: '2023-04-10T14:45:00Z' }
    ]
  }
];

const AdminUsers = () => {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };
  
  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'basic': return <Badge variant="outline">Basic</Badge>;
      case 'premium': return <Badge className="bg-brand-purple">Premium</Badge>;
      case 'enterprise': return <Badge className="bg-brand-purpleDark">Enterprise</Badge>;
      default: return <Badge variant="secondary">Free</Badge>;
    }
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage system users</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search users by name or email" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(user.status)} mr-2`}></div>
                          <span className="capitalize">{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>{user.sessions}</TableCell>
                      <TableCell>{getSubscriptionBadge(user.subscription)}</TableCell>
                      <TableCell>{formatDate(user.lastActive)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: "Email sent", description: `Reset password email sent to ${user.email}` })}>
                              <Activity className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {selectedUser && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Details: {selectedUser.name}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                    Close
                  </Button>
                </div>
                <CardDescription>{selectedUser.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">User Information</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">User ID</div>
                            <div>{selectedUser.id}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Name</div>
                            <div>{selectedUser.name}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Email</div>
                            <div>{selectedUser.email}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Status</div>
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedUser.status)} mr-2`}></div>
                              <span className="capitalize">{selectedUser.status}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Role</div>
                            <div className="capitalize">{selectedUser.role}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Registered</div>
                            <div>{formatDate(selectedUser.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Subscription</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Plan</div>
                            <div>{getSubscriptionBadge(selectedUser.subscription)}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Sessions</div>
                            <div>{selectedUser.sessions}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="text-muted-foreground">Last Active</div>
                            <div>{formatDate(selectedUser.lastActive)}</div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-medium mt-8 mb-4">Location Information</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="text-muted-foreground mb-2">IP Addresses</div>
                            <div className="space-y-2">
                              {selectedUser.ipAddresses.map((ip, index) => (
                                <div key={index} className="bg-secondary rounded-md px-3 py-1.5 text-sm">
                                  {ip}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-2">Locations</div>
                            <div className="space-y-2">
                              {selectedUser.locations.map((location, index) => (
                                <div key={index} className="bg-secondary rounded-md px-3 py-1.5 text-sm">
                                  {location}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sessions">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">User Sessions</h3>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Total Sessions: {selectedUser.sessions}
                        </div>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Session ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Entries</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUser.sessions_data.map((session) => (
                            <TableRow key={session.id}>
                              <TableCell>{session.id}</TableCell>
                              <TableCell className="capitalize">{session.type}</TableCell>
                              <TableCell>{session.entries}</TableCell>
                              <TableCell>{formatDate(session.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">User Activity</h3>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Last active: {formatDate(selectedUser.lastActive)}
                        </div>
                      </div>

                      <div className="bg-muted p-6 rounded-md">
                        <div className="flex items-center justify-center h-24">
                          <div className="text-center">
                            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Activity tracking is coming soon</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
