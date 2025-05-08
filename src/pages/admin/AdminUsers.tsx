import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  Copy,
  CreditCard, 
  Eye, 
  LinkIcon, 
  MoreHorizontal, 
  Plus,
  Search, 
  User,
  UserPlus,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, 
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Enhanced mock data interface
interface MockUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  sessions: number;
  createdAt: string;
  subscription: string;
  lastActive: string;
  ipAddresses: string[];
  locations: string[];
  sessions_data: {
    id: string;
    type: string;
    entries: number;
    createdAt: string;
  }[];
  cryptoAddress?: string; // Add the optional cryptoAddress field
}

// Mock data for users
const mockUsers: MockUser[] = [
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
    ],
    cryptoAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
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

// User form schema
const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  cryptoAddress: z.string().min(10, "Please enter a valid crypto address"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const AdminUsers = () => {
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // User form
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      cryptoAddress: "",
    },
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user: MockUser) => {
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

  const onSubmitNewUser = (data: z.infer<typeof userFormSchema>) => {
    const newUser: MockUser = {
      id: `user${users.length + 1}`,
      name: data.name,
      email: data.email,
      status: 'active',
      role: 'user',
      sessions: 0,
      createdAt: new Date().toISOString(),
      subscription: 'basic',
      lastActive: new Date().toISOString(),
      ipAddresses: [],
      locations: [],
      sessions_data: [],
      cryptoAddress: data.cryptoAddress,
    };

    setUsers([...users, newUser]);
    setIsAddingUser(false);
    form.reset();

    toast({
      title: "User Added",
      description: `${data.name} has been added successfully`
    });
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage system users</p>
        </div>
        <Button onClick={() => setIsAddingUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
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
                          {selectedUser.cryptoAddress && (
                            <div className="grid grid-cols-2">
                              <div className="text-muted-foreground">Crypto Address</div>
                              <div className="truncate">{selectedUser.cryptoAddress}</div>
                            </div>
                          )}
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
                              {selectedUser.ipAddresses.length > 0 ? (
                                selectedUser.ipAddresses.map((ip, index) => (
                                  <div key={index} className="bg-secondary rounded-md px-3 py-1.5 text-sm">
                                    {ip}
                                  </div>
                                ))
                              ) : (
                                <div className="bg-secondary rounded-md px-3 py-1.5 text-sm text-muted-foreground">
                                  No IP addresses recorded
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-2">Locations</div>
                            <div className="space-y-2">
                              {selectedUser.locations.length > 0 ? (
                                selectedUser.locations.map((location, index) => (
                                  <div key={index} className="bg-secondary rounded-md px-3 py-1.5 text-sm">
                                    {location}
                                  </div>
                                ))
                              ) : (
                                <div className="bg-secondary rounded-md px-3 py-1.5 text-sm text-muted-foreground">
                                  No locations recorded
                                </div>
                              )}
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
                      
                      {selectedUser.sessions_data.length > 0 ? (
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
                      ) : (
                        <div className="bg-muted p-6 rounded-md text-center">
                          <div className="text-muted-foreground">
                            <LinkIcon className="h-10 w-10 mx-auto mb-2" />
                            <p>No session data recorded</p>
                          </div>
                        </div>
                      )}
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

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Enter the details for the new user account.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewUser)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 6 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cryptoAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crypto Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the user's cryptocurrency wallet address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddingUser(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add User
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
