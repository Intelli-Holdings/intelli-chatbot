'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Plus, Trash2, Info, Timer, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SequenceNodeData, SequenceStep } from '../nodes/SequenceNode';
import { generateId } from '@/types/chatbot-automation';
import { useAppServices } from '@/hooks/use-app-services';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import type { WhatsAppTemplate } from '@/services/whatsapp';

interface SequenceNodeEditorProps {
  data: SequenceNodeData;
  onUpdate: (data: Partial<SequenceNodeData>) => void;
}

interface DelayPreset {
  value: string;
  label: string;
  seconds: number;
  templateOnly?: boolean;
}

const DELAY_PRESETS: DelayPreset[] = [
  { value: '1m', label: '1 minute', seconds: 60 },
  { value: '5m', label: '5 minutes', seconds: 300 },
  { value: '15m', label: '15 minutes', seconds: 900 },
  { value: '30m', label: '30 minutes', seconds: 1800 },
  { value: '45m', label: '45 minutes', seconds: 2700 },
  { value: '1h', label: '1 hour', seconds: 3600 },
  { value: '2h', label: '2 hours', seconds: 7200 },
  { value: '3h', label: '3 hours', seconds: 10800 },
  { value: '6h', label: '6 hours', seconds: 21600 },
  { value: '12h', label: '12 hours', seconds: 43200 },
  { value: '24h', label: '24 hours', seconds: 86400 },
  { value: '48h', label: '48 hours', seconds: 172800, templateOnly: true },
  { value: '72h', label: '72 hours', seconds: 259200, templateOnly: true },
];

const TWENTY_FOUR_HOURS = 86400;

function createDefaultStep(): SequenceStep {
  return {
    id: generateId(),
    delay: '5m',
    delaySeconds: 300,
    messageType: 'text',
    textMessage: '',
  };
}

export default function SequenceNodeEditor({ data, onUpdate }: SequenceNodeEditorProps) {
  const [localSteps, setLocalSteps] = useState<SequenceStep[]>(data.steps || []);
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Fetch approved templates
  const { selectedAppService } = useAppServices();
  const { templates, loading: templatesLoading } = useWhatsAppTemplates(selectedAppService);

  const approvedTemplates = useMemo(
    () => templates.filter(t => t.status === 'APPROVED'),
    [templates]
  );

  useEffect(() => {
    setLocalSteps(data.steps || []);
    setIsDirty(false);
  }, [data.steps]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    setShowSaved(false);
  }, []);

  const handleAddStep = useCallback(() => {
    setLocalSteps(prev => [...prev, createDefaultStep()]);
    markDirty();
  }, [markDirty]);

  const handleRemoveStep = useCallback((stepId: string) => {
    setLocalSteps(prev => prev.filter(s => s.id !== stepId));
    markDirty();
  }, [markDirty]);

  const handleStepChange = useCallback((stepId: string, updates: Partial<SequenceStep>) => {
    setLocalSteps(prev =>
      prev.map(step => {
        if (step.id !== stepId) return step;
        const updated = { ...step, ...updates };

        // Auto-switch to template when delay >= 24h
        if (updates.delay) {
          const preset = DELAY_PRESETS.find(p => p.value === updates.delay);
          if (preset) {
            updated.delaySeconds = preset.seconds;
            if (preset.seconds >= TWENTY_FOUR_HOURS && updated.messageType === 'text') {
              updated.messageType = 'template';
            }
          }
        }

        return updated;
      })
    );
    markDirty();
  }, [markDirty]);

  const handleSave = useCallback(() => {
    onUpdate({ steps: localSteps });
    setIsDirty(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }, [localSteps, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Sequence Steps</Label>
          <Badge variant="secondary" className="text-xs">
            {localSteps.length} step{localSteps.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {localSteps.length === 0 ? (
          <div className="border border-dashed rounded-lg p-4 text-center">
            <Timer className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No steps yet</p>
            <p className="text-xs text-muted-foreground/60">Add a step to schedule follow-up messages</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localSteps.map((step, index) => (
              <StepEditor
                key={step.id}
                step={step}
                index={index}
                approvedTemplates={approvedTemplates}
                templatesLoading={templatesLoading}
                onChange={(updates) => handleStepChange(step.id, updates)}
                onRemove={() => handleRemoveStep(step.id)}
              />
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddStep}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {/* Save Button */}
      <div className="pt-2 border-t">
        <Button
          onClick={handleSave}
          className="w-full"
          variant={isDirty ? 'default' : 'secondary'}
        >
          {showSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : isDirty ? (
            'Save Changes'
          ) : (
            'Saved'
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
        <p className="font-medium">How it works:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Each step sends a message after the specified delay</li>
          <li>Steps are scheduled instantly and run independently</li>
          <li>Delays over 24h require a template message (WhatsApp policy)</li>
          <li>Use variables like {"{{name}}"} in text messages</li>
        </ul>
      </div>
    </div>
  );
}

interface StepEditorProps {
  step: SequenceStep;
  index: number;
  approvedTemplates: WhatsAppTemplate[];
  templatesLoading: boolean;
  onChange: (updates: Partial<SequenceStep>) => void;
  onRemove: () => void;
}

function StepEditor({ step, index, approvedTemplates, templatesLoading, onChange, onRemove }: StepEditorProps) {
  const isTemplateRequired = step.delaySeconds >= TWENTY_FOUR_HOURS;

  const availablePresets = DELAY_PRESETS.filter(p => {
    if (step.messageType === 'text') return !p.templateOnly;
    return true;
  });

  // Get the body text preview for a template
  const getTemplatePreview = (template: WhatsAppTemplate): string => {
    const body = template.components?.find(c => c.type === 'BODY');
    if (body?.text) {
      return body.text.length > 60 ? body.text.substring(0, 60) + '...' : body.text;
    }
    return template.category || '';
  };

  // Handle template selection from dropdown
  const handleTemplateSelect = (templateName: string) => {
    const template = approvedTemplates.find(t => t.name === templateName);
    if (template) {
      onChange({
        templateName: template.name,
        templateId: template.id,
        templateLanguage: template.language,
        templateComponents: template.components as unknown as Record<string, unknown>[],
      });
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-background">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium">Step {index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Delay Selector */}
      <div className="space-y-1.5">
        <Label className="text-xs">Delay</Label>
        <Select
          value={step.delay}
          onValueChange={(value) => onChange({ delay: value })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select delay" />
          </SelectTrigger>
          <SelectContent>
            {availablePresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value} className="text-xs">
                {preset.label}
                {preset.templateOnly && (
                  <span className="text-muted-foreground ml-1">(template only)</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message Type Toggle */}
      <div className="space-y-1.5">
        <Label className="text-xs">Message Type</Label>
        <div className="flex gap-1">
          <button
            onClick={() => {
              if (!isTemplateRequired) {
                onChange({ messageType: 'text' });
              }
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
              step.messageType === 'text'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
              isTemplateRequired && 'opacity-50 cursor-not-allowed'
            )}
          >
            <MessageSquare className="h-3 w-3" />
            Text
          </button>
          <button
            onClick={() => onChange({ messageType: 'template' })}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
              step.messageType === 'template'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <FileText className="h-3 w-3" />
            Template
          </button>
        </div>
      </div>

      {/* 24h Warning */}
      {isTemplateRequired && (
        <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p className="text-[10px] leading-tight">
            WhatsApp requires template messages for delays over 24 hours (outside messaging window).
          </p>
        </div>
      )}

      {/* Message Content */}
      {step.messageType === 'text' ? (
        <div className="space-y-1.5">
          <Label className="text-xs">Message</Label>
          <Textarea
            value={step.textMessage || ''}
            onChange={(e) => onChange({ textMessage: e.target.value })}
            placeholder="Enter follow-up message..."
            rows={3}
            className="text-xs resize-none"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Template</Label>
            {templatesLoading ? (
              <div className="flex items-center gap-2 h-8 px-3 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading templates...
              </div>
            ) : approvedTemplates.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic px-1 py-2">
                No approved templates found. Create templates in the Templates page first.
              </p>
            ) : (
              <Select
                value={step.templateName || ''}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTemplates.map((template) => (
                    <SelectItem
                      key={`${template.name}-${template.language}`}
                      value={template.name}
                      className="text-xs"
                    >
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {template.language} &middot; {template.category}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Template Preview */}
          {step.templateName && (
            <div className="p-2 bg-muted/50 rounded-md">
              <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Preview:</p>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const selected = approvedTemplates.find(t => t.name === step.templateName);
                  return selected ? getTemplatePreview(selected) : step.templateName;
                })()}
              </p>
              {step.templateLanguage && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  Language: {step.templateLanguage}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
