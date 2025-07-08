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

  const getStatusColor = (status: string) => {
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
              WhatsApp App Services
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Manage your WhatsApp Business API credentials and configuration
            </CardDescription>
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
              No WhatsApp app services found for this organization. Please configure your WhatsApp Business API integration.
            </AlertDescription>
          </Alert>
        )}

        {!loading && appServices.length > 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="app-service">Select App Service</Label>
              <Select
                value={selectedAppService?.id || ''}
                onValueChange={(value) => {
                  const service = appServices.find(s => s.id === value);
                  if (service) onSelectAppService(service);
                }}
              >
                <SelectTrigger id="app-service">
                  <SelectValue placeholder="Select an app service" />
                </SelectTrigger>
                <SelectContent>
                  {appServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center gap-2">
                        <span>{service.name}</span>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAppService && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-name">Service Name</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="service-name"
                          value={selectedAppService.name}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedAppService.name, 'name')}
                        >
                          {copiedField === 'name' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-status">Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedAppService.status)}>
                          {selectedAppService.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waba-id">WABA ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="waba-id"
                        value={selectedAppService.wabaId}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedAppService.wabaId, 'wabaId')}
                      >
                        {copiedField === 'wabaId' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp Business Account ID for template management
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-number-id">Phone Number ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="phone-number-id"
                        value={selectedAppService.phoneNumberId}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedAppService.phoneNumberId, 'phoneNumberId')}
                      >
                        {copiedField === 'phoneNumberId' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Phone Number ID for sending messages
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access-token">Access Token</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="access-token"
                        value={formatAccessToken(selectedAppService.accessToken)}
                        readOnly
                        className="font-mono"
                        type={showAccessToken ? 'text' : 'password'}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                      >
                        {showAccessToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedAppService.accessToken, 'accessToken')}
                      >
                        {copiedField === 'accessToken' ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Access token for WhatsApp Business API authentication
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppServiceCredentials;
