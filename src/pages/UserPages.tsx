
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainPageDialogContent from '@/components/user-pages/MainPageDialogContent';
import SubPageDialogContent from '@/components/user-pages/SubPageDialogContent';
import PreviewDialogContent from '@/components/user-pages/PreviewDialogContent';
import { useUserPages } from '@/hooks/useUserPages';
import MainPageCard from '@/components/user-pages/MainPageCard';
import { Link } from "react-router-dom";

const UserPages = () => {
  const { user } = useAuth();
  const {
    mainPages,
    isLoading,
    isCreateDialogOpen, setIsCreateDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    isSubPageDialogOpen, setIsSubPageDialogOpen,
    isPreviewDialogOpen, setIsPreviewDialogOpen,
    selectedSubPage,
    previewContent,
    mainPageForm, setMainPageForm,
    subPageForm, setSubPageForm,
    fieldInput, setFieldInput,
    handleCreateMainPage,
    handleUpdateMainPage,
    handleDeleteMainPage,
    handleAddField,
    handleRemoveField,
    handleCreateSubPage,
    handleUpdateSubPage,
    handleDeleteSubPage,
    handleFileUpload,
    handlePreview,
    handleCreateSession,
    openEditMainPage,
    openCreateMainPage,
    openCreateSubPage,
    openEditSubPage,
  } = useUserPages();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to manage your pages.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Custom Pages</h1>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/flows">Manage Flows</Link>
          </Button>
          <Button onClick={openCreateMainPage}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Page
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {mainPages.map((mainPage) => (
          <MainPageCard
            key={mainPage.id}
            mainPage={mainPage}
            onEdit={openEditMainPage}
            onCreateSubPage={openCreateSubPage}
            onDelete={handleDeleteMainPage}
            onPreviewSubPage={handlePreview}
            onEditSubPage={openEditSubPage}
            onCreateSession={handleCreateSession}
            onDeleteSubPage={handleDeleteSubPage}
          />
        ))}
      </div>

      {/* Create Main Page Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <MainPageDialogContent
            mainPageForm={mainPageForm}
            setMainPageForm={setMainPageForm}
            handleSubmit={handleCreateMainPage}
            closeDialog={() => setIsCreateDialogOpen(false)}
            isEditing={false}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Main Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <MainPageDialogContent
            mainPageForm={mainPageForm}
            setMainPageForm={setMainPageForm}
            handleSubmit={handleUpdateMainPage}
            closeDialog={() => setIsEditDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Create/Edit Sub Page Dialog */}
      <Dialog open={isSubPageDialogOpen} onOpenChange={setIsSubPageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SubPageDialogContent
            subPageForm={subPageForm}
            setSubPageForm={setSubPageForm}
            fieldInput={fieldInput}
            setFieldInput={setFieldInput}
            handleAddField={handleAddField}
            handleRemoveField={handleRemoveField}
            handleFileUpload={handleFileUpload}
            handleSubmit={selectedSubPage ? handleUpdateSubPage : handleCreateSubPage}
            closeDialog={() => setIsSubPageDialogOpen(false)}
            isEditing={!!selectedSubPage}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <PreviewDialogContent previewContent={previewContent} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPages;
