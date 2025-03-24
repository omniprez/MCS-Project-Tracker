import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProjectSchema, ServiceType, ProjectStage } from "@shared/schema";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertProjectSchema.extend({
  // Additional client-side validation
  email: z.string().email(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  bandwidth: z.number().min(1, "Bandwidth must be at least 1 Mbps"),
  requirements: z.string().optional(),
  projectId: z.string().optional() // Let the server generate this
});

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useQuery<any[]>({
    queryKey: ['/api/team-members'],
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      serviceType: ServiceType.Fiber,
      bandwidth: 100,
      requirements: "",
      assignedTo: 1, // Default to first team member
      expectedCompletion: new Date().toISOString().split('T')[0],
      currentStage: ProjectStage.Requirements,
      isCompleted: false
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log("Submitting project data:", data);
      try {
        // Filter out the projectId since we don't want it in the request
        const { projectId, ...projectData } = data;
        
        const response = await apiRequest('/api/projects', 'POST', projectData);
        const responseData = await response.json();
        console.log("Server response:", responseData);
        return responseData;
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation succeeded with data:", data);
      toast({
        title: "Project created",
        description: "The project has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    createProjectMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium leading-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Create New Project
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Information Section */}
            <div>
              <h4 className="text-md font-medium bg-gradient-to-r from-indigo-500 to-cyan-600 bg-clip-text text-transparent">Customer Information</h4>
              <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Installation Address</FormLabel>
                      <FormControl>
                        <Textarea className="max-h-16" rows={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Service Information */}
            <div>
              <h4 className="text-md font-medium bg-gradient-to-r from-indigo-500 to-cyan-600 bg-clip-text text-transparent">Service Information</h4>
              <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ServiceType.Fiber}>Fiber</SelectItem>
                          <SelectItem value={ServiceType.Wireless}>Wireless</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bandwidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bandwidth (Mbps)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Service Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="max-h-20"
                          rows={2} 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Project Assignment */}
            <div>
              <h4 className="text-md font-medium bg-gradient-to-r from-indigo-500 to-cyan-600 bg-clip-text text-transparent">Project Assignment</h4>
              <div className="mt-3 grid grid-cols-1 gap-y-3 gap-x-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                        disabled={isLoadingTeamMembers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedCompletion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Completion</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createProjectMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
