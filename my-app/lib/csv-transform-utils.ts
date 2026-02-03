/**
 * CSV transformation utilities for converting CSV data to API format
 */

export type CSVRow = Record<string, string>;

export interface RecipientWithParams {
  phone: string;
  fullname?: string;
  email?: string;
  template_params: {
    header_params: string[];
    body_params: string[];
    button_params: string[];
  };
}

export interface ParamCounts {
  header: number;
  body: number;
  button: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface TransformResult {
  recipients: RecipientWithParams[];
  errors: ValidationError[];
  validCount: number;
  invalidCount: number;
}

/**
 * Get mapped value from CSV row using column mappings
 */
export function getMappedValue(
  row: CSVRow,
  mappings: Record<string, string>,
  targetField: string
): string {
  const csvColumn = mappings[targetField];
  if (!csvColumn) return '';

  const value = row[csvColumn];
  return value ? value.trim() : '';
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove all whitespace and special characters except +
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Check E.164 format or standard phone format (10-15 digits)
  const e164Pattern = /^\+[1-9]\d{7,14}$/;
  const standardPattern = /^[1-9]\d{9,14}$/;

  return e164Pattern.test(cleaned) || standardPattern.test(cleaned);
}

/**
 * Format phone number to E.164 format if possible
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all whitespace and special characters except +
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // If it doesn't start with +, add default country code (you can customize this)
  if (!cleaned.startsWith('+')) {
    // Assume it's a valid number without country code
    // You might want to add logic to detect country codes here
    if (cleaned.length >= 10) {
      cleaned = '+' + cleaned;
    }
  }

  return cleaned;
}

/**
 * Validate that all required parameters have values
 */
function validateParameters(
  row: CSVRow,
  mappings: Record<string, string>,
  paramCounts: ParamCounts,
  rowIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate body parameters (usually required)
  for (let i = 0; i < paramCounts.body; i++) {
    const value = getMappedValue(row, mappings, `body_${i}`);
    if (!value || value.trim() === '') {
      errors.push({
        row: rowIndex,
        field: `body_${i}`,
        message: `Body parameter ${i + 1} is empty`,
        value: value,
      });
    }
  }

  return errors;
}

/**
 * Transform CSV data to recipients format for API
 */
export function transformCSVToRecipients(
  csvData: CSVRow[],
  mappings: Record<string, string>,
  paramCounts: ParamCounts,
  options: {
    validatePhone?: boolean;
    validateParams?: boolean;
    skipInvalidRows?: boolean;
  } = {}
): TransformResult {
  const {
    validatePhone = true,
    validateParams = true,
    skipInvalidRows = false,
  } = options;

  const recipients: RecipientWithParams[] = [];
  const errors: ValidationError[] = [];

  csvData.forEach((row, index) => {
    const rowNumber = index + 1; // 1-indexed for user display
    const rowErrors: ValidationError[] = [];

    // Extract phone number
    const phone = getMappedValue(row, mappings, 'phone');

    // Validate phone
    if (!phone) {
      rowErrors.push({
        row: rowNumber,
        field: 'phone',
        message: 'Phone number is required',
      });
    } else if (validatePhone && !isValidPhoneNumber(phone)) {
      rowErrors.push({
        row: rowNumber,
        field: 'phone',
        message: 'Invalid phone number format',
        value: phone,
      });
    }

    // Validate parameters if requested
    if (validateParams) {
      const paramErrors = validateParameters(row, mappings, paramCounts, rowNumber);
      rowErrors.push(...paramErrors);
    }

    // If there are errors and we're skipping invalid rows, add errors and continue
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      if (skipInvalidRows) {
        return; // Skip this row
      }
    }

    // Extract contact fields
    const fullname = getMappedValue(row, mappings, 'fullname');
    const email = getMappedValue(row, mappings, 'email');

    // Extract template parameters
    const header_params: string[] = [];
    for (let i = 0; i < paramCounts.header; i++) {
      const value = getMappedValue(row, mappings, `header_${i}`);
      header_params.push(value || '');
    }

    const body_params: string[] = [];
    for (let i = 0; i < paramCounts.body; i++) {
      const value = getMappedValue(row, mappings, `body_${i}`);
      body_params.push(value || '');
    }

    const button_params: string[] = [];
    for (let i = 0; i < paramCounts.button; i++) {
      const value = getMappedValue(row, mappings, `button_${i}`);
      button_params.push(value || '');
    }

    // Create recipient object
    const recipient: RecipientWithParams = {
      phone: formatPhoneNumber(phone),
      template_params: {
        header_params,
        body_params,
        button_params,
      },
    };

    // Add optional fields
    if (fullname) recipient.fullname = fullname;
    if (email) recipient.email = email;

    recipients.push(recipient);
  });

  return {
    recipients,
    errors,
    validCount: recipients.length,
    invalidCount: csvData.length - recipients.length,
  };
}

/**
 * Validate mappings before transformation
 */
export function validateMappings(
  mappings: Record<string, string>,
  csvHeaders: string[],
  requiredFields: string[]
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields are mapped
  requiredFields.forEach(field => {
    if (!mappings[field]) {
      errors.push(`Required field "${field}" must be mapped`);
    } else if (!csvHeaders.includes(mappings[field])) {
      errors.push(`Mapped column "${mappings[field]}" not found in CSV headers`);
    }
  });

  // Check for duplicate mappings (same CSV column mapped to multiple fields)
  const mappedColumns = Object.values(mappings);
  const duplicates = mappedColumns.filter(
    (col, idx) => mappedColumns.indexOf(col) !== idx
  );

  if (duplicates.length > 0) {
    const uniqueDuplicates = Array.from(new Set(duplicates));
    uniqueDuplicates.forEach(col => {
      warnings.push(`Column "${col}" is mapped to multiple fields`);
    });
  }

  // Check for unmapped CSV columns
  const unmappedColumns = csvHeaders.filter(h => !mappedColumns.includes(h));
  if (unmappedColumns.length > 0) {
    warnings.push(
      `${unmappedColumns.length} CSV column(s) are unmapped: ${unmappedColumns.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get required fields based on template parameters
 */
export function getRequiredFields(paramCounts: ParamCounts): string[] {
  const required = ['phone']; // Phone is always required

  // Body parameters are typically required
  for (let i = 0; i < paramCounts.body; i++) {
    required.push(`body_${i}`);
  }

  return required;
}

/**
 * Preview message with substituted values
 */
export function previewMessage(
  templateBody: string,
  bodyParams: string[],
  isNamedParams: boolean = false
): string {
  let preview = templateBody;

  if (isNamedParams) {
    // Named parameters: {{name}}, {{order}}
    bodyParams.forEach((value, index) => {
      const paramPattern = /\{\{(\w+)\}\}/;
      preview = preview.replace(paramPattern, value || `[param_${index + 1}]`);
    });
  } else {
    // Positional parameters: {{1}}, {{2}}
    bodyParams.forEach((value, index) => {
      const paramPattern = new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g');
      preview = preview.replace(paramPattern, value || `[param_${index + 1}]`);
    });
  }

  return preview;
}

/**
 * Extract custom field values from CSV row
 */
export function extractCustomFields(
  row: CSVRow,
  mappings: Record<string, string>
): Record<string, string> {
  const customFields: Record<string, string> = {};

  Object.entries(mappings).forEach(([targetField, csvColumn]) => {
    if (targetField.startsWith('custom.')) {
      const fieldKey = targetField.replace('custom.', '');
      const value = row[csvColumn];
      if (value) {
        customFields[fieldKey] = value.trim();
      }
    }
  });

  return customFields;
}
