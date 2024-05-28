"use client"

import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  organisation: string;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://intelli-python-backend.onrender.com/dashboard/employees/");
        const data = await response.json();
          setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees", error);
      }       
    };

    fetchEmployees();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees List</CardTitle>
        <CardDescription>
          View all employees in your organisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
              
                  {/* 

                  <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    {employee.role} <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                </PopoverContent>
              </Popover>                 
                   */}
                
            </div>
          ))
        ) : (
          <p>No employees found.</p>
        )}
      </CardContent>
    </Card>
  );
}