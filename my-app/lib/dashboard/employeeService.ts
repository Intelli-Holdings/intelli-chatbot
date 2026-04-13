// lib/employeeService.ts

import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface Employee {
  id: string;
  email: string;
  role: string;
  organisation: string;
}

export async function sendInvites(emails: string[]) {
    try {
      const response = await fetch(
        "https://intelli-python-backend.onrender.com/dashboard/employees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emails: [] }),
        }
      );
  
      if (response.ok) {
        logger.info("Invites sent successfully");
        toast.success("Invites sent successfully");
        
      } else {
        logger.error("Failed to send invites");
        toast.error("Failed to send invites");
      }
    } catch (error) {
      logger.error("An error occurred while sending invites", { error: error instanceof Error ? error.message : String(error) });

    }
  }

  export async function getEmployees() {
    try {
      const response = await fetch(
        "https://intelli-python-backend.onrender.com/dashboard/employees"
      );
  
      if (response.ok) {
        const employees: Employee[] = await response.json();
        return employees;
      } else {
        logger.error("Failed to fetch employees");
        toast.error("Failed to fetch employees");
      }
    } catch (error) {
      logger.error("An error occurred while fetching employees", { error: error instanceof Error ? error.message : String(error) });
    }
  }