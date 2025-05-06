
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'image/jpeg',
  'image/png',
  'text/plain',
];

const uploadDocumentSchema = z.object({
  title: z.string().optional(), // Optional title, can default to filename
  file: z
    .instanceof(File, { message: 'File is required.' })
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 10MB.`)
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), 'Invalid file type.'),
  // meetingId: z.string().optional(), // Optional field to link to a meeting
});

type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (values: { title: string; file: File; meetingId?: string }) => Promise<boolean>; // Returns true on success
  trigger?: React.ReactNode;
}

export function UploadDocumentDialog({ open, onOpenChange, onUpload, trigger }: UploadDocumentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      title: '',
      file: undefined,
      // meetingId: '',
    },
  });

  const fileRef = form.register("file"); // Register file input for RHF

  async function onSubmit(data: UploadDocumentFormValues) {
    setIsSubmitting(true);
    const success = await onUpload({
        title: data.title || data.file.name, // Use filename if title is empty
        file: data.file,
        // meetingId: data.meetingId,
    });
    setIsSubmitting(false);
    if (success) {
      onOpenChange(false); // Close dialog on success
      form.reset(); // Reset form
       if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input visually
       }
    }
  }

    // Watch the file field to display the selected filename
    const selectedFile = form.watch("file");


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) form.reset(); // Reset form when closing
        onOpenChange(isOpen);
    }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Select a document to upload. It will be submitted for approval if you are a Delegate.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave blank to use filename" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, onBlur, name, ref } }) => ( // Destructure field props
                    <FormItem>
                    <FormLabel>File</FormLabel>
                     <FormControl>
                        <div className="relative">
                         <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Hide default input
                            onChange={(e) => onChange(e.target.files?.[0])} // RHF's onChange expects the value directly
                            onBlur={onBlur}
                            name={name}
                            ref={(e) => { // Combine refs
                                ref(e);
                                fileInputRef.current = e;
                            }}
                            accept={ALLOWED_FILE_TYPES.join(',')}
                        />
                        <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {selectedFile ? selectedFile.name : "Choose file..."}
                         </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />

            {/* Future: Add Meeting Selection Dropdown */}
            {/* <FormField
              control={form.control}
              name="meetingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Meeting (Optional)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a meeting..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                             Add meeting options here
                             <SelectItem value="m1">Budget Review Q3</SelectItem>
                             <SelectItem value="m2">Project Alpha Kickoff</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedFile}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

