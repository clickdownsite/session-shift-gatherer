
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Copy } from 'lucide-react';
import type { SubPage, MainPage } from '@/types/session';

interface SubPageCardProps {
  mainPage: MainPage;
  subPage: SubPage;
  onPreview: (subPage: SubPage) => void;
  onEdit: (mainPage: MainPage, subPage: SubPage) => void;
  onCreateSession: (mainPageId: string, subPageId: string) => void;
  onDelete: (mainPageId: string, subPageId: string) => void;
}

const SubPageCard: React.FC<SubPageCardProps> = ({
  mainPage,
  subPage,
  onPreview,
  onEdit,
  onCreateSession,
  onDelete,
}) => {
  return (
    <Card key={subPage.id} className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h5 className="font-medium">{subPage.name}</h5>
            {subPage.description && (
              <p className="text-sm text-muted-foreground mt-1">{subPage.description}</p>
            )}
            {subPage.fields && subPage.fields.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Form Fields:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subPage.fields.map((field: string) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onPreview(subPage)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(mainPage, subPage)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => onCreateSession(mainPage.id, subPage.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(mainPage.id, subPage.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubPageCard;
