"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, Download, Users, FileText, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as ExcelJS from 'exceljs';

interface Contact {
  id?: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, string>;
  isValid: boolean;
  error?: string;
}

interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
  tags: string[];
}

interface BulkContactUploadProps {
  appService: any;
}

export default function BulkContactUpload({ appService }: BulkContactUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [validContacts, setValidContacts] = useState<Contact[]>([]);
  const [invalidContacts, setInvalidContacts] = useState<Contact[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'save'>('upload');
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedLists, setSavedLists] = useState<ContactList[]>([]);

  // Phone number validation
  const validatePhoneNumber = useCallback((phone: string): { isValid: boolean; formatted?: string; error?: string } => {
    if (!phone) return { isValid: false, error: 'Phone number is required' };
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check length (should be 10-15 digits)
    if (cleaned.length < 10) return { isValid: false, error: 'Phone number too short' };
    if (cleaned.length > 15) return { isValid: false, error: 'Phone number too long' };
    
    // Add country code if missing (assume +1 for US if 10 digits)
    let formatted = cleaned;
    if (cleaned.length === 10) {
      formatted = '1' + cleaned;
    }
    
    return { isValid: true, formatted: '+' + formatted };
  }, []);

  // Process contact data from parsed file
  const processContactData = useCallback((data: any[][]) => {
    if (data.length === 0) {
      toast.error('File is empty');
      setIsProcessing(false);
      return;
    }

    // Assume first row is headers if it contains common header terms
    const firstRow = data[0];
    const hasHeaders = firstRow.some((cell: any) => 
      typeof cell === 'string' && 
      /^(phone|name|email|first|last)/i.test(cell.toString())
    );

    const headers = hasHeaders ? data[0] : ['phone', 'firstName', 'lastName', 'email'];
    const rows = hasHeaders ? data.slice(1) : data;

    // Find phone column index
    const phoneColumnIndex = headers.findIndex((header: any) => 
      /phone|mobile|number/i.test(header?.toString() || '')
    );

    if (phoneColumnIndex === -1 && !hasHeaders) {
      // Assume first column is phone if no headers
      headers[0] = 'phone';
    }

    const processedContacts: Contact[] = [];
    let validCount = 0;
    let invalidCount = 0;

    rows.forEach((row: any[], index: number) => {
      setUploadProgress((index / rows.length) * 100);

      const phoneIndex = phoneColumnIndex >= 0 ? phoneColumnIndex : 0;
      const phone = row[phoneIndex]?.toString().trim();

      if (!phone) return;

      const validation = validatePhoneNumber(phone);
      const contact: Contact = {
        phoneNumber: validation.formatted || phone,
        firstName: row[headers.findIndex((h: any) => /first|fname/i.test(h?.toString() || ''))] || '',
        lastName: row[headers.findIndex((h: any) => /last|lname|surname/i.test(h?.toString() || ''))] || '',
        email: row[headers.findIndex((h: any) => /email/i.test(h?.toString() || ''))] || '',
        isValid: validation.isValid,
        error: validation.error,
        customFields: {}
      };

      // Add other columns as custom fields
      headers.forEach((header: any, headerIndex: number) => {
        if (headerIndex !== phoneIndex && 
            !/(first|last|fname|lname|email|surname)/i.test(header?.toString() || '') &&
            row[headerIndex]) {
          if (contact.customFields) {
            contact.customFields[header?.toString() || `field_${headerIndex}`] = row[headerIndex]?.toString() || '';
          }
        }
      });

      processedContacts.push(contact);
      
      if (validation.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    });

    setContacts(processedContacts);
    setValidContacts(processedContacts.filter(c => c.isValid));
    setInvalidContacts(processedContacts.filter(c => !c.isValid));
    setIsProcessing(false);
    setCurrentStep('review');

    toast.success(`Processed ${processedContacts.length} contacts: ${validCount} valid, ${invalidCount} invalid`);
  }, [validatePhoneNumber]);

  // Process uploaded file
  const handleFile = useCallback(async (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      let data: any[][] = [];

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(file, {
          complete: (results) => {
            data = results.data as any[][];
            processContactData(data);
          },
          header: false,
          skipEmptyLines: true,
          error: (error) => {
            console.error('CSV parsing error:', error);
            toast.error('Failed to parse CSV file');
            setIsProcessing(false);
          }
        });
      } else {
        // Parse Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.getWorksheet(1);
        
        if (worksheet) {
          data = [];
          worksheet.eachRow((row, rowNumber) => {
            const rowData: any[] = [];
            row.eachCell((cell, colNumber) => {
              rowData[colNumber - 1] = cell.value;
            });
            data.push(rowData);
          });
        }
        processContactData(data);
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
      setIsProcessing(false);
    }
  }, [processContactData]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  // Handle file selection
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Remove contact from list
  const removeContact = (index: number) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
    setValidContacts(newContacts.filter(c => c.isValid));
    setInvalidContacts(newContacts.filter(c => !c.isValid));
  };

  // Save contacts to database
  const saveContacts = async () => {
    if (!appService || validContacts.length === 0) {
      toast.error('No valid contacts to save');
      return;
    }

    if (!listName.trim()) {
      toast.error('Please provide a list name');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const response = await fetch('/api/contacts/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appServiceId: appService.id,
          listName: listName.trim(),
          description: listDescription.trim(),
          tags: selectedTags,
          contacts: validContacts
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save contacts');
      }

      const result = await response.json();
      
      toast.success(`Successfully saved ${validContacts.length} contacts to "${listName}"`);
      
      // Reset form
      setContacts([]);
      setValidContacts([]);
      setInvalidContacts([]);
      setUploadedFile(null);
      setListName('');
      setListDescription('');
      setSelectedTags([]);
      setCurrentStep('upload');
      
      // Refresh saved lists
      fetchSavedLists();
      
    } catch (error) {
      console.error('Error saving contacts:', error);
      toast.error('Failed to save contacts');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch saved contact lists
  const fetchSavedLists = useCallback(async () => {
    if (!appService) return;

    try {
      const response = await fetch(`/api/contacts/lists?appServiceId=${appService.id}`);
      if (response.ok) {
        const lists = await response.json();
        setSavedLists(lists);
      }
    } catch (error) {
      console.error('Error fetching contact lists:', error);
    }
  }, [appService]);

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = "phone,firstName,lastName,email,company,notes\n+1234567890,John,Doe,john@example.com,Acme Corp,Sample contact";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    fetchSavedLists();
  }, [fetchSavedLists]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Contact Management</h2>
          <p className="text-muted-foreground">
            Upload and manage your contact lists for broadcast campaigns
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Contacts
            </CardTitle>
            <CardDescription>
              Upload a CSV or Excel file containing your contact list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-gray-400'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
              
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <div>
                    <p className="font-medium">Processing file...</p>
                    <Progress value={uploadProgress} className="w-64 mx-auto mt-2" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium">
                      {uploadedFile ? uploadedFile.name : 'Drop your file here or click to browse'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV and Excel files (.csv, .xlsx, .xls)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>File Format:</strong> Ensure your file has a column for phone numbers. 
                Optionally include firstName, lastName, email, and other custom fields.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {currentStep === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review Contacts
              </CardTitle>
              <CardDescription>
                Review and validate your uploaded contacts before saving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Contacts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Valid Contacts</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{invalidContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Invalid Contacts</div>
                </div>
              </div>

              {contacts.length > 0 && (
                <div className="max-h-96 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.slice(0, 100).map((contact, index) => (
                        <TableRow key={index} className={!contact.isValid ? 'bg-red-50' : ''}>
                          <TableCell>
                            {contact.isValid ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Valid
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <X className="h-3 w-3 mr-1" />
                                Invalid
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono">{contact.phoneNumber}</TableCell>
                          <TableCell>
                            {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || '-'}
                          </TableCell>
                          <TableCell>{contact.email || '-'}</TableCell>
                          <TableCell className="text-red-600 text-sm">
                            {contact.error || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeContact(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {contacts.length > 100 && (
                    <div className="p-4 text-center text-muted-foreground">
                      Showing first 100 contacts. {contacts.length - 100} more contacts...
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('upload');
                    setContacts([]);
                    setUploadedFile(null);
                  }}
                >
                  Upload Different File
                </Button>
                <Button
                  onClick={() => setCurrentStep('save')}
                  disabled={validContacts.length === 0}
                >
                  Continue to Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'save' && (
        <Card>
          <CardHeader>
            <CardTitle>Save Contact List</CardTitle>
            <CardDescription>
              Provide details for your contact list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listName">List Name *</Label>
                <Input
                  id="listName"
                  placeholder="e.g., Newsletter Subscribers"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listDescription">Description</Label>
                <Input
                  id="listDescription"
                  placeholder="Optional description"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <Input
                placeholder="Add tags separated by commas"
                value={selectedTags.join(', ')}
                onChange={(e) => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;re about to save <strong>{validContacts.length}</strong> valid contacts to your contact list.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('review')}
              >
                Back to Review
              </Button>
              <Button
                onClick={saveContacts}
                disabled={isProcessing || !listName.trim() || validContacts.length === 0}
              >
                {isProcessing ? 'Saving...' : `Save ${validContacts.length} Contacts`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Contact Lists */}
      {savedLists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Saved Contact Lists
            </CardTitle>
            <CardDescription>
              Your existing contact lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLists.map((list) => (
                <Card key={list.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{list.name}</h4>
                      <Badge variant="outline">{list.contactCount}</Badge>
                    </div>
                    {list.description && (
                      <p className="text-sm text-muted-foreground mb-2">{list.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                    </div>
                    {list.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {list.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
