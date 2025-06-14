
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { useSessionData } from '@/hooks/useLiveSession';

interface SessionReplayProps {
  sessionId: string;
}

const SessionReplay: React.FC<SessionReplayProps> = ({ sessionId }) => {
  const { session, interactions } = useSessionData(sessionId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const replayContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const maxTime = interactions.length > 0 
    ? Math.max(...interactions.map(i => i.timestamp_offset)) 
    : 0;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + (100 * playbackSpeed);
          if (newTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, maxTime]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const getActiveInteractions = () => {
    return interactions.filter(interaction => 
      interaction.timestamp_offset <= currentTime
    );
  };

  const renderInteractionVisual = (interaction: any, index: number) => {
    if (!interaction.coordinates) return null;

    const { x, y } = interaction.coordinates;
    let color = '#blue';
    let size = 10;

    switch (interaction.interaction_type) {
      case 'click':
        color = '#ef4444';
        size = 12;
        break;
      case 'mouse_move':
        color = '#3b82f6';
        size = 6;
        break;
      case 'scroll':
        color = '#10b981';
        size = 8;
        break;
    }

    return (
      <div
        key={`${interaction.id}-${index}`}
        className="absolute rounded-full opacity-70 animate-ping"
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
          pointerEvents: 'none'
        }}
      />
    );
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Session not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Replay</CardTitle>
        <div className="text-sm text-muted-foreground">
          Session: {session.session_token} | 
          Page: {session.page_url} | 
          Duration: {Math.round(maxTime / 1000)}s
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <Button
              variant={playbackSpeed === 0.5 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlaybackSpeed(0.5)}
            >
              0.5x
            </Button>
            <Button
              variant={playbackSpeed === 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlaybackSpeed(1)}
            >
              1x
            </Button>
            <Button
              variant={playbackSpeed === 2 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlaybackSpeed(2)}
            >
              2x
            </Button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(currentTime / 1000)}s</span>
            <span>{Math.round(maxTime / 1000)}s</span>
          </div>
          <Slider
            value={[currentTime]}
            max={maxTime}
            step={100}
            onValueChange={handleTimeChange}
            className="w-full"
          />
        </div>

        {/* Replay Container */}
        <div 
          ref={replayContainerRef}
          className="relative w-full h-96 bg-gray-50 border rounded-lg overflow-hidden"
          style={{ minHeight: '400px' }}
        >
          {/* Background overlay showing page */}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium">{session.page_url}</div>
              <div className="text-sm">Replay visualization</div>
            </div>
          </div>
          
          {/* Interaction Visuals */}
          {getActiveInteractions().map((interaction, index) => 
            renderInteractionVisual(interaction, index)
          )}
        </div>

        {/* Interaction Log */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Interactions</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {getActiveInteractions().slice(-5).map((interaction) => (
              <div key={interaction.id} className="text-xs p-2 bg-muted rounded">
                <span className="font-medium">{interaction.interaction_type}</span>
                {interaction.element_selector && (
                  <span className="ml-2 text-muted-foreground">
                    on {interaction.element_selector}
                  </span>
                )}
                <span className="ml-2 text-muted-foreground">
                  at {Math.round(interaction.timestamp_offset / 1000)}s
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionReplay;
