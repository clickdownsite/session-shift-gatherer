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
import { usePageFlows } from '@/hooks/usePageFlows';
import { useAuth } from '@/hooks/useAuth';

const CreateSessionForm = () => {
  const { createSession, mainPages: rawMainPages, subPages, isLoading: sessionsLoading } = useSupabaseSessions();
  const navigate = useNavigate();
  const [mainPageId, setMainPageId] = useState('');
  const [subPageId, setSubPageId] = useState('');
  const [creating, setCreating] = useState(false);
  const [sessionOptions, setSessionOptions] = useState({
    collectDeviceInfo: true,
    collectIPGeolocation: true,
    lockToFirstIP: false,
  });
  const [flowId, setFlowId] = useState('');

  // Added: loading flags for page templates
  const mainPagesLoading = !rawMainPages;
  const subPagesLoading = !subPages;

  // Defensive: treat loading as true if any hook is loading
  const isLoading = sessionsLoading || mainPagesLoading || subPagesLoading;

  // Defensive: parse result of useAuth for authentication guard
  const { user, loading: authLoading } = useAuth();

  // Guard: show skeleton or logged out splash if not logged in
  if (authLoading) return <CreateSessionSkeleton />;
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <p className="text-lg font-semibold mb-3">You must be logged in to create a session.</p>
          <Button onClick={() => navigate("/auth")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Defensive: fallback to empty arrays if undefined/null
  const safeMainPages = rawMainPages ?? [];
  const safeSubPages = subPages ?? [];

  // Memoize mainPages with their subPages for fast rendering
  const mainPages = React.useMemo(() => {
    if (!safeMainPages.length) return [];
    const subMap = (safeSubPages || []).reduce((acc, sp) => {
      if (sp.main_page_id) {
        acc[sp.main_page_id] = acc[sp.main_page_id] || [];
        acc[sp.main_page_id].push(sp);
      }
      return acc;
    }, {} as Record<string, any[]>);
    return safeMainPages.map(mp => ({
      ...mp,
      subPages: subMap[mp.id] || [],
    }));
  }, [safeMainPages, safeSubPages]);

  // Defensive: states to track when initialization has happened to avoid empty list updates overwriting
  const [mainIdInitialized, setMainIdInitialized] = useState(false);

  React.useEffect(() => {
    if (!mainIdInitialized && mainPages.length > 0 && !mainPageId) {
      setMainPageId(mainPages[0].id);
      setMainIdInitialized(true);
    }
  }, [mainPages, mainPageId, mainIdInitialized]);

  React.useEffect(() => {
    if (mainPageId && mainPages.length) {
      const selected = mainPages.find(p => p.id === mainPageId);
      setSubPageId(selected?.subPages?.[0]?.id || '');
    }
  }, [mainPages, mainPageId]);

  const selectedMainPage = mainPages.find(p => p.id === mainPageId);
  const selectedSubPage = selectedMainPage?.subPages?.find(p => p.id === subPageId);

  const handleOptionChange = (option: keyof typeof sessionOptions, value: boolean) => {
    setSessionOptions(prev => ({ ...prev, [option]: value }));
  };

  // Page flows
  const { data: pageFlows = [], isLoading: flowsLoading, error: flowsError } = usePageFlows();

  React.useEffect(() => {
    // Extra debug logging for diagnose
    console.log('[CreateSession] mainPages:', mainPages);
    console.log('[CreateSession] subPages:', safeSubPages);
    console.log('[CreateSession] pageFlows:', pageFlows, 'flowsLoading:', flowsLoading, 'flowsError:', flowsError);
  }, [mainPages, safeSubPages, pageFlows, flowsLoading, flowsError]);

  const handleCreateSession = () => {
    if (!mainPageId || !subPageId) {
      toast.error("Error", { description: "Please select both a page type and subpage" });
      return;
    }
    setCreating(true); // Instant loading feedback

    createSession(
      { 
        mainPageId, 
        subPageId, 
        sessionOptions: { ...sessionOptions, ...(flowId ? { flowId } : {}) }
      },
      {
        onSuccess: () => {
          toast.success("Session Created", { description: "New session has been created successfully." });
          navigate('/dashboard');
        },
        onError: (err) => {
          toast.error("Error", { description: err.message || "Failed to create session" });
          setCreating(false);
        }
      }
    );
  };

  // Loading indicator
  if (isLoading) {
    return <CreateSessionSkeleton />;
  }

  // Show error if no main pages available
  if (!mainPages.length) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-96 text-center">
        <div>
          <p className="text-lg font-semibold mb-2">No page templates available</p>
          <p className="text-muted-foreground mb-4">
            You must create at least one main page and one sub page before starting a session.
          </p>
          <Button onClick={() => navigate("/user-pages")}>Create Page Templates</Button>
        </div>
      </div>
    );
  }

  // Show error if no subpages for chosen mainpage
  if (selectedMainPage && selectedMainPage.subPages.length === 0) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-96 text-center">
        <div>
          <p className="text-lg font-semibold mb-2">No sub pages available for this Page Type</p>
          <p className="text-muted-foreground mb-4">
            Each main page must have at least one sub page. Please add a sub page and try again.
          </p>
          <Button onClick={() => navigate("/user-pages")}>Manage Page Templates</Button>
        </div>
      </div>
    );
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
                {mainPages
                  .filter((page) => page.id && page.id !== "")
                  .map((page) => (
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
                  {selectedMainPage.subPages
                    .filter((subPage) => subPage.id && subPage.id !== "")
                    .map((subPage) => (
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
          {/* Always render flow selector */}
          <div className="space-y-2">
            <Label htmlFor="flow-select">Session Flow</Label>
            <Select value={flowId} onValueChange={setFlowId} disabled={flowsLoading || !!flowsError}>
              <SelectTrigger id="flow-select">
                <SelectValue placeholder={flowsLoading ? "Loading flows..." : "No flow (manual)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No flow (manual)</SelectItem>
                {/* Only render flow options if loaded and not errored */}
                {!flowsLoading && !flowsError && pageFlows
                  .filter((flow) => flow.id && flow.id !== "")
                  .map((flow) => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {flowsError && (
              <div className="text-xs text-red-500">
                Failed to load session flows.
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              If selected, users will auto-advance between steps as defined by the flow configuration.
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            disabled={!mainPageId || !subPageId || creating}
          >
            {creating ? (
              <span>
                <svg className="inline animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Session'
            )}
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
