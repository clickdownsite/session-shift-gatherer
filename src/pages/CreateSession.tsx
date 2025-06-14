
import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSupabaseSessions } from '@/hooks/useSupabaseSession';
import { Skeleton } from '@/components/ui/skeleton';
import CreateSessionSkeleton from '@/components/session/CreateSessionSkeleton';
import SessionSettings from '@/components/session/SessionSettings';

const CreateSessionForm = () => {
  const { createSession, mainPages: rawMainPages, subPages, isLoading } = useSupabaseSessions();
  const navigate = useNavigate();
  const [mainPageId, setMainPageId] = useState('');
  const [subPageId, setSubPageId] = useState('');
  const [sessionOptions, setSessionOptions] = useState({
    collectDeviceInfo: true,
    collectIPGeolocation: true,
    lockToFirstIP: false,
  });

  // Memoize mainPages with their subPages for fast rendering
  const mainPages = React.useMemo(() => {
    if (!rawMainPages?.length) return [];
    const subMap = (subPages || []).reduce((acc, sp) => {
      if (sp.main_page_id) {
        acc[sp.main_page_id] = acc[sp.main_page_id] || [];
        acc[sp.main_page_id].push(sp);
      }
      return acc;
    }, {} as Record<string, any[]>);
    return rawMainPages.map(mp => ({
      ...mp,
      subPages: subMap[mp.id] || [],
    }));
  }, [rawMainPages, subPages]);

  React.useEffect(() => {
    if (mainPageId && mainPages.length) {
      const selected = mainPages.find(p => p.id === mainPageId);
      setSubPageId(selected?.subPages?.[0]?.id || '');
    }
  }, [mainPages, mainPageId]);
  React.useEffect(() => {
    if (!isLoading && mainPages.length && !mainPageId) setMainPageId(mainPages[0].id);
  }, [mainPages, mainPageId, isLoading]);

  const selectedMainPage = mainPages.find(p => p.id === mainPageId);
  const selectedSubPage = selectedMainPage?.subPages?.find(p => p.id === subPageId);

  const handleOptionChange = (option: keyof typeof sessionOptions, value: boolean) => {
    setSessionOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleCreateSession = () => {
    if (!mainPageId || !subPageId) {
      toast.error("Error", { description: "Please select both a page type and subpage" });
      return;
    }
    createSession({ mainPageId, subPageId, sessionOptions }, {
      onSuccess: () => {
        toast.success("Session Created", { description: "New session has been created successfully." });
        navigate('/dashboard');
      }
    });
  };

  if (isLoading) {
    return <CreateSessionSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-3xl animate-fade-in py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Session</h1>
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>Configure your new session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="main-page-type">Page Type</Label>
            <Select value={mainPageId} onValueChange={setMainPageId}>
              <SelectTrigger id="main-page-type">
                <SelectValue placeholder="Select Page Type" />
              </SelectTrigger>
              <SelectContent>
                {mainPages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMainPage && selectedMainPage.subPages?.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="sub-page-type">Sub Page</Label>
              <Select value={subPageId} onValueChange={setSubPageId}>
                <SelectTrigger id="sub-page-type">
                  <SelectValue placeholder="Select Sub Page" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMainPage.subPages.map((subPage) => (
                    <SelectItem key={subPage.id} value={subPage.id}>
                      {subPage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedSubPage && (
            <div className="pt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Preview</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Selected Template:</p>
                  <p className="text-base">{selectedMainPage?.name} - {selectedSubPage?.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">{selectedSubPage?.description}</p>
                </div>
              </div>
              <SessionSettings sessionOptions={sessionOptions} handleOptionChange={handleOptionChange} />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} disabled={!mainPageId || !subPageId}>
            Create Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const CreateSession = () => (
  <React.Suspense fallback={<CreateSessionSkeleton />}>
    <CreateSessionForm />
  </React.Suspense>
);

export default CreateSession;
