// lib/employeeService.ts

import { toast } from "sonner";

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
        console.log("Invites sent successfully");
        toast.success("Invites sent successfully");
        
      } else {
        console.error("Failed to send invites");
        toast.error("Failed to send invites");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      
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
        console.error("Failed to fetch employees");
        toast.error("Failed to fetch employees");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }