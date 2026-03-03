import { useState, useEffect } from 'react';
import { WhatsAppService, type AppService } from '@/services/whatsapp';
import useActiveOrganizationId from './use-organization-id';
import { logger } from "@/lib/logger";

export interface UseAppServicesReturn {
  appServices: AppService[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedAppService: AppService | null;
  setSelectedAppService: (appService: AppService | null) => void;
}

/**
 * Custom hook to fetch and manage WhatsApp app services for an organization
 */
export const useAppServices = (): UseAppServicesReturn => {
  const organizationId = useActiveOrganizationId();
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppService, setSelectedAppService] = useState<AppService | null>(null);

  const fetchAppServices = async () => {
    if (!organizationId) {
      setError('Organization ID not available. Please ensure you are logged in and have an active organization.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const services = await WhatsAppService.fetchAppServices(organizationId);
      setAppServices(services);
      
      // Auto-select the first app service if available and none is selected
      if (services.length > 0 && !selectedAppService) {
        setSelectedAppService(services[0]);
      } else if (services.length === 0) {
        // Provide helpful message when no services are found
        setError('No WhatsApp services found for this organization. Please configure a WhatsApp Business account first.');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch app services';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the API server. Please ensure the backend service is running.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      logger.error('Error fetching app services', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchAppServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return {
    appServices,
    loading,
    error,
    refetch: fetchAppServices,
    selectedAppService,
    setSelectedAppService,
  };
};

export default useAppServices;
