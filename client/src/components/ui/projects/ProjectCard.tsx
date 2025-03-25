import { Project, ProjectStage, ServiceType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, PaperclipIcon, Wifi, Network, ArrowRight, AlertCircle, FileText, File, Download, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { getStageInfo, getStagePercentage } from "@/lib/stageUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showDocuments, setShowDocuments] = useState(false);
  const [showAdvanceStageDialog, setShowAdvanceStageDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [stageNotes, setStageNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Setup form for updating project
  const updateForm = useForm({
    defaultValues: {
      customerName: project.customerName,
      contactPerson: project.contactPerson,
      email: project.email,
      phone: project.phone,
      address: project.address,
      bandwidth: project.bandwidth,
      requirements: project.requirements,
    }
  });
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await apiRequest(
        `/api/projects/${project.id}`, 
        'PATCH', 
        values
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Project details have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowUpdateDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onUpdateSubmit = (values: any) => {
    updateProjectMutation.mutate(values);
  };

  const { data: teamMembers } = useQuery<any[]>({
    queryKey: ['/api/team-members'],
  });
  
  const stageInfo = getStageInfo(project.currentStage);
  const completionPercentage = getStagePercentage(project.currentStage);
  const formattedDate = format(new Date(project.createdAt), "MMM dd, yyyy");
  
  const assignedTeamMember = teamMembers?.find(tm => tm.id === project.assignedTo);
  
  // Get the next stage
  const nextStage = project.currentStage < ProjectStage.Handover 
    ? project.currentStage + 1 
    : null;
  
  const nextStageInfo = nextStage ? getStageInfo(nextStage) : null;
  
  // Advance stage mutation
  const advanceStageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        `/api/projects/${project.id}/stage`, 
        'POST', 
        {
          stage: nextStage,
          notes: stageNotes || `Advanced to ${nextStageInfo?.label}`,
          changedBy: project.assignedTo
        }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: `Project has been advanced to ${nextStageInfo?.label}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setShowAdvanceStageDialog(false);
      setStageNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to advance project stage: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Query to fetch project documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<any[]>({
    queryKey: [`/api/projects/${project.id}/documents`],
    enabled: showDocuments,
  });
  
  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/projects/${project.id}/documents`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Document has been uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/documents`] });
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload document: ${error.message}`,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate(file);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                {project.customerName}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {project.projectId}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
                project.serviceType === ServiceType.Fiber 
                  ? "bg-indigo-100 text-indigo-700" 
                  : "bg-cyan-100 text-cyan-700"
              }`}>
                {project.serviceType === ServiceType.Fiber ? (
                  <Network className="mr-1 h-4 w-4" />
                ) : (
                  <Wifi className="mr-1 h-4 w-4" />
                )}
                {project.serviceType === ServiceType.Fiber ? "Fiber" : "Wireless"}
              </span>
              <div className="text-right">
                <p className="text-sm text-slate-500">Created</p>
                <p className="text-sm font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${stageInfo.bgColor} ${stageInfo.textColor}`}>
                    Stage {project.currentStage}: {stageInfo.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600">
                    {completionPercentage}% Complete
                  </span>
                </div>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded bg-slate-200">
                <div 
                  className={`h-2 rounded ${stageInfo.barColor}`} 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Requirements</span>
                <span>Survey</span>
                <span>Confirmation</span>
                <span>Installation</span>
                <span>Handover</span>
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          {showDocuments && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Project Documents</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-1 h-4 w-4" /> 
                  {isUploading ? "Uploading..." : "Upload Document"}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </div>
              {documentsLoading ? (
                <div className="mt-2 flex justify-center">
                  <p className="text-sm text-gray-500">Loading documents...</p>
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                      <div className="flex items-center">
                        {doc.type.includes('pdf') ? (
                          <FileText className="mr-2 h-5 w-5 text-red-500" />
                        ) : doc.type.includes('image') ? (
                          <File className="mr-2 h-5 w-5 text-green-500" />
                        ) : (
                          <File className="mr-2 h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-md border border-dashed border-gray-300 p-4 text-center">
                  <p className="text-sm text-gray-500">No documents available for this project.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Card Footer */}
          <div className="mt-4 flex justify-between">
            <div className="flex items-center">
              <div className="text-sm text-slate-500">
                <span>Assigned to:</span>
                <span className="font-medium ml-1">
                  {assignedTeamMember?.name || "Unassigned"}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDocuments(!showDocuments)}
              >
                <PaperclipIcon className="mr-1 h-4 w-4" /> 
                {showDocuments ? "Hide Documents" : "Documents"}
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setShowUpdateDialog(true)}
              >
                <Edit className="mr-1 h-4 w-4" /> Update
              </Button>
              {nextStage && (
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  onClick={() => setShowAdvanceStageDialog(true)}
                >
                  <ArrowRight className="mr-1 h-4 w-4" /> {nextStageInfo?.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Advance Stage Dialog */}
      <Dialog open={showAdvanceStageDialog} onOpenChange={setShowAdvanceStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advance Project Stage</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-slate-700">
              Are you sure you want to advance this project to the <strong>{nextStageInfo?.label}</strong> stage?
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block mb-2 text-sm font-medium text-slate-700">
                  Stage Transition Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this stage transition..."
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdvanceStageDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
              onClick={() => advanceStageMutation.mutate()}
              disabled={advanceStageMutation.isPending}
            >
              {advanceStageMutation.isPending ? "Advancing..." : "Advance Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Project Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[450px] max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Project</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-3">
                <FormField
                  control={updateForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={updateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={updateForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={updateForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Installation address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateForm.control}
                  name="bandwidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bandwidth (Mbps)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateForm.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Project requirements"
                          className="max-h-[80px]" 
                          rows={2}
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpdateDialog(false)} 
                    type="button"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateProjectMutation.isPending}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  >
                    {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
