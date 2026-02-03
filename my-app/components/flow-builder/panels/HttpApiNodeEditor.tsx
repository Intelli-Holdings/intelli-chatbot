'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Loader2, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HttpApiNodeData, HttpMethod, BodyType, HttpHeader, AuthType, HttpAuth } from '../nodes/HttpApiNode';
import { toast } from 'sonner';

interface HttpApiNodeEditorProps {
  data: HttpApiNodeData;
  onUpdate: (data: Partial<HttpApiNodeData>) => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function HttpApiNodeEditor({ data, onUpdate }: HttpApiNodeEditorProps) {
  // Local state for form fields
  const [method, setMethod] = useState<HttpMethod>(data.method || 'GET');
  const [url, setUrl] = useState(data.url || '');
  const [headers, setHeaders] = useState<HttpHeader[]>(data.headers || []);
  const [body, setBody] = useState(data.body || '');
  const [bodyType, setBodyType] = useState<BodyType>(data.bodyType || 'json');
  const [responseVariable, setResponseVariable] = useState(data.responseVariable || '');
  const [timeoutValue, setTimeoutValue] = useState(data.timeout || 30);
  const [auth, setAuth] = useState<HttpAuth>(data.auth || { type: 'none' });

  // UI state
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    data?: unknown;
    error?: string;
  } | null>(null);

  // Reset local state when data prop changes
  useEffect(() => {
    setMethod(data.method || 'GET');
    setUrl(data.url || '');
    setHeaders(data.headers || []);
    setBody(data.body || '');
    setBodyType(data.bodyType || 'json');
    setResponseVariable(data.responseVariable || '');
    setTimeoutValue(data.timeout || 30);
    setAuth(data.auth || { type: 'none' });
    setIsDirty(false);
    setTestResult(null);
  }, [data]);

  const markDirty = () => {
    setIsDirty(true);
    setShowSaved(false);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
    markDirty();
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };
    setHeaders(updated);
    markDirty();
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
    markDirty();
  };

  const handleSave = () => {
    onUpdate({
      method,
      url,
      headers: headers.filter(h => h.key.trim() !== ''), // Remove empty headers
      body,
      bodyType,
      responseVariable,
      timeout: timeoutValue,
      auth,
    });
    setIsDirty(false);
    setShowSaved(true);
    window.setTimeout(() => setShowSaved(false), 2000);
    toast.success('HTTP API configuration saved');
  };

  const handleTest = async () => {
    if (!url) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Prepare request options
      const requestHeaders: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim()) {
          requestHeaders[h.key] = h.value;
        }
      });

      // Add auth headers
      if (auth.type === 'basic' && auth.username && auth.password) {
        const credentials = btoa(`${auth.username}:${auth.password}`);
        requestHeaders['Authorization'] = `Basic ${credentials}`;
      } else if (auth.type === 'bearer' && auth.token) {
        requestHeaders['Authorization'] = `Bearer ${auth.token}`;
      } else if (auth.type === 'api_key' && auth.apiKey && auth.apiKeyHeader) {
        requestHeaders[auth.apiKeyHeader] = auth.apiKey;
      }

      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body && bodyType !== 'none') {
        if (bodyType === 'json') {
          requestHeaders['Content-Type'] = 'application/json';
          fetchOptions.headers = requestHeaders;
          fetchOptions.body = body;
        } else if (bodyType === 'form') {
          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
          fetchOptions.headers = requestHeaders;
          fetchOptions.body = body;
        }
      }

      // Use our proxy API to make the request
      const response = await fetch('/api/flow/test-http', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          headers: requestHeaders,
          body: body || undefined,
          bodyType,
          timeout: timeoutValue,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          status: result.status,
          data: result.data,
        });
        toast.success(`Request successful (${result.status})`);
      } else {
        setTestResult({
          success: false,
          error: result.error || 'Request failed',
        });
        toast.error(result.error || 'Request failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({
        success: false,
        error: errorMessage,
      });
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      setIsTesting(false);
    }
  };

  const showBody = method !== 'GET';

  return (
    <div className="space-y-4">
      {/* HTTP Method */}
      <div className="space-y-2">
        <Label>HTTP Method</Label>
        <Select
          value={method}
          onValueChange={(value: HttpMethod) => {
            setMethod(value);
            markDirty();
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            markDirty();
          }}
          placeholder="https://api.example.com/endpoint"
        />
        <p className="text-xs text-muted-foreground">
          Use {'{{variable}}'} for dynamic values
        </p>
      </div>

      {/* Headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Headers</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddHeader}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {headers.length > 0 ? (
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={header.key}
                  onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1"
                />
                <Input
                  value={header.value}
                  onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveHeader(index)}
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No headers configured</p>
        )}
      </div>

      {/* Authentication */}
      <div className="space-y-2">
        <Label>Authentication</Label>
        <Select
          value={auth.type}
          onValueChange={(value: AuthType) => {
            setAuth({ type: value });
            markDirty();
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select auth type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="api_key">API Key</SelectItem>
          </SelectContent>
        </Select>

        {/* Basic Auth Fields */}
        {auth.type === 'basic' && (
          <div className="space-y-2 pt-2">
            <Input
              value={auth.username || ''}
              onChange={(e) => {
                setAuth({ ...auth, username: e.target.value });
                markDirty();
              }}
              placeholder="Username"
            />
            <Input
              type="password"
              value={auth.password || ''}
              onChange={(e) => {
                setAuth({ ...auth, password: e.target.value });
                markDirty();
              }}
              placeholder="Password"
            />
          </div>
        )}

        {/* Bearer Token Field */}
        {auth.type === 'bearer' && (
          <div className="pt-2">
            <Input
              type="password"
              value={auth.token || ''}
              onChange={(e) => {
                setAuth({ ...auth, token: e.target.value });
                markDirty();
              }}
              placeholder="Bearer token"
            />
          </div>
        )}

        {/* API Key Fields */}
        {auth.type === 'api_key' && (
          <div className="space-y-2 pt-2">
            <Input
              value={auth.apiKeyHeader || ''}
              onChange={(e) => {
                setAuth({ ...auth, apiKeyHeader: e.target.value });
                markDirty();
              }}
              placeholder="Header name (e.g., X-API-Key)"
            />
            <Input
              type="password"
              value={auth.apiKey || ''}
              onChange={(e) => {
                setAuth({ ...auth, apiKey: e.target.value });
                markDirty();
              }}
              placeholder="API key value"
            />
          </div>
        )}
      </div>

      {/* Body (for non-GET methods) */}
      {showBody && (
        <>
          <div className="space-y-2">
            <Label>Body Type</Label>
            <Select
              value={bodyType}
              onValueChange={(value: BodyType) => {
                setBodyType(value);
                markDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="form">Form Data</SelectItem>
                <SelectItem value="none">No Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bodyType !== 'none' && (
            <div className="space-y-2">
              <Label>Request Body</Label>
              <Textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  markDirty();
                }}
                placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'key=value&key2=value2'}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{variable}}'} for dynamic values
              </p>
            </div>
          )}
        </>
      )}

      {/* Response Variable */}
      <div className="space-y-2">
        <Label>Store Response In</Label>
        <Input
          value={responseVariable}
          onChange={(e) => {
            setResponseVariable(e.target.value);
            markDirty();
          }}
          placeholder="api_response"
        />
        <p className="text-xs text-muted-foreground">
          Variable name to store the API response
        </p>
      </div>

      {/* Timeout */}
      <div className="space-y-2">
        <Label>Timeout (seconds)</Label>
        <Input
          type="number"
          value={timeoutValue}
          onChange={(e) => {
            setTimeoutValue(parseInt(e.target.value) || 30);
            markDirty();
          }}
          min={1}
          max={120}
        />
      </div>

      {/* Test Button */}
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={isTesting || !url}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Test Request
            </>
          )}
        </Button>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-md text-sm ${
              testResult.success
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="font-medium">
                {testResult.success
                  ? `Success (${testResult.status})`
                  : 'Error'}
              </span>
            </div>
            {testResult.success && testResult.data !== undefined && (
              <pre className="mt-2 text-xs bg-white/50 dark:bg-black/20 p-2 rounded overflow-auto max-h-32">
                {(() => {
                  const jsonStr = JSON.stringify(testResult.data, null, 2);
                  return jsonStr.length > 500 ? jsonStr.substring(0, 500) + '...' : jsonStr;
                })()}
              </pre>
            )}
            {!testResult.success && testResult.error && (
              <p className="text-xs mt-1">{testResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      {isDirty && (
        <Button onClick={handleSave} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      )}

      {showSaved && !isDirty && (
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>Saved</span>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">HTTP API Node</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Makes HTTP requests to external APIs. Use the <strong>success</strong> output
          for successful responses and <strong>error</strong> output for failed requests.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Access response data in subsequent nodes using{' '}
          <code className="bg-muted px-1 rounded">{`{{${responseVariable || 'variable'}}}`}</code>
        </p>
      </div>
    </div>
  );
}
