
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mouse, Eye, Scroll } from 'lucide-react';
import { useHeatmap } from '@/hooks/useHeatmap';

const HeatmapViewer = () => {
  const [selectedPage, setSelectedPage] = useState(window.location.pathname);
  const [interactionType, setInteractionType] = useState<'click' | 'hover' | 'scroll'>('click');
  const { useHeatmapData } = useHeatmap();
  const { data: heatmapData = [] } = useHeatmapData(selectedPage);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredData = heatmapData.filter(item => item.interaction_type === interactionType);

  useEffect(() => {
    if (!canvasRef.current || filteredData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap points
    filteredData.forEach(point => {
      const { x, y } = point.coordinates;
      const intensity = Math.min(point.count / 10, 1); // Normalize intensity
      const radius = 20 + (intensity * 30); // Variable radius based on intensity

      // Create gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Color based on interaction type and intensity
      let color;
      switch (interactionType) {
        case 'click':
          color = `rgba(239, 68, 68, ${intensity * 0.6})`; // Red
          break;
        case 'hover':
          color = `rgba(59, 130, 246, ${intensity * 0.4})`; // Blue
          break;
        case 'scroll':
          color = `rgba(16, 185, 129, ${intensity * 0.5})`; // Green
          break;
      }
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }, [filteredData, interactionType]);

  const getMaxCount = () => {
    return Math.max(...filteredData.map(item => item.count), 1);
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'click':
        return <Mouse className="w-4 h-4" />;
      case 'hover':
        return <Eye className="w-4 h-4" />;
      case 'scroll':
        return <Scroll className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Heatmap Analytics</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Heatmap</CardTitle>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="page-url">Page URL</Label>
              <Input
                id="page-url"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                placeholder="/page-path"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={interactionType} onValueChange={(value) => setInteractionType(value as any)}>
            <TabsList>
              <TabsTrigger value="click" className="flex items-center gap-2">
                <Mouse className="w-4 h-4" />
                Clicks
              </TabsTrigger>
              <TabsTrigger value="hover" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Hovers
              </TabsTrigger>
              <TabsTrigger value="scroll" className="flex items-center gap-2">
                <Scroll className="w-4 h-4" />
                Scrolls
              </TabsTrigger>
            </TabsList>

            <TabsContent value={interactionType} className="space-y-4">
              {/* Heatmap Canvas */}
              <div className="relative border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-lg font-medium">Page: {selectedPage}</div>
                    <div className="text-sm">Heatmap overlay</div>
                  </div>
                </div>
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-sm">
                <span>Intensity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ 
                      backgroundColor: interactionType === 'click' ? '#ef4444' : 
                                     interactionType === 'hover' ? '#3b82f6' : '#10b981',
                      opacity: 0.6 
                    }}
                  ></div>
                  <span>High</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{filteredData.length}</div>
                    <div className="text-sm text-muted-foreground">Hotspots</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {filteredData.reduce((sum, item) => sum + item.count, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total {interactionType}s</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{getMaxCount()}</div>
                    <div className="text-sm text-muted-foreground">Peak intensity</div>
                  </CardContent>
                </Card>
              </div>

              {/* Top hotspots */}
              <div>
                <h4 className="font-medium mb-2">Top Hotspots</h4>
                <div className="space-y-2">
                  {filteredData
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getInteractionIcon(item.interaction_type)}
                          <span className="text-sm">
                            {item.element_selector || 'Background'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.count} interactions</Badge>
                          <span className="text-xs text-muted-foreground">
                            ({item.coordinates.x}, {item.coordinates.y})
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeatmapViewer;
