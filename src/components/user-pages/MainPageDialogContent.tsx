
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MainPageDialogContentProps {
  mainPageForm: { name: string; description: string };
  setMainPageForm: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  handleSubmit: () => void;
  closeDialog: () => void;
  isEditing: boolean;
}

const MainPageDialogContent: React.FC<MainPageDialogContentProps> = ({
  mainPageForm,
  setMainPageForm,
  handleSubmit,
  closeDialog,
  isEditing,
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Main Page' : 'Create New Main Page'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Page Name</Label>
          <Input
            id="name"
            value={mainPageForm.name}
            onChange={(e) => setMainPageForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter page name"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={mainPageForm.description}
            onChange={(e) => setMainPageForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter page description"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>{isEditing ? 'Update Page' : 'Create Page'}</Button>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

export default MainPageDialogContent;
