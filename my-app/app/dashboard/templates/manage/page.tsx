"use client"

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import AppServiceCredentials from '@/components/app-service-credentials';
import WhatsAppTemplateManager from '@/components/whatsapp-template-manager';
import { useAppServices } from '@/hooks/use-app-services';

export default function TemplateManagementPage() {
  const {
    appServices,
    loading,
    error,
    refetch,
    selectedAppService,
    setSelectedAppService,
  } = useAppServices();

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container py-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Template Management</h1>
            <p className="text-muted-foreground">
              Manage your WhatsApp message templates and app service configuration
            </p>
          </div>

          {/* App Service Configuration */}
          <AppServiceCredentials
            appServices={appServices}
            selectedAppService={selectedAppService}
            onSelectAppService={setSelectedAppService}
            loading={loading}
            error={error}
            onRefresh={refetch}
          />

          {/* Template Management */}
          <WhatsAppTemplateManager appService={selectedAppService} />
        </div>
      </main>
    </div>
  );
}
