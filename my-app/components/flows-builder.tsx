"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save,
  ChevronLeft,
  Settings,
  GripVertical,
  Loader2,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { 
  FlowJSON, 
  FlowScreen, 
  FlowComponent, 
  ComponentType,
  FlowAction 
} from '@/types/flows';
import { FLOW_COMPONENTS } from '@/types/flows';

interface FlowsBuilderProps {
  onComplete: (flowJSON: FlowJSON, flowId: string) => void;
  onBack: () => void;
  templateName: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  appService: any;
}

interface MetaFlow {
  id: string;
  name: string;
  status: string;
  categories: string[];
}

export default function FlowsBuilder({ 
  onComplete, 
  onBack, 
  templateName, 
  category,
  appService 
}: FlowsBuilderProps) {
  const [flowJSON, setFlowJSON] = useState<FlowJSON>({
    version: '7.2',
    screens: [{
      id: 'SCREEN_1',
      title: 'Screen 1',
      terminal: false,
      data: {},
      layout: {
        type: 'SingleColumnLayout',
        children: []
      }
    }]
  });

  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number>(0);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [draggedComponentIndex, setDraggedComponentIndex] = useState<number | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [availableFlows, setAvailableFlows] = useState<MetaFlow[]>([]);
  const [loadingFlows, setLoadingFlows] = useState(false);

  const selectedScreen = flowJSON.screens[selectedScreenIndex];

  // Fetch flows from Meta on mount
  useEffect(() => {
    fetchMetaFlows();
  }, []);

  const fetchMetaFlows = async () => {
    if (!appService?.whatsapp_business_account_id || !appService?.access_token) {
      toast.error('WhatsApp Business Account not configured');
      return;
    }

    setLoadingFlows(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${appService.whatsapp_business_account_id}/flows?access_token=${appService.access_token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flows');
      }

      const data = await response.json();
      setAvailableFlows(data.data || []);
      
      if (data.data?.length > 0) {
        setSelectedFlowId(data.data[0].id);
        toast.success(`Found ${data.data.length} flows`);
      } else {
        toast.info('No flows found. Create a flow in Meta Business Manager first.');
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Failed to load flows from Meta');
    } finally {
      setLoadingFlows(false);
    }
  };

  // Add screen
  const addScreen = useCallback(() => {
    const screenCount = flowJSON.screens.length + 1;
    const newScreen: FlowScreen = {
      id: `SCREEN_${screenCount}`,
      title: `Screen ${screenCount}`,
      terminal: false,
      data: {},
      layout: {
        type: 'SingleColumnLayout',
        children: []
      }
    };

    setFlowJSON(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen]
    }));

    setSelectedScreenIndex(flowJSON.screens.length);
    toast.success('Screen added');
  }, [flowJSON.screens.length]);

  // Delete screen
  const deleteScreen = useCallback((index: number) => {
    if (flowJSON.screens.length === 1) {
      toast.error('Cannot delete the only screen');
      return;
    }

    setFlowJSON(prev => ({
      ...prev,
      screens: prev.screens.filter((_, i) => i !== index)
    }));

    if (selectedScreenIndex >= index && selectedScreenIndex > 0) {
      setSelectedScreenIndex(selectedScreenIndex - 1);
    }

    toast.success('Screen deleted');
  }, [flowJSON.screens.length, selectedScreenIndex]);

  // Add component
  const addComponent = useCallback((componentType: ComponentType) => {
    if (!selectedScreen) return;

    const componentDef = FLOW_COMPONENTS[componentType];
    let newComponent: FlowComponent = { ...componentDef.defaultProps } as FlowComponent;

    // Generate unique name for components that require it
    if (componentDef.requiresName) {
      const existingNames = selectedScreen.layout.children
        .filter(c => c.name)
        .map(c => c.name);
      
      let counter = 1;
      let baseName = componentDef.defaultProps.name || 'field';
      let newName = baseName;
      
      while (existingNames.includes(newName)) {
        newName = `${baseName}_${counter}`;
        counter++;
      }
      
      newComponent.name = newName;
    }

    setFlowJSON(prev => ({
      ...prev,
      screens: prev.screens.map((screen, i) =>
        i === selectedScreenIndex
          ? {
              ...screen,
              layout: {
                ...screen.layout,
                children: [...screen.layout.children, newComponent]
              }
            }
          : screen
      )
    }));

    toast.success(`${componentDef.label} added`);
  }, [selectedScreen, selectedScreenIndex]);

  // Delete component
  const deleteComponent = useCallback((index: number) => {
    setFlowJSON(prev => ({
      ...prev,
      screens: prev.screens.map((screen, i) =>
        i === selectedScreenIndex
          ? {
              ...screen,
              layout: {
                ...screen.layout,
                children: screen.layout.children.filter((_, ci) => ci !== index)
              }
            }
          : screen
      )
    }));

    setSelectedComponentIndex(null);
    toast.success('Component deleted');
  }, [selectedScreenIndex]);

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedComponentIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedComponentIndex === null || draggedComponentIndex === dropIndex) {
      return;
    }

    setFlowJSON(prev => ({
      ...prev,
      screens: prev.screens.map((screen, i) => {
        if (i !== selectedScreenIndex) return screen;

        const children = [...screen.layout.children];
        const [draggedItem] = children.splice(draggedComponentIndex, 1);
        children.splice(dropIndex, 0, draggedItem);

        return {
          ...screen,
          layout: {
            ...screen.layout,
            children
          }
        };
      })
    }));

    setDraggedComponentIndex(null);
    setSelectedComponentIndex(dropIndex);
  };

  // Update component property
  const updateComponentProperty = useCallback((property: string, value: any) => {
    if (selectedComponentIndex === null) return;

    setFlowJSON(prev => ({
      ...prev,
      screens: prev.screens.map((screen, i) =>
        i === selectedScreenIndex
          ? {
              ...screen,
              layout: {
                ...screen.layout,
                children: screen.layout.children.map((comp, ci) =>
                  ci === selectedComponentIndex ? { ...comp, [property]: value } : comp
                )
              }
            }
          : screen
      )
    }));
  }, [selectedScreenIndex, selectedComponentIndex]);

  // Update screen property
  const updateScreenProperty = useCallback((property: string, value: any) => {
    setFlowJSON(prev => ({
      ...prev,
      screens: prev.screens.map((screen, i) =>
        i === selectedScreenIndex ? { ...screen, [property]: value } : screen
      )
    }));
  }, [selectedScreenIndex]);

  // Validate and save
  const handleSave = useCallback(() => {
    if (!selectedFlowId) {
      toast.error('Please select a Flow');
      return;
    }

    if (flowJSON.screens.length === 0) {
      toast.error('Flow must have at least one screen');
      return;
    }

    const hasTerminal = flowJSON.screens.some(s => s.terminal);
    if (!hasTerminal) {
      toast.error('Flow must have at least one terminal screen');
      return;
    }

    const terminalScreensWithoutFooter = flowJSON.screens.filter(s => 
      s.terminal && !s.layout.children.some(c => c.type === 'Footer')
    );

    if (terminalScreensWithoutFooter.length > 0) {
      toast.error('Terminal screens must have a Footer component');
      return;
    }

    onComplete(flowJSON, selectedFlowId);
    toast.success('Flow template created!');
  }, [flowJSON, selectedFlowId, onComplete]);

  const selectedComponent = selectedComponentIndex !== null && selectedScreen 
    ? selectedScreen.layout.children[selectedComponentIndex]
    : null;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{templateName}</h2>
              <p className="text-sm text-muted-foreground">Flow Builder</p>
            </div>
          </div>
          
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Create Flow Template
          </Button>
        </div>

        {/* Flow Selection */}
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1 max-w-md">
            <Label className="text-sm font-medium">Select Flow</Label>
            <div className="flex gap-2 mt-1">
              <Select 
                value={selectedFlowId} 
                onValueChange={setSelectedFlowId}
                disabled={loadingFlows || availableFlows.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow from Meta" />
                </SelectTrigger>
                <SelectContent>
                  {availableFlows.map(flow => (
                    <SelectItem key={flow.id} value={flow.id}>
                      <div className="flex items-center gap-2">
                        <span>{flow.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {flow.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchMetaFlows}
                disabled={loadingFlows}
              >
                {loadingFlows ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Screens */}
        <div className="w-80 border-r bg-gray-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Screens</h3>
              <Button size="sm" variant="ghost" onClick={addScreen}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {flowJSON.screens.map((screen, index) => (
                  <div
                    key={screen.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedScreenIndex === index
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedScreenIndex(index);
                      setSelectedComponentIndex(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {screen.title || screen.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {screen.layout.children.length} components
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {screen.terminal && (
                          <Badge variant="secondary" className="text-xs">End</Badge>
                        )}
                        {flowJSON.screens.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteScreen(index);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

               <div className="p-4">
              {selectedComponentIndex !== null && selectedComponent ? (
                <ComponentEditor
                  component={selectedComponent}
                  onUpdate={updateComponentProperty}
                  screens={flowJSON.screens}
                />
              ) : selectedScreen ? (
                <>
                  {/* Screen Properties */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">Screen Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Screen Title</Label>
                        <Input
                          value={selectedScreen.title || ''}
                          onChange={(e) => updateScreenProperty('title', e.target.value)}
                          className="mt-1"
                          placeholder="Enter screen title"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Terminal Screen</Label>
                        <Switch
                          checked={selectedScreen.terminal || false}
                          onCheckedChange={(checked) => updateScreenProperty('terminal', checked)}
                        />
                      </div>

                      {selectedScreen.terminal && (
                        <Alert>
                          <Settings className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Terminal screens must have a Footer button
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Add Components */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Add Content</h3>
                    <div className="space-y-2">
                      {Object.entries({
                        text: ['TextHeading', 'TextSubheading', 'TextBody'],
                        input: ['TextInput', 'TextArea', 'RadioButtonsGroup', 'CheckboxGroup', 'Dropdown'],
                        action: ['Footer', 'OptIn']
                      }).map(([category, types]) => (
                        <div key={category}>
                          <div className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                            {category}
                          </div>
                          <div className="space-y-1">
                            {types.map(type => (
                              <Button
                                key={type}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => addComponent(type as ComponentType)}
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                {FLOW_COMPONENTS[type as ComponentType]?.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            </ScrollArea>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedScreen?.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedScreen?.id}</p>
              </div>
            </div>

            <Card className="bg-white">
              <CardContent className="p-6">
                {selectedScreen?.layout.children.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="text-sm mb-2">No components yet</div>
                    <div className="text-xs">Add components from the right panel</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedScreen?.layout.children.map((component, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`group relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-move ${
                          selectedComponentIndex === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        } ${draggedComponentIndex === index ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedComponentIndex(index)}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {FLOW_COMPONENTS[component.type]?.label}
                            </div>
                            {component.name && (
                              <div className="text-xs text-muted-foreground">{component.name}</div>
                            )}
                            {component.text && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {component.text}
                              </div>
                            )}
                            {component.label && !component.text && (
                              <div className="text-xs text-gray-600 mt-1">{component.label}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(index);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Properties & Components */}
        <div className="w-80 border-l bg-white flex flex-col">
          

          {/* Preview Section - Always visible at bottom */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Preview</h3>
            </div>
            <FlowPreview screen={selectedScreen} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component Editor
function ComponentEditor({ 
  component, 
  onUpdate,
  screens 
}: { 
  component: FlowComponent;
  onUpdate: (property: string, value: any) => void;
  screens: FlowScreen[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Edit Content</h3>
        <div className="text-xs text-muted-foreground mb-4">
          {FLOW_COMPONENTS[component.type]?.label}
        </div>
      </div>

      {component.name !== undefined && (
        <div>
          <Label className="text-xs">Field Name</Label>
          <Input
            value={component.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {component.text !== undefined && (
        <div>
          <Label className="text-xs">Text</Label>
          <Textarea
            value={component.text}
            onChange={(e) => onUpdate('text', e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>
      )}

      {component.label !== undefined && (
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            value={component.label}
            onChange={(e) => onUpdate('label', e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {component.required !== undefined && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">Required</Label>
          <Switch
            checked={component.required}
            onCheckedChange={(checked) => onUpdate('required', checked)}
          />
        </div>
      )}

      {component['on-click-action'] && (
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-xs font-semibold">Button Action</Label>
          
          <div>
            <Label className="text-xs">Action Type</Label>
            <Select
              value={component['on-click-action'].name}
              onValueChange={(value) => {
                const newAction: FlowAction = { name: value as any };
                if (value === 'navigate') {
                  newAction.next = { type: 'screen', name: '' };
                  newAction.payload = {};
                } else if (value === 'complete') {
                  newAction.payload = {};
                }
                onUpdate('on-click-action', newAction);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="navigate">Go to Screen</SelectItem>
                <SelectItem value="complete">End Flow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {component['on-click-action'].name === 'navigate' && (
            <div>
              <Label className="text-xs">Next Screen</Label>
              <Select
                value={component['on-click-action'].next?.name || ''}
                onValueChange={(value) => {
                  onUpdate('on-click-action', {
                    ...component['on-click-action'],
                    next: { type: 'screen', name: value }
                  });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select screen" />
                </SelectTrigger>
                <SelectContent>
                  {screens.map(screen => (
                    <SelectItem key={screen.id} value={screen.id}>
                      {screen.title || screen.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Flow Preview Component - WhatsApp-style mobile preview
function FlowPreview({ screen }: { screen: FlowScreen }) {
  if (!screen) {
    return (
      <div className="text-center text-xs text-muted-foreground py-4">
        Select a screen to preview
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[280px]">
      {/* Phone mockup */}
      <div className="bg-white rounded-2xl shadow-xl border-8 border-gray-800 overflow-hidden">
        {/* Phone notch */}
        <div className="bg-gray-800 h-6 flex items-center justify-center">
          <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
        </div>
        
        {/* Screen header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-3 flex items-center gap-2">
          <div className="text-xs font-medium truncate">{screen.title}</div>
        </div>
        
        {/* Screen content */}
        <div className="bg-[#E5DDD5] min-h-[400px] p-3">
          <div className="bg-white rounded-lg shadow-sm p-3 space-y-2">
            {screen.layout.children.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No components
              </div>
            ) : (
              screen.layout.children.map((component, index) => (
                <div key={index}>
                  {component.type === 'TextHeading' && component.text && (
                    <div className="text-sm font-bold text-gray-900">
                      {component.text}
                    </div>
                  )}
                  
                  {component.type === 'TextSubheading' && component.text && (
                    <div className="text-sm font-semibold text-gray-800">
                      {component.text}
                    </div>
                  )}
                  
                  {component.type === 'TextBody' && component.text && (
                    <div className="text-xs text-gray-700">
                      {component.text}
                    </div>
                  )}
                  
                  {component.type === 'TextInput' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {component.label}
                      </div>
                      <input 
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white"
                        placeholder={component['helper-text'] || 'Enter text'}
                        disabled
                      />
                    </div>
                  )}
                  
                  {component.type === 'TextArea' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {component.label}
                      </div>
                      <textarea 
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white resize-none"
                        rows={3}
                        placeholder={component['helper-text'] || 'Enter text'}
                        disabled
                      />
                    </div>
                  )}
                  
                  {component.type === 'RadioButtonsGroup' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {component.label}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                          <span>Option 1</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                          <span>Option 2</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {component.type === 'CheckboxGroup' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {component.label}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded border-2 border-gray-400" />
                          <span>Option 1</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded border-2 border-gray-400" />
                          <span>Option 2</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {component.type === 'Dropdown' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {component.label}
                      </div>
                      <select 
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white"
                        disabled
                      >
                        <option>Choose one</option>
                      </select>
                    </div>
                  )}
                  
                  {component.type === 'OptIn' && (
                    <div className="flex items-start gap-2 mt-2">
                      <div className="w-3 h-3 rounded border-2 border-gray-400 mt-0.5" />
                      <div className="text-xs text-gray-700">
                        {component.label}
                      </div>
                    </div>
                  )}
                  
                  {component.type === 'Footer' && (
                    <Button 
                      className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                      disabled
                    >
                      {component.label}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="bg-white border-t p-2 text-center">
          <div className="text-[10px] text-gray-500">
            Managed by the business
          </div>
        </div>
      </div>
    </div>
  );
}