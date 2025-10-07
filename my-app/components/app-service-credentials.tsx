import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { type AppService } from '@/services/whatsapp';

interface AppServiceCredentialsProps {
  appServices: AppService[];
  selectedAppService: AppService | null;
  onSelectAppService: (appService: AppService) => void;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const AppServiceCredentials: React.FC<AppServiceCredentialsProps> = ({
  appServices,
  selectedAppService,
  onSelectAppService,
  loading,
  error,
  onRefresh,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAccessToken, setShowAccessToken] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAccessToken = (token: string) => {
    if (!token) return '';
    if (showAccessToken) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              WhatsApp Appservices
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading app services...</span>
          </div>
        )}

        {!loading && appServices.length === 0 && (
          <Alert>
            <AlertDescription>
              No appservices found for this organization. Please create one.
            </AlertDescription>
          </Alert>
        )}

        {!loading && appServices.length > 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="app-service">Active App Service</Label>
              <Select
                value={selectedAppService?.id.toString() || ''}
                onValueChange={(value) => {
                  const service = appServices.find(s => s.id.toString() === value);
                  if (service) onSelectAppService(service);
                }}
              >
                <SelectTrigger id="app-service">
                  <SelectValue placeholder="Select an app service" />
                </SelectTrigger>
                <SelectContent>
                  {appServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{service.name || service.phone_number}</span>
                        
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppServiceCredentials;
