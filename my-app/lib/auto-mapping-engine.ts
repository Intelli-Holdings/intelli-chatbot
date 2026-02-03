/**
 * Auto-mapping engine for intelligently mapping CSV columns to contact fields and template parameters
 */

export interface AutoMappingResult {
  mappings: Record<string, string>;      // targetField → csvColumn
  confidence: Record<string, number>;    // Score 0-1 par mapping
  suggestions: Array<{ target: string; column: string; score: number }>;
}

export interface FieldDefinition {
  value: string;  // Field key (e.g., 'phone', 'body_0', 'custom.loyalty')
  label: string;  // Display label
  required?: boolean;
}

export interface TemplateParamCounts {
  header: number;
  body: number;
  button: number;
}

/**
 * Field aliases for common variations
 */
const FIELD_ALIASES: Record<string, string[]> = {
  phone: ['mobile', 'telephone', 'tel', 'cell', 'phone_number', 'phonenumber', 'contact', 'numero'],
  fullname: ['name', 'full_name', 'customer_name', 'contact_name', 'displayname', 'nom', 'client', 'prenom'],
  email: ['mail', 'e-mail', 'email_address', 'emailaddress', 'courriel'],
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Normalize string for comparison
 * Removes special characters, converts to lowercase, removes spaces/underscores
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_\s-]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Check for exact match
 */
function exactMatch(csvHeader: string, targetField: string): boolean {
  return csvHeader.toLowerCase() === targetField.toLowerCase();
}

/**
 * Check for normalized match
 */
function normalizedMatch(csvHeader: string, targetField: string): boolean {
  return normalize(csvHeader) === normalize(targetField);
}

/**
 * Check for alias match
 */
function aliasMatch(csvHeader: string, targetFieldKey: string, aliases?: string[]): boolean {
  const normalizedHeader = normalize(csvHeader);

  // Check predefined aliases
  const predefinedAliases = FIELD_ALIASES[targetFieldKey] || [];
  if (predefinedAliases.some(alias => normalizedMatch(csvHeader, alias))) {
    return true;
  }

  // Check custom aliases if provided
  if (aliases) {
    return aliases.some(alias => normalizedMatch(csvHeader, alias));
  }

  return false;
}

/**
 * Calculate fuzzy match score using Levenshtein distance
 */
function fuzzyMatchScore(csvHeader: string, targetField: string): number {
  const distance = levenshteinDistance(
    normalize(csvHeader),
    normalize(targetField)
  );
  const maxLength = Math.max(csvHeader.length, targetField.length);
  const similarity = 1 - (distance / maxLength);

  return similarity > 0.7 ? similarity : 0;
}

/**
 * Find best match for a field from available CSV headers
 */
function findBestMatch(
  csvHeaders: string[],
  field: FieldDefinition,
  options: {
    allowFuzzyMatching: boolean;
    minConfidenceScore: number;
  }
): { csvColumn: string; score: number } | null {
  let bestMatch: { csvColumn: string; score: number } | null = null;

  const fieldKey = field.value;
  const fieldLabel = field.label;

  // Extract base key for alias matching (e.g., 'custom.loyalty' → 'loyalty')
  const baseKey = fieldKey.includes('.') ? fieldKey.split('.').pop() || fieldKey : fieldKey;

  for (const header of csvHeaders) {
    let score = 0;

    // Strategy 1: Exact match (score: 1.0)
    if (exactMatch(header, fieldKey) || exactMatch(header, fieldLabel) || exactMatch(header, baseKey)) {
      score = 1.0;
    }
    // Strategy 2: Normalized match (score: 0.95)
    else if (normalizedMatch(header, fieldKey) || normalizedMatch(header, fieldLabel) || normalizedMatch(header, baseKey)) {
      score = 0.95;
    }
    // Strategy 3: Alias match (score: 0.9)
    else if (aliasMatch(header, fieldKey) || aliasMatch(header, baseKey)) {
      score = 0.9;
    }
    // Strategy 4: Fuzzy match (score: 0.7-0.8)
    else if (options.allowFuzzyMatching) {
      score = Math.max(
        fuzzyMatchScore(header, fieldKey),
        fuzzyMatchScore(header, fieldLabel),
        fuzzyMatchScore(header, baseKey)
      );
    }

    if (score > (bestMatch?.score || 0)) {
      bestMatch = { csvColumn: header, score };
    }
  }

  return bestMatch;
}

/**
 * Main auto-mapping function
 * Maps CSV headers to contact fields and template parameters
 */
export function autoMapCSVToFields(
  csvHeaders: string[],
  contactFields: FieldDefinition[],
  templateParams: TemplateParamCounts,
  options: {
    prioritizeRequired?: boolean;
    allowFuzzyMatching?: boolean;
    minConfidenceScore?: number;
  } = {}
): AutoMappingResult {
  const {
    prioritizeRequired = true,
    allowFuzzyMatching = true,
    minConfidenceScore = 0.7,
  } = options;

  const mappings: Record<string, string> = {};
  const confidence: Record<string, number> = {};
  const suggestions: Array<{ target: string; column: string; score: number }> = [];

  let availableHeaders = [...csvHeaders];

  // Step 1: Map contact fields (prioritize required fields)
  const sortedContactFields = prioritizeRequired
    ? [...contactFields].sort((a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0))
    : contactFields;

  for (const field of sortedContactFields) {
    const targetKey = field.value;

    // Try matching strategies
    const match = findBestMatch(availableHeaders, field, {
      allowFuzzyMatching,
      minConfidenceScore,
    });

    if (match && match.score >= minConfidenceScore) {
      mappings[targetKey] = match.csvColumn;
      confidence[targetKey] = match.score;
      availableHeaders = availableHeaders.filter(h => h !== match.csvColumn);
    } else if (match && match.score > 0) {
      // Low confidence suggestion
      suggestions.push({
        target: targetKey,
        column: match.csvColumn,
        score: match.score,
      });
    }
  }

  // Step 2: Map template parameters using position-based strategy
  // This is a fallback for when headers don't match parameter names

  // Header parameters
  for (let i = 0; i < templateParams.header; i++) {
    const targetKey = `header_${i}`;

    // Try to find a match from remaining headers
    if (availableHeaders.length > 0) {
      // Use first available header (position-based)
      const header = availableHeaders[0];
      mappings[targetKey] = header;
      confidence[targetKey] = 0.5; // Low confidence for position-based
      availableHeaders = availableHeaders.slice(1);
    }
  }

  // Body parameters (most important)
  for (let i = 0; i < templateParams.body; i++) {
    const targetKey = `body_${i}`;

    if (availableHeaders.length > 0) {
      // Try to match common parameter names
      const paramMatch = availableHeaders.find(h => {
        const normalized = normalize(h);
        // Common parameter patterns
        return (
          normalized.includes('name') ||
          normalized.includes('nom') ||
          normalized.includes('prenom') ||
          normalized.includes('firstname') ||
          (i === 0 && (normalized.includes('customer') || normalized.includes('client'))) ||
          (i === 1 && (normalized.includes('order') || normalized.includes('commande') || normalized.includes('numero'))) ||
          normalized.includes(`param${i + 1}`) ||
          normalized.includes(`body${i + 1}`)
        );
      });

      if (paramMatch) {
        mappings[targetKey] = paramMatch;
        confidence[targetKey] = 0.8; // Good confidence for semantic match
        availableHeaders = availableHeaders.filter(h => h !== paramMatch);
      } else {
        // Position-based fallback
        const header = availableHeaders[0];
        mappings[targetKey] = header;
        confidence[targetKey] = 0.5;
        availableHeaders = availableHeaders.slice(1);
      }
    }
  }

  // Button parameters
  for (let i = 0; i < templateParams.button; i++) {
    const targetKey = `button_${i}`;

    if (availableHeaders.length > 0) {
      // Try to match URL/link patterns
      const urlMatch = availableHeaders.find(h => {
        const normalized = normalize(h);
        return (
          normalized.includes('url') ||
          normalized.includes('link') ||
          normalized.includes('lien') ||
          normalized.includes('tracking') ||
          normalized.includes('suivi') ||
          normalized.includes('http')
        );
      });

      if (urlMatch) {
        mappings[targetKey] = urlMatch;
        confidence[targetKey] = 0.85;
        availableHeaders = availableHeaders.filter(h => h !== urlMatch);
      } else {
        // Position-based fallback
        const header = availableHeaders[0];
        mappings[targetKey] = header;
        confidence[targetKey] = 0.5;
        availableHeaders = availableHeaders.slice(1);
      }
    }
  }

  return { mappings, confidence, suggestions };
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.9) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

/**
 * Get confidence color for UI
 */
export function getConfidenceColor(score: number): string {
  if (score >= 0.9) return 'green';
  if (score >= 0.7) return 'yellow';
  return 'orange';
}
