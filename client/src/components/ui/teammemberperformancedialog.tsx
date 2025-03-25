import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamMemberPerformance } from "@/components/ui/TeamMemberPerformance";
import { BadgeList } from "@/components/ui/BadgeList";
import { AwardBadgeForm } from "@/components/ui/AwardBadgeForm";
import { TeamMember } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TeamMemberPerformanceDialogProps {
  teamMember: TeamMember;
  canAwardBadges?: boolean;
}

export function TeamMemberPerformanceDialog({ 
  teamMember, 
  canAwardBadges = false 
}: TeamMemberPerformanceDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{teamMember.name} - Performance Profile</DialogTitle>
          <DialogDescription>Performance metrics and achievements for {teamMember.name}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metrics">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="badges">Badges & Recognition</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="py-4">
            <TeamMemberPerformance teamMemberId={teamMember.id} isEditable={canAwardBadges} />
          </TabsContent>

          <TabsContent value="badges" className="py-4">
            <div className="space-y-6">
              <BadgeList teamMemberId={teamMember.id} />

              {canAwardBadges && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Award New Badge</h3>
                  <AwardBadgeForm 
                    teamMemberId={teamMember.id} 
                    onSuccess={() => {}}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}