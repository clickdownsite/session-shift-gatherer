
// Fix the addMainPage function to correctly handle subPages with required properties
// Make sure each subPage has id and parentId as required by the SubPage type

const handleAddPage = () => {
  if (!newPageName || !newPageDescription) {
    toast({
      title: "Error",
      description: "Please provide both a name and description",
      variant: "destructive"
    });
    return;
  }
  
  // Create the new page with empty subPages array
  // The actual SubPage objects will be added separately
  const newPageId = addMainPage({
    name: newPageName,
    description: newPageDescription,
    subPages: []  // This correctly matches the type
  });
  
  // Reset form and show success message
  setNewPageName('');
  setNewPageDescription('');
  setIsAddingPage(false);
  
  toast({
    title: "Page Added",
    description: `${newPageName} has been created successfully`
  });
};
