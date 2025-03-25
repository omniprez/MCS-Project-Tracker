import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { BadgeType, TeamMemberBadge } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getBadgeInfo } from "@/lib/badgeUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const badgeFormSchema = z.object({
  badgeType: z.nativeEnum(BadgeType),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(200, "Reason must be less than 200 characters"),
});

type BadgeFormValues = z.infer<typeof badgeFormSchema>;

interface AwardBadgeFormProps {
  teamMemberId: number;
  onSuccess?: () => void;
}

export function AwardBadgeForm({ teamMemberId, onSuccess }: AwardBadgeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      badgeType: undefined,
      reason: "",
    },
  });

  const badgeMutation = useMutation({
    mutationFn: async (values: BadgeFormValues) => {
      return await apiRequest<TeamMemberBadge>(`/api/team-members/${teamMemberId}/badges`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "Badge awarded",
        description: "The badge has been awarded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/team-members', teamMemberId, 'badges'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error awarding the badge",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: BadgeFormValues) {
    badgeMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="badgeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a badge type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(BadgeType).map((type) => {
                    const badgeInfo = getBadgeInfo(type);
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center">
                          <badgeInfo.icon className={`mr-2 h-4 w-4 ${badgeInfo.color}`} />
                          <span>{badgeInfo.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of achievement to recognize
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why you're awarding this badge..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide context for why this badge is being awarded
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          disabled={badgeMutation.isPending}
        >
          {badgeMutation.isPending ? "Awarding Badge..." : "Award Badge"}
        </Button>
      </form>
    </Form>
  );
}