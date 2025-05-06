
'use client';

import * as React from 'react';
import { useAuth, User } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { UploadCloud, FileText, CheckCircle, XCircle, MoreHorizontal, Download, Eye, Loader2, AlertCircle, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadDocumentDialog } from '@/components/documents/upload-document-dialog';


interface DocumentItem {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'Word', 'Spreadsheet'
  uploadedBy: string; // User's full name or ID
  uploadDate: Date;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  fileUrl: string; // URL to view/download the document
  relatedMeeting?: string; // Optional: Title or ID of related meeting
}

// Dummy data fetching function - replace with actual API calls
const fetchDocuments = async (userRole: User['role']): Promise<DocumentItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const allDocs: DocumentItem[] = [
    { id: 'doc1', name: 'Q3 Financial Report.pdf', type: 'PDF', uploadedBy: 'Alice Smith (Delegate)', uploadDate: new Date(2024, 6, 20), status: 'Approved', fileUrl: '/documents/q3-financials.pdf', relatedMeeting: 'Budget Review Q3' },
    { id: 'doc2', name: 'Project Alpha Plan.docx', type: 'Word', uploadedBy: 'Bob Johnson (Delegate)', uploadDate: new Date(2024, 6, 22), status: 'Pending Approval', fileUrl: '/documents/project-alpha.docx', relatedMeeting: 'Project Alpha Kickoff' },
    { id: 'doc3', name: 'Marketing Strategy Q4.pptx', type: 'PowerPoint', uploadedBy: 'Charlie Brown (Delegate)', uploadDate: new Date(2024, 6, 15), status: 'Approved', fileUrl: '/documents/marketing-q4.pptx' },
    { id: 'doc4', name: 'Infrastructure Upgrade Proposal.pdf', type: 'PDF', uploadedBy: 'David Lee (Director)', uploadDate: new Date(2024, 5, 10), status: 'Rejected', fileUrl: '/documents/infra-proposal.pdf', relatedMeeting: 'Infrastructure Planning' },
  ];

  if (userRole === 'Delegate') {
    // Delegates see documents they uploaded or documents that are approved and relevant to their meetings.
    // This logic needs refinement based on specific requirements.
    // For simplicity, let's say delegates see their uploads and all approved documents.
    // const loggedInUserFullName = "Alice Smith (Delegate)"; // This should come from auth context
    // return allDocs.filter(doc => doc.uploadedBy === loggedInUserFullName || doc.status === 'Approved');
    return allDocs.filter(doc => doc.status === 'Approved'); // Simpler: delegates see all approved for now
  }
  // Chairman and Director see all documents
  return allDocs;
};


export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = React.useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false); // State for dialog


  const loadDocuments = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
        const fetchedDocs = await fetchDocuments(user.role);
        setDocuments(fetchedDocs);
        setFilteredDocuments(fetchedDocs); // Initialize filtered with all
    } catch (err) {
        console.error("Failed to fetch documents:", err);
        setError("Could not load documents. Please try again later.");
        setDocuments([]);
        setFilteredDocuments([]);
    } finally {
        setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
        loadDocuments();
    }
  }, [user, loading, router, loadDocuments]);

  React.useEffect(() => {
    const results = documents.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.relatedMeeting && doc.relatedMeeting.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDocuments(results);
  }, [searchTerm, documents]);

  const handleApproveDocument = (docId: string) => {
    if (!user || user.role !== 'Director') return;
    // API call to approve document
    setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, status: 'Approved' } : doc));
    toast({ title: 'Document Approved', description: 'The document is now visible to all users.' });
  };

  const handleRejectDocument = (docId: string) => {
    if (!user || user.role !== 'Director') return;
    // API call to reject document
    setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, status: 'Rejected' } : doc));
    toast({ title: 'Document Rejected' });
  };

  const handleUploadDocument = async (values: { title: string; file: File; meetingId?: string }) => {
    if (!user) return false;
    // Simulate upload
    console.log("Uploading document:", values.title, values.file.name);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDoc: DocumentItem = {
        id: `doc${Date.now()}`,
        name: values.title || values.file.name,
        type: values.file.type.split('/')[1]?.toUpperCase() || 'File', // Extract file type
        uploadedBy: user.fullName + (user.role === 'Delegate' ? ' (Delegate)' : ` (${user.role})`), // Be more specific
        uploadDate: new Date(),
        status: user.role === 'Director' ? 'Approved' : 'Pending Approval', // Directors auto-approve their uploads?
        fileUrl: URL.createObjectURL(values.file), // Temporary URL for preview, replace with actual storage URL
        relatedMeeting: values.meetingId, // Link to meeting if provided
    };

    setDocuments(prev => [newDoc, ...prev]);
    toast({
        title: 'Document Uploaded',
        description: `${newDoc.name} has been uploaded successfully. ${newDoc.status === 'Pending Approval' ? 'It will be reviewed by a Director.' : ''}`,
    });
    return true; // Indicate success
  };


  if (loading) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return null;
  }
  if (error) {
    return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    </div>;
  }


  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {(user.role === 'Director' || user.role === 'Delegate') && (
            <UploadDocumentDialog
                open={isUploading}
                onOpenChange={setIsUploading}
                onUpload={handleUploadDocument}
                trigger={
                     <Button onClick={() => setIsUploading(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                }
            />
          )}
        </div>
      </div>

      {isLoading ? (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : (user.role === 'Director' || user.role === 'Delegate' ? "Upload a document to get started." : "There are no documents available.")}
            </p>
            {!searchTerm && (user.role === 'Director' || user.role === 'Delegate') && (
               <UploadDocumentDialog
                open={isUploading}
                onOpenChange={setIsUploading}
                onUpload={handleUploadDocument}
                trigger={
                     <Button className="mt-4" onClick={() => setIsUploading(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                }
               />
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Uploaded By</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.type}{doc.relatedMeeting && ` - ${doc.relatedMeeting}`}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{doc.uploadedBy}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(doc.uploadDate), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant={
                        doc.status === 'Approved' ? 'default' : // Using 'default' for approved for better visibility
                        doc.status === 'Pending Approval' ? 'secondary' :
                        'destructive' // For Rejected
                      }>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(doc.fileUrl, '_blank')}> {/* Basic view, use a proper viewer for sensitive docs */}
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { /* Implement download. For blob URL, can create a link and click */
                              const link = document.createElement('a');
                              link.href = doc.fileUrl;
                              link.download = doc.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast({ title: 'Downloading', description: `Started downloading ${doc.name}`});
                            }}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          {user?.role === 'Director' && doc.status === 'Pending Approval' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50" onClick={() => handleApproveDocument(doc.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleRejectDocument(doc.id)}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                           {/* Option for Delegate or Director to delete their own pending/rejected uploads? */}
                          {((user?.role === 'Delegate' && doc.uploadedBy.includes(user.fullName)) || user?.role === 'Director') && ['Pending Approval', 'Rejected'].includes(doc.status) && (
                             <AlertDialogTrigger asChild>
                               <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <XCircle className="mr-2 h-4 w-4" /> Delete Upload
                               </DropdownMenuItem>
                             </AlertDialogTrigger>
                          )}
                           <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the document "{doc.name}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        // Call API to delete
                                        setDocuments(prev => prev.filter(d => d.id !== doc.id));
                                        toast({ title: 'Document Deleted', description: `${doc.name} has been deleted.`});
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <AlertDialog>
                {/* Placeholder for delete confirmation */}
             </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

