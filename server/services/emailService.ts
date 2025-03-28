import sgMail from '@sendgrid/mail';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { Project, TeamMember, TeamMemberRole } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { teamMembers } from '@shared/schema';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('SendGrid API initialized successfully');
} else {
  console.warn('SendGrid API key not provided, email notifications will be disabled');
}

// Define SendGrid-specific error type for better error handling
interface SendGridError extends Error {
  response?: {
    body?: any;
    statusCode?: number;
  };
}

// Create email templates directory if it doesn't exist
// Using import.meta.url instead of __dirname for ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templatesDir = path.join(__dirname, '..', '..', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Create email templates if they don't exist
const newProjectTemplateFile = path.join(templatesDir, 'new-project-email.html');
const updatedProjectTemplateFile = path.join(templatesDir, 'updated-project-email.html');

if (!fs.existsSync(newProjectTemplateFile)) {
  const newProjectTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Project Notification</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, #4F46E5, #06B6D4); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
      .content { border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px; }
      .footer { margin-top: 20px; font-size: 12px; color: #888; }
      .button { display: inline-block; background: linear-gradient(to right, #4F46E5, #06B6D4); color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Project Created</h1>
      </div>
      <div class="content">
        <p>Hello {{recipientName}},</p>
        <p>A new project has been created and requires your attention:</p>
        <ul>
          <li><strong>Project ID:</strong> {{projectId}}</li>
          <li><strong>Customer:</strong> {{customerName}}</li>
          <li><strong>Service Type:</strong> {{serviceType}}</li>
          <li><strong>Current Stage:</strong> {{currentStage}}</li>
        </ul>
        <p>Please review the project details and take necessary actions.</p>
        <a href="{{projectUrl}}" class="button">View Project</a>
      </div>
      <div class="footer">
        <p>This is an automated message from the ISP Project Management System.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  fs.writeFileSync(newProjectTemplateFile, newProjectTemplate);
}

if (!fs.existsSync(updatedProjectTemplateFile)) {
  const updatedProjectTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Project Updated Notification</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(to right, #4F46E5, #06B6D4); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
      .content { border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px; }
      .footer { margin-top: 20px; font-size: 12px; color: #888; }
      .button { display: inline-block; background: linear-gradient(to right, #4F46E5, #06B6D4); color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Project Updated</h1>
      </div>
      <div class="content">
        <p>Hello {{recipientName}},</p>
        <p>A project has been updated and requires your attention:</p>
        <ul>
          <li><strong>Project ID:</strong> {{projectId}}</li>
          <li><strong>Customer:</strong> {{customerName}}</li>
          <li><strong>Service Type:</strong> {{serviceType}}</li>
          <li><strong>Current Stage:</strong> {{currentStage}}</li>
          <li><strong>Update Type:</strong> {{updateType}}</li>
        </ul>
        <p>Please review the project updates and take necessary actions.</p>
        <a href="{{projectUrl}}" class="button">View Project</a>
      </div>
      <div class="footer">
        <p>This is an automated message from the ISP Project Management System.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  fs.writeFileSync(updatedProjectTemplateFile, updatedProjectTemplate);
}

/**
 * Compiles a template with provided data
 */
function compileTemplate(templatePath: string, data: any): string {
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateSource);
  return template(data);
}

/**
 * Get team members to notify based on role and project details
 */
async function getTeamMembersToNotify(project: Project): Promise<TeamMember[]> {
  // Get team members with Project Manager or Network Engineer roles
  // You can customize this based on which roles should be notified
  const notificationRoles = [
    TeamMemberRole.ProjectManager, 
    TeamMemberRole.NetworkEngineer
  ];
  
  const teamMembersToNotify = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.role, notificationRoles[0]))
    .then((members) => {
      if (notificationRoles.length > 1) {
        return Promise.all(
          notificationRoles.slice(1).map(role => 
            db.select().from(teamMembers).where(eq(teamMembers.role, role))
          )
        ).then(results => results.reduce((acc, curr) => [...acc, ...curr], members));
      }
      return members;
    });
  
  return teamMembersToNotify;
}

/**
 * Send an email notification about a new project
 */
export async function sendNewProjectNotification(project: Project): Promise<void> {
  // Skip if SendGrid API key is not configured
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not provided, skipping email notification');
    return;
  }
  
  try {
    const recipientsTeamMembers = await getTeamMembersToNotify(project);
    
    if (recipientsTeamMembers.length === 0) {
      console.warn('No team members to notify about new project');
      return;
    }
    
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const projectUrl = `${baseUrl}/#/dashboard`;
    
    for (const recipient of recipientsTeamMembers) {
      if (!recipient.email) {
        console.warn(`Team member ${recipient.name} has no email address`);
        continue;
      }
      
      const emailData = {
        recipientName: recipient.name,
        projectId: project.projectId,
        customerName: project.customerName,
        serviceType: project.serviceType,
        currentStage: `Stage ${project.currentStage}`,
        projectUrl
      };
      
      const htmlContent = compileTemplate(newProjectTemplateFile, emailData);
      
      const msg = {
        to: recipient.email,
        from: process.env.EMAIL_FROM || 'noreply@ispprojectmanager.com', // Must be verified in SendGrid
        subject: `New Project Created - ${project.projectId} - ${project.customerName}`,
        html: htmlContent,
      };
      
      try {
        const response = await sgMail.send(msg);
        console.log(`New project notification sent to ${recipient.email}`);
        console.log(`SendGrid response status code: ${response[0].statusCode}`);
        console.log(`SendGrid response headers: ${JSON.stringify(response[0].headers)}`);
      } catch (sendErr: any) {
        console.error(`Failed to send email to ${recipient.email}:`, sendErr);
        if (sendErr.response) {
          console.error(`SendGrid API error details: ${JSON.stringify(sendErr.response.body)}`);
        }
      }
    }
  } catch (error: any) {
    console.error('Error sending new project notification:', error);
    if (error.response) {
      console.error('SendGrid API error:', error.response.body);
    }
  }
}

/**
 * Send an email notification about a project update
 */
export async function sendProjectUpdateNotification(
  project: Project, 
  updateType: 'details' | 'stage' | 'document'
): Promise<void> {
  // Skip if SendGrid API key is not configured
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not provided, skipping email notification');
    return;
  }
  
  try {
    const recipientsTeamMembers = await getTeamMembersToNotify(project);
    
    if (recipientsTeamMembers.length === 0) {
      console.warn('No team members to notify about project update');
      return;
    }
    
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const projectUrl = `${baseUrl}/#/dashboard`;
    
    // Convert update type to user-friendly message
    let updateTypeMessage: string;
    switch (updateType) {
      case 'details':
        updateTypeMessage = 'Project details updated';
        break;
      case 'stage':
        updateTypeMessage = `Advanced to Stage ${project.currentStage}`;
        break;
      case 'document':
        updateTypeMessage = 'New document added';
        break;
      default:
        updateTypeMessage = 'General update';
    }
    
    for (const recipient of recipientsTeamMembers) {
      if (!recipient.email) {
        console.warn(`Team member ${recipient.name} has no email address`);
        continue;
      }
      
      const emailData = {
        recipientName: recipient.name,
        projectId: project.projectId,
        customerName: project.customerName,
        serviceType: project.serviceType,
        currentStage: `Stage ${project.currentStage}`,
        updateType: updateTypeMessage,
        projectUrl
      };
      
      const htmlContent = compileTemplate(updatedProjectTemplateFile, emailData);
      
      const msg = {
        to: recipient.email,
        from: process.env.EMAIL_FROM || 'noreply@ispprojectmanager.com', // Must be verified in SendGrid
        subject: `Project Updated - ${project.projectId} - ${project.customerName}`,
        html: htmlContent,
      };
      
      try {
        const response = await sgMail.send(msg);
        console.log(`Project update notification sent to ${recipient.email}`);
        console.log(`SendGrid response status code: ${response[0].statusCode}`);
        console.log(`SendGrid response headers: ${JSON.stringify(response[0].headers)}`);
      } catch (sendErr: any) {
        console.error(`Failed to send email to ${recipient.email}:`, sendErr);
        if (sendErr.response) {
          console.error(`SendGrid API error details: ${JSON.stringify(sendErr.response.body)}`);
        }
      }
    }
  } catch (error: any) {
    console.error('Error sending project update notification:', error);
    if (error.response) {
      console.error('SendGrid API error:', error.response.body);
    }
  }
}

// Check if email service is properly configured
export function checkEmailConfiguration(): boolean {
  return !!(
    process.env.SENDGRID_API_KEY && 
    process.env.EMAIL_FROM
  );
}