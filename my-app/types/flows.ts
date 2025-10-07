export type FlowActionType = 'navigate' | 'complete' | 'data_exchange' | 'update_data' | 'open_url';

export type ComponentType = 
  | 'TextHeading' 
  | 'TextSubheading' 
  | 'TextBody' 
  | 'TextCaption'
  | 'TextInput'
  | 'TextArea'
  | 'CheckboxGroup'
  | 'RadioButtonsGroup'
  | 'Dropdown'
  | 'DatePicker'
  | 'OptIn'
  | 'Footer'
  | 'EmbeddedLink'
  | 'Image'
  | 'PhotoPicker'
  | 'DocumentPicker';

export interface DataSourceItem {
  id: string;
  title: string;
  description?: string;
}

export interface FlowComponent {
  type: ComponentType;
  name?: string;
  label?: string;
  text?: string;
  'text-color'?: string;
  visible?: string | boolean;
  enabled?: boolean;
  required?: boolean;
  'helper-text'?: string;
  'input-type'?: 'text' | 'number' | 'email' | 'password' | 'passcode';
  'min-chars'?: number;
  'max-chars'?: number;
  'data-source'?: DataSourceItem[];
  'on-select-action'?: FlowAction;
  'on-click-action'?: FlowAction;
  'init-value'?: string | string[];
  'error-message'?: string;
  src?: string; // for Image component
}

export interface FlowAction {
  name: FlowActionType;
  next?: { type: 'screen'; name: string };
  payload?: Record<string, any>;
  url?: string;
}

export interface ScreenData {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    __example__: any;
    items?: any;
    properties?: any;
  };
}

export interface FlowScreen {
  id: string;
  title?: string;
  terminal?: boolean;
  success?: boolean;
  'refresh_on_back'?: boolean;
  sensitive?: string[];
  data?: ScreenData;
  layout: {
    type: 'SingleColumnLayout';
    children: FlowComponent[];
  };
}

export interface FlowJSON {
  version: string;
  data_api_version?: string;
  routing_model?: Record<string, string[]>;
  screens: FlowScreen[];
}

export interface FlowBuilderState {
  flowJSON: FlowJSON;
  selectedScreenId: string | null;
  selectedComponentIndex: number | null;
  previewMode: boolean;
}

// Component Library Definitions
export const FLOW_COMPONENTS: Record<ComponentType, {
  label: string;
  icon: string;
  category: 'text' | 'input' | 'media' | 'action';
  requiresName: boolean;
  defaultProps: Partial<FlowComponent>;
}> = {
  TextHeading: {
    label: 'Large Heading',
    icon: 'Heading1',
    category: 'text',
    requiresName: false,
    defaultProps: { type: 'TextHeading', text: 'Large Heading' }
  },
  TextSubheading: {
    label: 'Small Heading',
    icon: 'Heading2',
    category: 'text',
    requiresName: false,
    defaultProps: { type: 'TextSubheading', text: 'Small Heading' }
  },
  TextBody: {
    label: 'Body Text',
    icon: 'Type',
    category: 'text',
    requiresName: false,
    defaultProps: { type: 'TextBody', text: 'Body text content' }
  },
  TextCaption: {
    label: 'Caption',
    icon: 'FileText',
    category: 'text',
    requiresName: false,
    defaultProps: { type: 'TextCaption', text: 'Caption text' }
  },
  TextInput: {
    label: 'Short Answer',
    icon: 'Input',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'TextInput', 
      name: 'text_input',
      label: 'Short answer',
      'input-type': 'text',
      required: false
    }
  },
  TextArea: {
    label: 'Paragraph',
    icon: 'AlignLeft',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'TextArea', 
      name: 'text_area',
      label: 'Your answer',
      required: false
    }
  },
  CheckboxGroup: {
    label: 'Multiple Choice',
    icon: 'CheckSquare',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'CheckboxGroup', 
      name: 'checkbox_group',
      label: 'Select all that apply',
      'data-source': [
        { id: 'option_1', title: 'Option 1' },
        { id: 'option_2', title: 'Option 2' }
      ],
      required: false
    }
  },
  RadioButtonsGroup: {
    label: 'Single Choice',
    icon: 'Circle',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'RadioButtonsGroup', 
      name: 'radio_group',
      label: 'Choose one',
      'data-source': [
        { id: 'option_1', title: 'Option 1' },
        { id: 'option_2', title: 'Option 2' }
      ],
      required: false
    }
  },
  Dropdown: {
    label: 'Dropdown',
    icon: 'ChevronDown',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'Dropdown', 
      name: 'dropdown',
      label: 'Select option',
      'data-source': [
        { id: 'option_1', title: 'Option 1' },
        { id: 'option_2', title: 'Option 2' }
      ],
      required: false
    }
  },
  DatePicker: {
    label: 'Date Picker',
    icon: 'Calendar',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'DatePicker', 
      name: 'date_picker',
      label: 'Select date',
      required: false
    }
  },
  OptIn: {
    label: 'Opt-In Checkbox',
    icon: 'Check',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'OptIn', 
      name: 'opt_in',
      label: 'I agree to terms',
      required: false
    }
  },
  Footer: {
    label: 'Button',
    icon: 'MousePointer',
    category: 'action',
    requiresName: false,
    defaultProps: { 
      type: 'Footer', 
      label: 'Continue',
      'on-click-action': { name: 'navigate', next: { type: 'screen', name: '' }, payload: {} }
    }
  },
  EmbeddedLink: {
    label: 'Link',
    icon: 'Link',
    category: 'action',
    requiresName: false,
    defaultProps: { 
      type: 'EmbeddedLink', 
      text: 'Click here',
      'on-click-action': { name: 'open_url', url: 'https://example.com' }
    }
  },
  Image: {
    label: 'Image',
    icon: 'Image',
    category: 'media',
    requiresName: false,
    defaultProps: { 
      type: 'Image',
      src: 'https://via.placeholder.com/300x200'
    }
  },
  PhotoPicker: {
    label: 'Photo Upload',
    icon: 'Camera',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'PhotoPicker', 
      name: 'photo_picker',
      label: 'Upload photo'
    }
  },
  DocumentPicker: {
    label: 'Document Upload',
    icon: 'FileText',
    category: 'input',
    requiresName: true,
    defaultProps: { 
      type: 'DocumentPicker', 
      name: 'document_picker',
      label: 'Upload document'
    }
  }
};

export const FLOW_VERSIONS = [
  '7.2', '7.0', '6.0', '5.1', '5.0', '4.0', '3.1', '3.0', '2.1'
];

export const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' }
];