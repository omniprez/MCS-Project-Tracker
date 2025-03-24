import { db } from "../server/db";
import { 
  projects, 
  teamMembers, 
  projectDocuments,
  projectStageHistory,
  tasks,
  ProjectStage,
  ServiceType
} from "../shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Check if we already have data
  const existingTeamMembers = await db.select().from(teamMembers);
  const existingProjects = await db.select().from(projects);
  
  if (existingTeamMembers.length === 0) {
    console.log("Adding team members...");
    // Only add if none exist
    await db.insert(teamMembers).values([
      {
        name: "John Smith",
        role: "Project Manager",
        email: "john.smith@isptracker.com",
        phone: "555-123-4567"
      },
      {
        name: "Sarah Johnson",
        role: "Network Engineer",
        email: "sarah.johnson@isptracker.com",
        phone: "555-234-5678"
      },
      {
        name: "Michael Chen",
        role: "Field Technician",
        email: "michael.chen@isptracker.com",
        phone: "555-345-6789"
      },
      {
        name: "Emily Rodriguez",
        role: "Sales Representative",
        email: "emily.rodriguez@isptracker.com",
        phone: "555-456-7890"
      },
      {
        name: "David Wilson",
        role: "NOC Engineer",
        email: "david.wilson@isptracker.com",
        phone: "555-567-8901"
      }
    ]);
  }
  
  // Get team members for assignment
  const teamMembersList = await db.select().from(teamMembers);
  
  if (existingProjects.length === 0 && teamMembersList.length > 0) {
    console.log("Adding sample projects...");
    
    // Add sample projects
    const sampleProjects = [
      {
        projectId: "FIBER-2025-001",
        customerName: "Acme Corporation",
        contactPerson: "Robert Johnson",
        contactEmail: "robert@acme.com",
        contactPhone: "555-111-2222",
        email: "info@acme.com",
        phone: "555-111-2222",
        address: "123 Business Park, Suite 100, San Francisco, CA 94107",
        serviceType: ServiceType.Fiber,
        bandwidth: 1000,
        requirements: "Dedicated fiber connection with 99.99% uptime SLA. Redundant path required.",
        assignedTo: teamMembersList.find(m => m.role === "Project Manager")?.id || teamMembersList[0].id,
        expectedCompletion: "2025-05-30",
        currentStage: ProjectStage.Survey,
        isCompleted: false
      },
      {
        projectId: "WIRELESS-2025-002",
        customerName: "TechStart Innovations",
        contactPerson: "Maria Garcia",
        contactEmail: "maria@techstart.com",
        contactPhone: "555-222-3333",
        email: "info@techstart.com",
        phone: "555-222-3333",
        address: "456 Innovation Hub, Austin, TX 78701",
        serviceType: ServiceType.Wireless,
        bandwidth: 200,
        requirements: "Point-to-point wireless connection for new office location. Roof access available.",
        assignedTo: teamMembersList.find(m => m.role === "Network Engineer")?.id || teamMembersList[0].id,
        expectedCompletion: "2025-04-15",
        currentStage: ProjectStage.Requirements,
        isCompleted: false
      },
      {
        projectId: "FIBER-2025-003",
        customerName: "Global Financial Services",
        contactPerson: "James Wilson",
        contactEmail: "james@globalfinancial.com",
        contactPhone: "555-333-4444",
        email: "contact@globalfinancial.com",
        phone: "555-333-4444",
        address: "789 Finance Tower, Floor 20, New York, NY 10004",
        serviceType: ServiceType.Fiber,
        bandwidth: 10000,
        requirements: "Ultra-low latency connection to financial data centers. Compliance with financial security standards required.",
        assignedTo: teamMembersList.find(m => m.role === "Project Manager")?.id || teamMembersList[0].id,
        expectedCompletion: "2025-06-30",
        currentStage: ProjectStage.Confirmation,
        isCompleted: false
      },
      {
        projectId: "WIRELESS-2025-004",
        customerName: "City Public Schools District",
        contactPerson: "Elizabeth Chen",
        contactEmail: "elizabeth@cityschools.edu",
        contactPhone: "555-444-5555",
        email: "info@cityschools.edu",
        phone: "555-444-5555",
        address: "101 Education Avenue, Chicago, IL 60601",
        serviceType: ServiceType.Wireless,
        bandwidth: 500,
        requirements: "Multi-building campus connectivity for school district. E-rate funding program compliant.",
        assignedTo: teamMembersList.find(m => m.role === "Sales Representative")?.id || teamMembersList[0].id,
        expectedCompletion: "2025-07-15",
        currentStage: ProjectStage.Installation,
        isCompleted: false
      },
      {
        projectId: "FIBER-2024-005",
        customerName: "Healthcare Solutions Inc.",
        contactPerson: "Michael Brown",
        contactEmail: "michael@healthsolutions.com",
        contactPhone: "555-555-6666",
        email: "contact@healthsolutions.com",
        phone: "555-555-6666",
        address: "202 Medical Plaza, Seattle, WA 98101",
        serviceType: ServiceType.Fiber,
        bandwidth: 2000,
        requirements: "HIPAA compliant connection for medical data transfer between facilities. Guaranteed uptime needed.",
        assignedTo: teamMembersList.find(m => m.role === "Project Manager")?.id || teamMembersList[0].id,
        expectedCompletion: "2025-03-15",
        currentStage: ProjectStage.Handover,
        isCompleted: true
      }
    ];
    
    for (const projectData of sampleProjects) {
      // Insert project
      const [project] = await db.insert(projects).values(projectData).returning();
      
      // Add project documents
      await db.insert(projectDocuments).values([
        {
          projectId: project.id,
          name: "Requirements Document",
          type: "PDF",
          url: `https://example.com/documents/${project.projectId}/requirements.pdf`,
          description: "Initial customer requirements and specifications"
        },
        {
          projectId: project.id,
          name: "Site Survey Report",
          type: "PDF",
          url: `https://example.com/documents/${project.projectId}/site-survey.pdf`,
          description: "Technical site survey and feasibility assessment"
        },
        {
          projectId: project.id,
          name: "Service Agreement",
          type: "PDF",
          url: `https://example.com/documents/${project.projectId}/agreement.pdf`,
          description: "Signed service agreement and contract"
        }
      ]);
      
      // Add project tasks
      await db.insert(tasks).values([
        {
          projectId: project.id,
          title: "Initial Client Meeting",
          description: "Schedule and conduct kickoff meeting with client",
          assignedTo: project.assignedTo,
          status: "completed",
          stage: ProjectStage.Requirements,
          dueDate: new Date(new Date().setDate(new Date().getDate() - 30))
        },
        {
          projectId: project.id,
          title: "Site Survey",
          description: "Conduct technical site survey and assess feasibility",
          assignedTo: teamMembersList.find(m => m.role === "Field Technician")?.id || teamMembersList[0].id,
          status: project.currentStage >= ProjectStage.Survey ? "completed" : "pending",
          stage: ProjectStage.Survey,
          dueDate: new Date(new Date().setDate(new Date().getDate() - 15))
        },
        {
          projectId: project.id,
          title: "Prepare Proposal",
          description: "Prepare detailed technical and commercial proposal",
          assignedTo: teamMembersList.find(m => m.role === "Sales Representative")?.id || teamMembersList[0].id,
          status: project.currentStage >= ProjectStage.Confirmation ? "completed" : "pending",
          stage: ProjectStage.Confirmation,
          dueDate: new Date(new Date().setDate(new Date().getDate() - 10))
        },
        {
          projectId: project.id,
          title: "Equipment Procurement",
          description: "Order and verify delivery of all required equipment",
          assignedTo: teamMembersList.find(m => m.role === "Project Manager")?.id || teamMembersList[0].id,
          status: project.currentStage >= ProjectStage.Installation ? "completed" : "pending",
          stage: ProjectStage.Installation,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
        },
        {
          projectId: project.id,
          title: "Installation",
          description: "Complete physical installation and connectivity",
          assignedTo: teamMembersList.find(m => m.role === "Field Technician")?.id || teamMembersList[0].id,
          status: project.currentStage >= ProjectStage.Installation ? "in-progress" : "pending",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
        },
        {
          projectId: project.id,
          title: "Testing and Commissioning",
          description: "Conduct bandwidth and performance testing",
          assignedTo: teamMembersList.find(m => m.role === "Network Engineer")?.id || teamMembersList[0].id,
          status: project.currentStage >= ProjectStage.Handover ? "completed" : "pending",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 20))
        },
        {
          projectId: project.id,
          title: "NOC Integration",
          description: "Configure monitoring and alerts in NOC systems",
          assignedTo: teamMembersList.find(m => m.role === "NOC Engineer")?.id || teamMembersList[0].id,
          status: project.currentStage >= ProjectStage.Handover ? "completed" : "pending",
          dueDate: new Date(new Date().setDate(new Date().getDate() + 25))
        }
      ]);
      
      // Add stage history
      // Always have a requirements stage entry
      await db.insert(projectStageHistory).values({
        projectId: project.id,
        stage: ProjectStage.Requirements,
        notes: "Initial requirements gathered from customer",
        changedBy: project.assignedTo
      });
      
      // Add subsequent stage history based on current stage
      if (project.currentStage >= ProjectStage.Survey) {
        await db.insert(projectStageHistory).values({
          projectId: project.id,
          stage: ProjectStage.Survey,
          notes: "Site survey completed and feasibility confirmed",
          changedBy: teamMembersList.find(m => m.role === "Field Technician")?.id || teamMembersList[0].id,
          timestamp: new Date(new Date().setDate(new Date().getDate() - 20))
        });
      }
      
      if (project.currentStage >= ProjectStage.Confirmation) {
        await db.insert(projectStageHistory).values({
          projectId: project.id,
          stage: ProjectStage.Confirmation,
          notes: "Customer has signed off on proposal and service agreement",
          changedBy: teamMembersList.find(m => m.role === "Sales Representative")?.id || teamMembersList[0].id,
          timestamp: new Date(new Date().setDate(new Date().getDate() - 15))
        });
      }
      
      if (project.currentStage >= ProjectStage.Installation) {
        await db.insert(projectStageHistory).values({
          projectId: project.id,
          stage: ProjectStage.Installation,
          notes: "Equipment installed and connectivity established",
          changedBy: teamMembersList.find(m => m.role === "Field Technician")?.id || teamMembersList[0].id,
          timestamp: new Date(new Date().setDate(new Date().getDate() - 5))
        });
      }
      
      if (project.currentStage >= ProjectStage.Handover) {
        await db.insert(projectStageHistory).values({
          projectId: project.id,
          stage: ProjectStage.Handover,
          notes: "Service tested and handed over to NOC for monitoring",
          changedBy: teamMembersList.find(m => m.role === "NOC Engineer")?.id || teamMembersList[0].id,
          timestamp: new Date(new Date().setDate(new Date().getDate() - 1))
        });
      }
    }
  }
  
  console.log("Database seeding completed!");
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });