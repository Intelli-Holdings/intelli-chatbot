import { useState, useEffect } from 'react';
import { WhatsAppService, type AppService } from '@/services/whatsapp';
import useActiveOrganizationId from './use-organization-id';

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
      setError('Organization ID not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const services = await WhatsAppService.fetchAppServices(organizationId);
      setAppServices(services);
      
      // Auto-select the first app service if available
      if (services.length > 0 && !selectedAppService) {
        setSelectedAppService(services[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch app services';
      setError(errorMessage);
      console.error('Error fetching app services:', err);
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
