import { db } from "../server/db";
import { 
  users, 
  teamMembers, 
  projects, 
  projectStageHistory, 
  projectDocuments, 
  tasks,
  ProjectStage,
  ServiceType,
  TeamMemberRole
} from "../shared/schema";
import { hashPassword } from "../server/auth";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    
    // Check if we already have data
    const existingTeamMembers = await db.select().from(teamMembers);
    if (existingTeamMembers.length > 0) {
      console.log("Database already contains data, skipping seeding");
      return;
    }
    
    // Seed team members
    console.log("Seeding team members...");
    const defaultTeamMembers = [
      { name: "Sarah Johnson", role: TeamMemberRole.ProjectManager, email: "sarah@isp.com", phone: "555-123-4567" },
      { name: "Michael Chen", role: TeamMemberRole.NetworkEngineer, email: "michael@isp.com", phone: "555-234-5678" },
      { name: "Alex Rodriguez", role: TeamMemberRole.FieldTechnician, email: "alex@isp.com", phone: "555-345-6789" },
      { name: "Emily Wilson", role: TeamMemberRole.SalesRepresentative, email: "emily@isp.com", phone: "555-456-7890" },
      { name: "David Kim", role: TeamMemberRole.NOCEngineer, email: "david@isp.com", phone: "555-567-8901" }
    ];
    
    const [team1, team2, team3, team4, team5] = await db.insert(teamMembers).values(defaultTeamMembers).returning();
    
    // Create admin user if doesn't exist
    const adminExists = await db.select().from(users).where(u => u.username.equals("admin"));
    if (adminExists.length === 0) {
      console.log("Creating admin user...");
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        name: "Administrator",
        role: "Admin",
        email: "admin@example.com"
      });
    }
    
    // Seed projects
    console.log("Seeding projects...");
    const now = new Date();
    const projectsData = [
      {
        projectId: "P-2025-0001",
        customerName: "TechCorp Solutions",
        contactPerson: "John Anderson",
        email: "john@techcorp.com",
        phone: "555-789-1234",
        address: "123 Innovation Way, Technology Park, CA 94025",
        serviceType: ServiceType.Fiber,
        bandwidth: 1000,
        requirements: "Fiber connection for new office building with 250 employees. Redundant connection required. 24/7 support with 99.99% SLA.",
        assignedTo: team1.id,
        expectedCompletion: new Date("2025-05-15"),
        currentStage: ProjectStage.Requirements,
        isCompleted: false,
        createdAt: now,
        updatedAt: now
      },
      {
        projectId: "P-2025-0002",
        customerName: "Global Financial Group",
        contactPerson: "Lisa Wong",
        email: "lwong@gfg.com",
        phone: "555-456-7890",
        address: "888 Money Avenue, Financial District, NY 10004",
        serviceType: ServiceType.Fiber,
        bandwidth: 10000,
        requirements: "Ultra-low latency connection between main office and data center. Dedicated fiber path with automatic failover.",
        assignedTo: team2.id,
        expectedCompletion: new Date("2025-06-20"),
        currentStage: ProjectStage.Survey,
        isCompleted: false,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)  // 3 days ago
      },
      {
        projectId: "P-2025-0003",
        customerName: "Mountain View Medical Center",
        contactPerson: "Dr. Sarah Patel",
        email: "spatel@mvmc.org",
        phone: "555-222-3333",
        address: "456 Healing Boulevard, Mountain View, CA 94040",
        serviceType: ServiceType.Fiber,
        bandwidth: 500,
        requirements: "HIPAA-compliant network connection for new wing of hospital. Secure VPN access for remote staff.",
        assignedTo: team1.id,
        expectedCompletion: new Date("2025-04-30"),
        currentStage: ProjectStage.Confirmation,
        isCompleted: false,
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)   // 5 days ago
      },
      {
        projectId: "P-2025-0004",
        customerName: "Hilltop Vineyards",
        contactPerson: "Robert James",
        email: "robert@hilltopvineyards.com",
        phone: "555-987-6543",
        address: "1200 Vineyard Road, Napa Valley, CA 94558",
        serviceType: ServiceType.Wireless,
        bandwidth: 200,
        requirements: "Point-to-point wireless connection between main building and processing facility (2.5km apart). Weather-resistant equipment needed.",
        assignedTo: team3.id,
        expectedCompletion: new Date("2025-03-15"),
        currentStage: ProjectStage.Installation,
        isCompleted: false,
        createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)   // 2 days ago
      },
      {
        projectId: "P-2025-0005",
        customerName: "City College of San Francisco",
        contactPerson: "Maria Rodriguez",
        email: "mrodriguez@ccsf.edu",
        phone: "555-111-2222",
        address: "50 Education Drive, San Francisco, CA 94112",
        serviceType: ServiceType.Fiber,
        bandwidth: 2000,
        requirements: "Campus-wide fiber deployment connecting 5 buildings. Separate VLANs for staff, students, and administration.",
        assignedTo: team2.id,
        expectedCompletion: new Date("2025-02-28"),
        currentStage: ProjectStage.Handover,
        isCompleted: true,
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)   // 1 day ago
      }
    ];
    
    // Insert the projects
    const insertedProjects = await db.insert(projects).values(projectsData).returning();
    
    // Create stage history entries for each project
    console.log("Creating project stage history...");
    const historyEntries = [];
    
    for (const project of insertedProjects) {
      // All projects start at Requirements stage
      historyEntries.push({
        projectId: project.id,
        stage: ProjectStage.Requirements,
        notes: "Project initialized with requirements",
        changedBy: project.assignedTo,
        timestamp: new Date(project.createdAt)
      });
      
      // Add subsequent stage entries based on current stage
      if (project.currentStage >= ProjectStage.Survey) {
        const surveyDate = new Date(project.createdAt);
        surveyDate.setDate(surveyDate.getDate() + 3);
        historyEntries.push({
          projectId: project.id,
          stage: ProjectStage.Survey,
          notes: "Site survey completed. Location verified for installation.",
          changedBy: project.assignedTo,
          timestamp: surveyDate
        });
      }
      
      if (project.currentStage >= ProjectStage.Confirmation) {
        const confirmDate = new Date(project.createdAt);
        confirmDate.setDate(confirmDate.getDate() + 7);
        historyEntries.push({
          projectId: project.id,
          stage: ProjectStage.Confirmation,
          notes: "Customer confirmed project scope and costs.",
          changedBy: project.assignedTo,
          timestamp: confirmDate
        });
      }
      
      if (project.currentStage >= ProjectStage.Installation) {
        const installDate = new Date(project.createdAt);
        installDate.setDate(installDate.getDate() + 14);
        historyEntries.push({
          projectId: project.id,
          stage: ProjectStage.Installation,
          notes: "Equipment installed and initial testing completed.",
          changedBy: project.assignedTo,
          timestamp: installDate
        });
      }
      
      if (project.currentStage >= ProjectStage.Handover) {
        const handoverDate = new Date(project.createdAt);
        handoverDate.setDate(handoverDate.getDate() + 21);
        historyEntries.push({
          projectId: project.id,
          stage: ProjectStage.Handover,
          notes: "Service activated and handed over to NOC for monitoring.",
          changedBy: project.assignedTo,
          timestamp: handoverDate
        });
      }
    }
    
    await db.insert(projectStageHistory).values(historyEntries);
    
    // Add sample documents for each project
    console.log("Adding sample documents...");
    const documentEntries = [];
    
    for (const project of insertedProjects) {
      documentEntries.push({
        projectId: project.id,
        name: "Requirements Document",
        type: "pdf",
        url: "https://example.com/documents/requirements.pdf",
        uploadedAt: new Date(project.createdAt)
      });
      
      if (project.currentStage >= ProjectStage.Survey) {
        documentEntries.push({
          projectId: project.id,
          name: "Site Survey Report",
          type: "pdf",
          url: "https://example.com/documents/survey_report.pdf",
          uploadedAt: new Date(project.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
        });
      }
      
      if (project.currentStage >= ProjectStage.Confirmation) {
        documentEntries.push({
          projectId: project.id,
          name: "Service Agreement",
          type: "pdf",
          url: "https://example.com/documents/service_agreement.pdf",
          uploadedAt: new Date(project.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
      }
      
      if (project.currentStage >= ProjectStage.Installation) {
        documentEntries.push({
          projectId: project.id,
          name: "Network Topology",
          type: "pdf",
          url: "https://example.com/documents/network_topology.pdf",
          uploadedAt: new Date(project.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)
        });
      }
      
      if (project.currentStage >= ProjectStage.Handover) {
        documentEntries.push({
          projectId: project.id,
          name: "Service Handover Certificate",
          type: "pdf",
          url: "https://example.com/documents/handover_certificate.pdf",
          uploadedAt: new Date(project.createdAt.getTime() + 21 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    await db.insert(projectDocuments).values(documentEntries);
    
    // Add sample tasks for each project
    console.log("Creating sample tasks...");
    const taskEntries = [];
    
    for (const project of insertedProjects) {
      if (project.currentStage === ProjectStage.Requirements) {
        taskEntries.push({
          projectId: project.id,
          title: "Collect network diagrams",
          description: "Get network diagrams and requirements from the customer",
          assignedTo: project.assignedTo,
          stage: ProjectStage.Requirements,
          isCompleted: false,
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          createdAt: now
        });
      }
      
      if (project.currentStage === ProjectStage.Survey) {
        taskEntries.push({
          projectId: project.id,
          title: "Site survey",
          description: "Complete site survey and document findings",
          assignedTo: team3.id, // Field Technician
          stage: ProjectStage.Survey,
          isCompleted: false,
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
          createdAt: now
        });
      }
      
      if (project.currentStage === ProjectStage.Installation) {
        taskEntries.push({
          projectId: project.id,
          title: "Equipment installation",
          description: "Install all networking equipment according to plan",
          assignedTo: team3.id, // Field Technician
          stage: ProjectStage.Installation,
          isCompleted: false,
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
          createdAt: now
        });
        
        taskEntries.push({
          projectId: project.id,
          title: "Network configuration",
          description: "Configure all network devices and test connectivity",
          assignedTo: team2.id, // Network Engineer
          stage: ProjectStage.Installation,
          isCompleted: false,
          dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // Due in 4 days
          createdAt: now
        });
      }
      
      if (project.currentStage === ProjectStage.Handover) {
        taskEntries.push({
          projectId: project.id,
          title: "Schedule final verification",
          description: "Conduct final verification of all equipment and connections",
          assignedTo: team5.id, // NOC Engineer
          stage: ProjectStage.Handover,
          isCompleted: true,
          dueDate: new Date(project.updatedAt),
          createdAt: new Date(project.updatedAt.getTime() - 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    await db.insert(tasks).values(taskEntries);
    
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});