
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { MainPage, SubPage } from '@/types/session';
import SubPageCard from './SubPageCard';

interface MainPageCardProps {
  mainPage: MainPage & { subPages?: SubPage[] };
  onEdit: (mainPage: MainPage) => void;
  onCreateSubPage: (mainPage: MainPage) => void;
  onDelete: (mainPageId: string) => void;
  onPreviewSubPage: (subPage: SubPage) => void;
  onEditSubPage: (mainPage: MainPage, subPage: SubPage) => void;
  onCreateSession: (mainPageId: string, subPageId: string) => void;
  onDeleteSubPage: (mainPageId: string, subPageId: string) => void;
}

const MainPageCard: React.FC<MainPageCardProps> = ({
  mainPage,
  onEdit,
  onCreateSubPage,
  onDelete,
  onPreviewSubPage,
  onEditSubPage,
  onCreateSession,
  onDeleteSubPage,
}) => {
  return (
    <Card key={mainPage.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{mainPage.name}</CardTitle>
            {mainPage.description && (
              <p className="text-muted-foreground mt-1">{mainPage.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(mainPage)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCreateSubPage(mainPage)}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(mainPage.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h4 className="font-semibold">Sub Pages ({mainPage.subPages?.length || 0})</h4>
          <div className="grid gap-4">
            {mainPage.subPages && mainPage.subPages.length > 0 ? (
              mainPage.subPages.map((subPage: SubPage) => (
                <SubPageCard
                  key={subPage.id}
                  mainPage={mainPage}
                  subPage={subPage}
                  onPreview={onPreviewSubPage}
                  onEdit={onEditSubPage}
                  onCreateSession={onCreateSession}
                  onDelete={onDeleteSubPage}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No sub-pages yet. Click the + button to add one.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainPageCard;
