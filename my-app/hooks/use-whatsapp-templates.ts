import { useQuery, useMutation, useQueryClient } from 'react-query';
import { WhatsAppService, type WhatsAppTemplate, type AppService } from '@/services/whatsapp';
import { logger } from "@/lib/logger";

export interface UseWhatsAppTemplatesReturn {
  templates: WhatsAppTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTemplate: (templateData: any) => Promise<boolean>;
  updateTemplate: (templateId: string, templateData: any) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
}

/**
 * Custom hook to fetch and manage WhatsApp templates
 */
export const useWhatsAppTemplates = (appService: AppService | null): UseWhatsAppTemplatesReturn => {
  const queryClient = useQueryClient();
  const queryKey = ['whatsapp-templates', appService?.id ?? appService?.whatsapp_business_account_id ?? null];
  const canFetch = Boolean(appService?.whatsapp_business_account_id);
  const configError = appService && !appService.whatsapp_business_account_id
    ? 'App service configuration not available'
    : null;

  const fetchTemplates = async (): Promise<WhatsAppTemplate[]> => {
    if (!appService?.whatsapp_business_account_id) {
      return [];
    }

    return WhatsAppService.fetchTemplates(appService);
  };

  const query = useQuery(queryKey, fetchTemplates, {
    enabled: canFetch,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation(
    (templateData: any) => WhatsAppService.createTemplate(appService as AppService, templateData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  const updateMutation = useMutation(
    ({ templateId, templateData }: { templateId: string; templateData: any }) =>
      WhatsAppService.updateTemplate(templateId, appService as AppService, templateData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  const deleteMutation = useMutation(
    (templateId: string) => WhatsAppService.deleteTemplate(appService as AppService, templateId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  const createTemplate = async (templateData: any): Promise<boolean> => {
    if (!appService?.whatsapp_business_account_id) {
      return false;
    }

    try {
      await createMutation.mutateAsync(templateData);
      return true;
    } catch (err) {
      logger.error('Error creating template', { error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  };

  const updateTemplate = async (templateId: string, templateData: any): Promise<boolean> => {
    if (!appService?.whatsapp_business_account_id) {
      return false;
    }

    try {
      await updateMutation.mutateAsync({ templateId, templateData });
      return true;
    } catch (err) {
      logger.error('Error updating template', { error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  };

  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    if (!appService?.whatsapp_business_account_id) {
      return false;
    }

    try {
      await deleteMutation.mutateAsync(templateId);
      return true;
    } catch (err) {
      logger.error('Error deleting template', { error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  };

  return {
    templates: query.data || [],
    loading:
      query.isLoading ||
      query.isFetching ||
      createMutation.isLoading ||
      updateMutation.isLoading ||
      deleteMutation.isLoading,
    error: configError || (query.error instanceof Error ? query.error.message : null),
    refetch: async () => {
      if (!canFetch) return;
      await query.refetch();
    },
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

export default useWhatsAppTemplates;
