"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { getMappedValue, type CSVRow } from '@/lib/csv-transform-utils';

interface MappingPreviewPanelProps {
  template: any; // WhatsAppTemplate type
  csvData: CSVRow[];
  mappings: Record<string, string>;
  maxPreviews?: number;
}

export default function MappingPreviewPanel({
  template,
  csvData,
  mappings,
  maxPreviews = 3,
}: MappingPreviewPanelProps) {
  if (!template || !csvData.length) {
    return null;
  }

  // Extract template structure
  const templateStructure = template.template_structure;
  let bodyText = '';
  let headerText = '';

  // Parse template structure (support both array and object formats)
  if (Array.isArray(templateStructure)) {
    const bodyComponent = templateStructure.find((c: any) => c.type === 'BODY');
    const headerComponent = templateStructure.find((c: any) => c.type === 'HEADER');

    bodyText = bodyComponent?.text || '';
    headerText = headerComponent?.text || '';
  } else if (typeof templateStructure === 'object') {
    bodyText = templateStructure.body?.text || '';
    headerText = templateStructure.header?.text || '';
  }

  // Check if template has variables
  const hasVariables = bodyText.includes('{{') || headerText.includes('{{');


  // Preview a few recipients
  const previewCount = Math.min(csvData.length, maxPreviews);
  const previewData = csvData.slice(0, previewCount);

  // Detect if named or positional parameters
  const isNamedParams = /\{\{[a-zA-Z_]\w+\}\}/.test(bodyText);

  const renderPreview = (row: CSVRow, index: number) => {
    const phone = getMappedValue(row, mappings, 'phone');
    const fullname = getMappedValue(row, mappings, 'fullname');

    // Substitute variables in body
    let previewBody = bodyText;
    let previewHeader = headerText;
    let hasErrors = false;
    const missingParams: string[] = [];

    // Get all variables from body
    const bodyVariables = bodyText.match(/\{\{(\w+|\d+)\}\}/g) || [];
    const headerVariables = headerText.match(/\{\{(\w+|\d+)\}\}/g) || [];

    // Substitute body parameters
    if (isNamedParams) {
      // Named parameters
      bodyVariables.forEach((variable) => {
        const paramName = variable.replace(/[{}]/g, '');
        // Try to find mapping for this parameter
        const paramValue = getMappedValue(row, mappings, `body_${paramName}`) ||
                          getMappedValue(row, mappings, paramName);

        if (paramValue) {
          previewBody = previewBody.replace(variable, paramValue);
        } else {
          hasErrors = true;
          missingParams.push(paramName);
          previewBody = previewBody.replace(variable, `[${paramName}]`);
        }
      });
    } else {
      // Positional parameters
      bodyVariables.forEach((variable, idx) => {
        const paramValue = getMappedValue(row, mappings, `body_${idx}`);
        if (paramValue) {
          previewBody = previewBody.replace(variable, paramValue);
        } else {
          hasErrors = true;
          missingParams.push(`param_${idx + 1}`);
          previewBody = previewBody.replace(variable, `[param_${idx + 1}]`);
        }
      });
    }

    // Substitute header parameters
    headerVariables.forEach((variable, idx) => {
      const paramValue = getMappedValue(row, mappings, `header_${idx}`);
      if (paramValue) {
        previewHeader = previewHeader.replace(variable, paramValue);
      } else {
        previewHeader = previewHeader.replace(variable, `[header_${idx + 1}]`);
      }
    });

    return (
      <Card key={index} className={hasErrors ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                {fullname || phone || `Recipient ${index + 1}`}
              </CardTitle>
            </div>
            {hasErrors ? (
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                Incomplete
              </Badge>
            ) : (
              <Badge variant="outline" className="border-green-500 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
          {phone && (
            <CardDescription className="text-xs">
              To: {phone}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previewHeader && (
              <div className="border-l-2 border-blue-400 pl-3 py-1 bg-blue-50 rounded">
                <p className="text-xs text-muted-foreground mb-1">Header:</p>
                <p className="text-sm font-medium">{previewHeader}</p>
              </div>
            )}

            <div className="border-l-2 border-gray-400 pl-3 py-1">
              <p className="text-xs text-muted-foreground mb-1">Message:</p>
              <p className="text-sm whitespace-pre-wrap">{previewBody}</p>
            </div>

            {hasErrors && (
              <Alert className="bg-amber-100 border-amber-300">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">
                  Missing parameters: {missingParams.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Message Preview</h4>
        <Badge variant="secondary">
          {previewCount} of {csvData.length} recipient{csvData.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {previewData.map((row, index) => renderPreview(row, index))}
      </div>

      {csvData.length > maxPreviews && (
        <p className="text-xs text-muted-foreground text-center">
          +{csvData.length - maxPreviews} more recipient{csvData.length - maxPreviews > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
