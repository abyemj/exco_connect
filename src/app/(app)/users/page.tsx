
'use client';

import * as React from 'react';
import { useAuth, User } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, ToggleLeft, ToggleRight, Trash2, Loader2, AlertCircle, Search, User as UserIconLucide } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserFormDialog } from '@/components/users/user-form-dialog'; // Import the new dialog


// Extend User type from context if needed, or use it directly
interface ManagedUser extends User {
    id: string; // Assuming users have a unique ID
}

// Dummy data fetching function - replace with actual API calls
const fetchUsers = async (): Promise<ManagedUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return [
        { id: 'user1', fullName: 'Alice Wonderland', role: 'Chairman', portfolio: 'State Governor', email: 'chairman@gov.ng', phone: '123-456-7890', status: 'Active' },
        { id: 'user2', fullName: 'Bob The Builder', role: 'Director', portfolio: 'Ministry of Works', email: 'director.works@gov.ng', phone: '987-654-3210', status: 'Active' },
        { id: 'user3', fullName: 'Charlie Chaplin', role: 'Delegate', portfolio: 'Department of Finance', email: 'delegate.finance@gov.ng', phone: '555-123-4567', status: 'Active' },
        { id: 'user4', fullName: 'Diana Prince', role: 'Delegate', portfolio: 'Department of Health', email: 'delegate.health@gov.ng', phone: '555-987-6543', status: 'Inactive' },
        { id: 'user5', fullName: 'Ethan Hunt', role: 'Director', portfolio: 'Ministry of Information', email: 'director.info@gov.ng', phone: '111-222-3333', status: 'Active' },
    ];
};

export default function UsersPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = React.useState<ManagedUser[]>([]);
    const [filteredUsers, setFilteredUsers] = React.useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<ManagedUser | null>(null);


    const loadUsers = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedUsers = await fetchUsers();
            setUsers(fetchedUsers);
            setFilteredUsers(fetchedUsers);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Could not load user data. Please try again later.");
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);


    React.useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push('/login');
        } else if (!authLoading && currentUser && !['Chairman', 'Director'].includes(currentUser.role)) {
            // Redirect non-admins away from user management
             toast({ title: 'Access Denied', description: 'You do not have permission to manage users.', variant: 'destructive'});
             router.push('/dashboard'); // Or appropriate page
        } else if (!authLoading && currentUser) {
            loadUsers();
        }
    }, [currentUser, authLoading, router, loadUsers]);


    React.useEffect(() => {
        const results = users.filter(u =>
            u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.portfolio.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleToggleStatus = (userId: string) => {
         if (!currentUser || currentUser.role !== 'Director') return;
        // API call to toggle status
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
        const updatedUser = users.find(u => u.id === userId);
        toast({
            title: 'User Status Updated',
            description: `${updatedUser?.fullName}'s status set to ${updatedUser?.status === 'Active' ? 'Inactive' : 'Active'}.`
         });
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        if (!currentUser || currentUser.role !== 'Director') return;
         // Prevent deleting self? Or the Chairman? Add checks if needed.
         if (userId === currentUser.id) {
            toast({ title: 'Action Denied', description: 'You cannot delete your own account.', variant: 'destructive'});
            return;
         }
         // API call to delete user
         setUsers(prev => prev.filter(u => u.id !== userId));
         toast({ title: 'User Deleted', description: `${userName} has been removed.`, variant: 'destructive' });
    };

    const handleOpenEditDialog = (userToEdit: ManagedUser) => {
        if (!currentUser || currentUser.role !== 'Director') return;
        setEditingUser(userToEdit);
        setIsUserDialogOpen(true);
    };

     const handleOpenCreateDialog = () => {
         if (!currentUser || currentUser.role !== 'Director') return;
        setEditingUser(null); // Ensure no user data is pre-filled
        setIsUserDialogOpen(true);
    };

     const handleSaveUser = async (userData: Omit<ManagedUser, 'id' | 'status'>, userId?: string): Promise<boolean> => {
        if (!currentUser || currentUser.role !== 'Director') return false;
        console.log("Saving user:", userData, "ID:", userId);
        // API call to create or update user
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

         try {
            if (userId) {
                 // Update existing user
                 setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
                 toast({ title: 'User Updated', description: `${userData.fullName}'s details saved successfully.` });
            } else {
                // Create new user
                const newUser: ManagedUser = {
                    ...userData,
                    id: `user${Date.now()}`, // Generate dummy ID
                    status: 'Active', // Default status for new user
                };
                setUsers(prev => [newUser, ...prev]);
                 toast({ title: 'User Created', description: `${userData.fullName} added successfully.` });
            }
            return true; // Indicate success
         } catch (error) {
            console.error("Error saving user:", error);
            toast({ title: 'Error', description: `Failed to save user ${userData.fullName}.`, variant: 'destructive'});
            return false; // Indicate failure
         }
    };


    // Display loading state
    if (authLoading || isLoading) {
        return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    // Handle case where user is not authorized (though redirection should handle this)
    if (!currentUser || !['Chairman', 'Director'].includes(currentUser.role)) {
         return <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view this page.</AlertDescription>
            </Alert>
        </div>;
    }

    // Handle error state
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
                <h1 className="text-2xl font-bold">User Management</h1>
                 <div className="flex w-full sm:w-auto items-center gap-2">
                   <div className="relative flex-1 sm:flex-initial">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                       type="search"
                       placeholder="Search users..."
                       className="pl-8 sm:w-64"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                   </div>
                   {currentUser.role === 'Director' && (
                    <UserFormDialog
                        open={isUserDialogOpen}
                        onOpenChange={setIsUserDialogOpen}
                        onSave={handleSaveUser}
                        user={editingUser}
                        trigger={
                            <Button onClick={handleOpenCreateDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        }
                    />
                   )}
                 </div>
            </div>

             {filteredUsers.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
                <div className="text-center">
                    <UserIconLucide className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No users found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms." : (currentUser.role === 'Director' ? "Add a new user to get started." : "There are no users to display.")}
                    </p>
                    {!searchTerm && currentUser.role === 'Director' && (
                        <UserFormDialog
                            open={isUserDialogOpen}
                            onOpenChange={setIsUserDialogOpen}
                            onSave={handleSaveUser}
                            user={editingUser}
                            trigger={
                                <Button className="mt-4" onClick={handleOpenCreateDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add User
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
                                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                                    <TableHead className="hidden md:table-cell">Portfolio</TableHead>
                                     <TableHead className="hidden lg:table-cell">Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    {currentUser.role === 'Director' && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="font-medium">{u.fullName}</div>
                                            <div className="text-xs text-muted-foreground md:hidden">{u.portfolio}</div> {/* Show portfolio on small screens here */}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{u.role}</TableCell>
                                        <TableCell className="hidden md:table-cell">{u.portfolio}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{u.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={u.status === 'Active' ? 'default' : 'outline'}>
                                                {u.status}
                                            </Badge>
                                        </TableCell>
                                        {currentUser.role === 'Director' && (
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleOpenEditDialog(u)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(u.id)}>
                                                                {u.status === 'Active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                                                {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={u.id === currentUser.id}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently remove the user account for <strong>{u.fullName}</strong>.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteUser(u.id, u.fullName)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete User
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        )}
                                        {currentUser.role === 'Chairman' && (
                                            <TableCell className="text-right">
                                                 {/* Chairman View only */}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             )}
        </div>
    );
}
