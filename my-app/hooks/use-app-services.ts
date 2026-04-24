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

// Persist the user's AppService pick per organization. Without this, reloading
// the page resets the selection to "first WhatsApp service found", which is
// wrong for orgs with multiple WABAs.
const STORAGE_PREFIX = 'intelli.selectedAppServiceId';
const storageKeyFor = (orgId: string) => `${STORAGE_PREFIX}.${orgId}`;

const readStoredSelection = (orgId: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(storageKeyFor(orgId));
  } catch {
    return null;
  }
};

const writeStoredSelection = (orgId: string, appServiceId: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (appServiceId) {
      window.localStorage.setItem(storageKeyFor(orgId), appServiceId);
    } else {
      window.localStorage.removeItem(storageKeyFor(orgId));
    }
  } catch {
    // Ignore quota / privacy-mode failures — falls back to auto-pick.
  }
};

/**
 * Custom hook to fetch and manage app services (WhatsApp, Instagram) for an organization
 */
export const useAppServices = (): UseAppServicesReturn => {
  const organizationId = useActiveOrganizationId();
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppService, setSelectedAppServiceState] = useState<AppService | null>(null);

  const setSelectedAppService = (service: AppService | null) => {
    setSelectedAppServiceState(service);
    if (organizationId) {
      writeStoredSelection(organizationId, service?.id ? String(service.id) : null);
    }
  };

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

      // Selection priority: persisted choice (if still valid) -> first WhatsApp
      // service -> first service. This keeps the user's explicit pick across
      // reloads and prevents silent switches when the backend reorders results.
      if (services.length > 0) {
        const storedId = readStoredSelection(organizationId);
        const persisted = storedId
          ? services.find((s) => String(s.id) === storedId)
          : null;
        setSelectedAppServiceState((prev) => {
          if (prev && services.some((s) => String(s.id) === String(prev.id))) {
            return prev;
          }
          if (persisted) return persisted;
          const whatsapp = services.find((s) => s.phone_number);
          const picked = whatsapp ?? services[0];
          if (picked?.id) writeStoredSelection(organizationId, String(picked.id));
          return picked;
        });
      } else {
        // Provide helpful message when no services are found
        setError('No services found for this organization. Please configure a WhatsApp or Instagram account first.');
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
