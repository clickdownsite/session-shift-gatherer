
import React, { createContext, useContext, useEffect } from 'react';
import { useLiveSession } from '@/hooks/useLiveSession';
import { useABTesting } from '@/hooks/useABTesting';
import { useConversionTracking } from '@/hooks/useConversionTracking';
import { useHeatmap } from '@/hooks/useHeatmap';

interface LiveSessionContextType {
  sessionId: string | null;
  isRecording: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

const LiveSessionContext = createContext<LiveSessionContextType | undefined>(undefined);

export const useLiveSessionContext = () => {
  const context = useContext(LiveSessionContext);
  if (!context) {
    throw new Error('useLiveSessionContext must be used within LiveSessionProvider');
  }
  return context;
};

export const LiveSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentSession, isRecording, startSession, endSession } = useLiveSession();
  const { getVariantForTest, activeTests } = useABTesting();
  const { setupConversionTracking } = useConversionTracking();
  const { setupHeatmapTracking } = useHeatmap();

  const startTracking = async () => {
    if (currentSession) return;

    // Start live session
    startSession({
      pageUrl: window.location.href,
      metadata: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });
  };

  const stopTracking = () => {
    if (!currentSession) return;
    endSession(currentSession.id);
  };

  // Auto-start tracking on mount
  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  // Set up A/B testing and conversion tracking when session starts
  useEffect(() => {
    if (!currentSession) return;

    const setupTracking = async () => {
      // Set up A/B testing
      const testAssignments: Record<string, string> = {};
      for (const test of activeTests) {
        try {
          const variant = await getVariantForTest(test.id, currentSession.id);
          testAssignments[test.id] = variant;
        } catch (error) {
          console.error('Failed to assign A/B test variant:', error);
        }
      }

      // Set up conversion tracking with A/B test context
      const firstTestId = Object.keys(testAssignments)[0];
      const firstVariant = testAssignments[firstTestId];
      setupConversionTracking(currentSession.id, firstTestId, firstVariant);

      // Set up heatmap tracking
      setupHeatmapTracking();
    };

    setupTracking();
  }, [currentSession, activeTests, getVariantForTest, setupConversionTracking, setupHeatmapTracking]);

  return (
    <LiveSessionContext.Provider
      value={{
        sessionId: currentSession?.id || null,
        isRecording,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </LiveSessionContext.Provider>
  );
};
