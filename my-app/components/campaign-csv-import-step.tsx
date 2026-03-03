"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CampaignService } from '@/services/campaign';
import { useImportMappings } from '@/hooks/use-import-mappings';
import ImportMappingDialog from '@/components/import-mapping-dialog';
import Papa from 'papaparse';
import { logger } from "@/lib/logger";

interface CampaignCSVImportStepProps {
  campaignId: string;
  whatsappCampaignId: string;
  organizationId: string;
  channel: 'whatsapp' | 'sms' | 'email';
  templateId?: string;
  onImportSuccess: (result: any) => void;
  onSkip?: () => void;
}

export default function CampaignCSVImportStep({
  campaignId,
  whatsappCampaignId,
  organizationId,
  channel,
  templateId,
  onImportSuccess,
  onSkip,
}: CampaignCSVImportStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mappings, loading: mappingsLoading } = useImportMappings(organizationId, channel);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const [createIfNotExists, setCreateIfNotExists] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [exportingTemplate, setExportingTemplate] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please select a CSV or Excel file');
      return;
    }

    setSelectedFile(file);

    // Parse CSV to detect headers
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        preview: 1,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0] as string[];
            setCsvHeaders(headers);

            // Auto-select mapping if there's only one
            if (mappings.length === 1) {
              setSelectedMappingId(mappings[0].id);
            }
          }
        },
        error: (error) => {
          logger.error("Error parsing CSV", { error: error instanceof Error ? error.message : String(error) });
          toast.error('Failed to parse CSV file');
        },
      });
    }
  };

  const handleExportTemplate = async () => {
    try {
      setExportingTemplate(true);

      const blob = await CampaignService.exportParamsTemplate(
        whatsappCampaignId,
        organizationId,
        undefined,
        true // Include custom fields
      );

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-${campaignId}-template.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error) {
      logger.error("Error exporting template", { error: error instanceof Error ? error.message : String(error) });
      toast.error(error instanceof Error ? error.message : 'Failed to export template');
    } finally {
      setExportingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setUploading(true);

      const result = await CampaignService.importParamsTemplate(
        whatsappCampaignId,
        organizationId,
        selectedFile,
        createIfNotExists,
        selectedMappingId || undefined
      );

      toast.success(
        `Import successful! ${result.new_recipients_created} recipients added, ${result.updated_recipients} updated`
      );

      if (result.errors && result.errors.length > 0) {
        logger.warn("Import errors", { errors: result.errors });
        toast.warning(`${result.errors.length} row(s) had errors. Check console for details.`);
      }

      onImportSuccess(result);
    } catch (error) {
      logger.error("Error importing CSV", { error: error instanceof Error ? error.message : String(error) });
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenMappingDialog = () => {
    if (csvHeaders.length === 0) {
      toast.error('Please select a CSV file first');
      return;
    }
    setShowMappingDialog(true);
  };

  const handleMappingCreated = (mapping: any) => {
    setSelectedMappingId(mapping.id);
    toast.success('Mapping created and selected');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Recipients from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with recipient information and template parameters. You can use an import mapping to automatically map columns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Template Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 1: Download Template (Optional)</Label>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Download a CSV template with the correct columns for this campaign, including template parameters and custom fields.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportTemplate}
                    disabled={exportingTemplate}
                  >
                    {exportingTemplate ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Mapping Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 2: Select Import Mapping (Optional)</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={selectedMappingId || 'none'}
                  onValueChange={(value) => setSelectedMappingId(value === 'none' ? null : value)}
                  disabled={mappingsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mapping..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No mapping (use default)</SelectItem>
                    {mappings.map(mapping => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.name}
                        {mapping.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {mapping.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={handleOpenMappingDialog}
                disabled={csvHeaders.length === 0}
              >
                Create Mapping
              </Button>
            </div>
            {selectedMappingId && (
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Using import mapping. CSV columns will be automatically mapped to contact fields.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Step 3: Upload CSV File</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setCsvHeaders([]);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {csvHeaders.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Detected columns: {csvHeaders.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">CSV or Excel files only</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Import Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-if-not-exists"
                checked={createIfNotExists}
                onCheckedChange={(checked) => setCreateIfNotExists(!!checked)}
              />
              <Label htmlFor="create-if-not-exists" className="cursor-pointer font-normal">
                Create new contacts if they don&apos;t exist
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              If enabled, contacts not found in the system will be automatically created using the CSV data.
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              The CSV should include columns for phone numbers (required), names, emails, template parameters,
              and any custom fields. Use the template download feature to get the correct format.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip Import
              </Button>
            )}
            <Button
              onClick={handleImport}
              disabled={!selectedFile || uploading}
              className="ml-auto"
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Recipients
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Mapping Dialog */}
      <ImportMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        organizationId={organizationId}
        channel={channel}
        csvHeaders={csvHeaders}
        templateId={templateId}
        onMappingCreated={handleMappingCreated}
      />
    </div>
  );
}
