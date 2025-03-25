import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeamMember, TeamMemberRole, insertTeamMemberSchema } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { TeamMemberCard } from "@/components/ui/TeamMemberCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Info } from "lucide-react";

const AddTeamMemberSchema = insertTeamMemberSchema.extend({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(TeamMemberRole, {
    errorMap: () => ({ message: "Please select a role" }),
  }),
});

type AddTeamMemberValues = z.infer<typeof AddTeamMemberSchema>;

function TeamMembersList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const form = useForm<AddTeamMemberValues>({
    resolver: zodResolver(AddTeamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: AddTeamMemberValues) => {
      return await apiRequest<TeamMember>('/api/team-members', {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Team member added",
        description: "The team member has been added successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error adding the team member",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AddTeamMemberValues) {
    mutation.mutate(values);
  }

  const filteredTeamMembers = roleFilter === "all"
    ? teamMembers
    : teamMembers?.filter(member => member.role === roleFilter);

  // Determine if current user can award badges (based on role or admin status)
  const canAwardBadges = user?.role === TeamMemberRole.ProjectManager || user?.isAdmin;

  if (isLoading) {
    return <div>Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-gray-500">Manage your team members and their roles</p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.values(TeamMemberRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Team Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Add a new team member to your organization
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(TeamMemberRole).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The role determines what permissions the team member has
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Adding..." : "Add Team Member"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredTeamMembers?.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">No team members found</h3>
            <p className="text-blue-700 text-sm mt-1">
              {roleFilter === "all" 
                ? "Start by adding team members to your organization."
                : `No team members with the role "${roleFilter}" found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeamMembers?.map((teamMember) => (
            <TeamMemberCard 
              key={teamMember.id} 
              teamMember={teamMember} 
              canAwardBadges={canAwardBadges}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamMembers() {
  return (
    <div className="container mx-auto py-6">
      <TeamMembersList />
    </div>
  );
}