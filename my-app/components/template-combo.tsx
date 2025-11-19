"use client";

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
  status: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onTemplateChange: (templateName: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateChange,
  isLoading = false,
  placeholder = 'Choose a template...',
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectedTemplateData = templates.find(t => t.name === selectedTemplate);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    template.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-11 justify-between text-base font-normal px-3"
          disabled={isLoading}
        >
          <span className="truncate">
            {selectedTemplateData
              ? `${selectedTemplateData.name} · ${selectedTemplateData.category}`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false} className="w-full">
          <div className="flex items-center border-b border-border/50 px-3 py-2 gap-2">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <CommandInput
              placeholder="Search templates..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0 outline-none focus:ring-0 text-base placeholder:text-muted-foreground"
            />
          </div>

          <CommandList className="max-h-[300px]">
            {isLoading ? (
              <CommandEmpty className="py-8 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>Loading templates...</span>
                </div>
              </CommandEmpty>
            ) : filteredTemplates.length === 0 ? (
              <CommandEmpty className="py-8 text-center text-muted-foreground">
                {templates.length === 0
                  ? 'No approved templates available'
                  : 'No templates match your search'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredTemplates.map((template) => (
                  <CommandItem
                    key={template.id}
                    value={template.name}
                    onSelect={(currentValue) => {
                      onTemplateChange(currentValue === selectedTemplate ? '' : currentValue);
                      setOpen(false);
                      setSearchValue('');
                    }}
                    className="cursor-pointer px-3 py-2.5"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedTemplate === template.name ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {template.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {template.category}
                      </div>
                    </div>
                    {selectedTemplate === template.name && (
                      <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
                        Selected
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
