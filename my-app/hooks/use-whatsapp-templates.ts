import { useState, useEffect, useCallback } from 'react';
import { WhatsAppService, type WhatsAppTemplate, type AppService } from '@/services/whatsapp';

export interface UseWhatsAppTemplatesReturn {
  templates: WhatsAppTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTemplate: (templateData: any) => Promise<boolean>;
  updateTemplate: (templateId: string, templateData: any) => Promise<boolean>;
  deleteTemplate: (templateName: string) => Promise<boolean>;
}

/**
 * Custom hook to fetch and manage WhatsApp templates
 */
export const useWhatsAppTemplates = (appService: AppService | null): UseWhatsAppTemplatesReturn => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!appService?.wabaId || !appService?.accessToken) {
      setError('App service configuration not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const templateData = await WhatsAppService.fetchTemplates(
        appService.wabaId,
        appService.accessToken
      );
      setTemplates(templateData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [appService?.wabaId, appService?.accessToken]);

  const createTemplate = async (templateData: any): Promise<boolean> => {
    if (!appService?.wabaId || !appService?.accessToken) {
      setError('App service configuration not available');
      return false;
    }

    try {
      setLoading(true);
      await WhatsAppService.createTemplate(
        appService.wabaId,
        appService.accessToken,
        templateData
      );
      
      // Refetch templates after creation
      await fetchTemplates();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      console.error('Error creating template:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (templateId: string, templateData: any): Promise<boolean> => {
    if (!appService?.accessToken) {
      setError('App service configuration not available');
      return false;
    }

    try {
      setLoading(true);
      await WhatsAppService.updateTemplate(
        templateId,
        appService.accessToken,
        templateData
      );
      
      // Refetch templates after update
      await fetchTemplates();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      console.error('Error updating template:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateName: string): Promise<boolean> => {
    if (!appService?.wabaId || !appService?.accessToken) {
      setError('App service configuration not available');
      return false;
    }

    try {
      setLoading(true);
      await WhatsAppService.deleteTemplate(
        appService.wabaId,
        templateName,
        appService.accessToken
      );
      
      // Refetch templates after deletion
      await fetchTemplates();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      console.error('Error deleting template:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appService?.wabaId && appService?.accessToken) {
      fetchTemplates();
    }
  }, [appService?.wabaId, appService?.accessToken, fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

export default useWhatsAppTemplates;
