# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Intelli** - a Next.js 14 application providing WhatsApp Business API integration, AI-powered customer service automation, and multi-channel communication management. The application uses the App Router architecture, TypeScript, Tailwind CSS, and integrates with Meta Graph API for WhatsApp Business functionality.

## Development Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Build & Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Type-check without emitting files
```

## Architecture & Code Organization

### Service Layer Pattern

Services in `/services/` are **static class-based** with comprehensive error handling:

- **WhatsAppService** (`services/whatsapp.ts`): Core WhatsApp Business API operations
  - Template management (CRUD operations)
  - Message sending with language fallback
  - Analytics (messaging & conversation)
  - Phone number management
  - **CRITICAL**: Template component formatting must preserve exact structure from template-creator.ts
  - Button types MUST remain uppercase for Meta API compatibility
  - Authentication templates require `example.body_text` even when empty

- **Meta Graph API Service** (`services/meta-graph-api.ts`): Low-level Graph API interactions
  - Uses fallback mechanism: tries comprehensive fields, falls back to `fields=*` on 400 errors
  - Returns typed responses with `PhoneNumberDetails` interface
  - Implements utility functions for limit extraction and formatting

- **MetaConfigService** (`services/meta-config.ts`): Multi-tenant Meta configuration
  - Caches configurations per organization
  - Fetches app details from Meta Graph API
  - Provides fallback to environment variables

### Custom Hooks Pattern

All hooks in `/hooks/` follow this structure:

```typescript
export interface UseXReturn {
  data: X | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

Key hooks:
- **useAppServices**: Manages WhatsApp app services, auto-selects first service
- **useWhatsAppAnalytics**: Fetches comprehensive analytics from multiple endpoints
- **useWhatsAppTemplates**: Template management with real-time updates
- **useOrganizationId**: Clerk-based organization context (via `useAuth()`)

### Meta Graph API Integration

**API Version**: v22.0 (configurable via `NEXT_PUBLIC_META_API_VERSION`)

**Authentication Flow**:
1. AppService contains `access_token` and `whatsapp_business_account_id`
2. Services use these credentials for Graph API calls
3. Organization-scoped data via Clerk authentication

**Phone Number Fetching**:
- Endpoint: `/{WABA-ID}/phone_numbers`
- Comprehensive fields: includes messaging limits, quality ratings, verification status
- Data processing: extracts limits from multiple possible field names (`current_limit`, `max_daily_conversation_per_phone`, `messaging_limit_tier`)

**Template Management**:
- **CRITICAL RULE**: Never modify template component structure from template-creator.ts
- Button types: `OTP` (not `COPY_CODE`), uppercase required
- Examples: Must preserve nested array format `[[...]]` for body_text
- Media headers: Require valid media handles from upload API

### TypeScript Types

**Type Location**: `/types/whatsapp-templates.ts`

Key types:
- `TemplateCategory`: `'MARKETING' | 'UTILITY' | 'AUTHENTICATION'`
- `ButtonType`: Includes `QUICK_REPLY`, `URL`, `PHONE_NUMBER`, `OTP`, `FLOW`, etc.
- `ComponentType`: `'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'`
- Template validation helpers with `TEMPLATE_LIMITS` constants

**AppService Interface**:
```typescript
interface AppService {
  id: number;
  phone_number: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
  access_token: string;
  organizationId?: string;
  name?: string;
  status?: string;
}
```

### API Routes Pattern

API routes in `/app/api/` use Next.js 14 Route Handlers:

```typescript
export async function GET(request: Request) { }
export async function POST(request: Request) { }
```

**Backend Integration**:
- Primary: `NEXT_PUBLIC_API_BASE_URL` (https://backend.intelliconcierge.com)
- Dev: `NEXT_PUBLIC_API_BASE_URL`
- Test: `NEXT_PUBLIC_TEST_API_BASE_URL`
- Local: `NEXT_PUBLIC_LOCAL_API_BASE_URL`

### State Management

- **Jotai**: Global state atoms
- **React Context**: Component-level state
- **Custom Hooks**: Encapsulated data fetching with loading/error states

### Authentication & Organizations

**Clerk Integration**:
- Sign-in: `/auth/sign-in`
- Sign-up: `/auth/sign-up` → redirects to `/pre-onboarding`
- Post-sign-in: `/dashboard`
- Organization-scoped data via `useActiveOrganizationId()`

### UI Components

**Component Library**: Radix UI + shadcn/ui patterns
- Components in `/components/ui/`
- Follow compositional pattern with Radix primitives
- Styled with Tailwind CSS + `cn()` utility (clsx + tailwind-merge)

**Key UI Patterns**:
- Skeleton loading states with shimmer animation
- Toast notifications via `sonner`
- Form validation with `react-hook-form` + `zod`

## Critical Implementation Rules

### WhatsApp Template Formatting

**NEVER modify these patterns**:

1. **Button Types**: Keep uppercase (`OTP`, not `otp`)
2. **Example Format**: Body text must be `{ body_text: [[...]] }` (nested array)
3. **Media Handles**: Validate before submission, no placeholders like `DYNAMIC_HANDLE_FROM_UPLOAD`
4. **Language Codes**: Try variations (e.g., `en` → `en_US` → `en_GB`)

### Error Handling Pattern

```typescript
try {
  // API call
} catch (error) {
  let errorMessage = 'Default error message';

  if (error instanceof Error) {
    if (error.message.includes('Access token')) {
      errorMessage = 'Invalid access token...';
    }
    // More specific error handling
  }

  setError(errorMessage);
  console.error('Context:', error);
}
```

### Data Fetching Pattern

Always use `Promise.allSettled` for parallel requests:

```typescript
const [res1, res2, res3] = await Promise.allSettled([
  fetch1(),
  fetch2(),
  fetch3()
]);

if (res1.status === 'fulfilled') {
  // Process res1.value
}
```

## Environment Configuration

**Required Environment Variables**:
- `NEXT_PUBLIC_META_API_VERSION`: Meta Graph API version (default: v22.0)
- `NEXT_PUBLIC_FACEBOOK_APP_ID`: Facebook App ID
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL
- `MONGODB_URI`: MongoDB connection string
- Clerk keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

**API Base URLs** are environment-specific (dev/test/prod)

## Testing Approach

When implementing WhatsApp features:
1. Check browser console for debug logs (prefixed with emojis: 📱, 📋, ✅, ❌)
2. Verify Meta Graph API responses in development mode
3. Test with real WhatsApp Business Account credentials
4. Validate error handling for different API failure modes

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
```json
{
  "@/*": ["./*"]
}
```

Import from root: `@/services/whatsapp`, `@/hooks/use-app-services`, etc.

## Key Dependencies

- **Next.js 14**: App Router with Server Components
- **Clerk**: Authentication & organization management
- **MongoDB + Mongoose**: Database
- **Radix UI**: Unstyled accessible components
- **Tailwind CSS**: Utility-first styling
- **Zod**: Schema validation
- **Socket.io**: Real-time communication
- **AI SDK**: OpenAI/Azure OpenAI integration

## Multi-Tenant Architecture

Each organization has:
- Isolated WhatsApp Business Account configurations
- Separate app services (phone numbers)
- Organization-scoped analytics and templates
- Cached Meta configurations via `MetaConfigService`

When working with organization data, always:
1. Get `organizationId` from `useActiveOrganizationId()`
2. Pass to service methods for tenant isolation
3. Handle missing organization context gracefully

## Chatbot Flow Builder

The flow builder (`/components/flow-builder/`) is a visual automation builder using React Flow for creating chatbot conversation flows.

### Architecture Overview

```
components/flow-builder/
├── FlowBuilder.tsx          # Main component with ReactFlow integration
├── FlowToolbar.tsx          # Draggable node toolbar
├── ContextMenu.tsx          # Right-click context menu
├── ConnectionMenu.tsx       # Menu shown when dragging from output handles
├── nodes/                   # Node components (visual representation)
│   ├── index.ts             # Exports nodeTypes registry
│   ├── StartNode.tsx        # Trigger/entry point node
│   ├── TextNode.tsx         # Simple text message node
│   ├── QuestionNode.tsx     # Interactive message with buttons/list
│   ├── ActionNode.tsx       # Terminal actions (AI handoff, end)
│   ├── ConditionNode.tsx    # Branching logic node
│   ├── MediaNode.tsx        # Image/video/document/audio node
│   ├── UserInputFlowNode.tsx # User input flow container
│   └── QuestionInputNode.tsx # Individual question for user input
├── panels/                  # Editor panels for each node type
│   ├── NodeEditorPanel.tsx  # Main panel wrapper
│   ├── StartNodeEditor.tsx
│   ├── TextNodeEditor.tsx
│   ├── QuestionNodeEditor.tsx
│   ├── ActionNodeEditor.tsx
│   ├── ConditionNodeEditor.tsx
│   ├── MediaNodeEditor.tsx
│   ├── UserInputFlowNodeEditor.tsx
│   └── QuestionInputNodeEditor.tsx
├── edges/
│   └── CustomEdge.tsx       # Styled edge with labels
├── hooks/
│   └── useFlowState.ts      # Flow state management hook
└── utils/
    ├── node-factories.ts    # Node creation functions
    └── flow-converters.ts   # Convert between flow and chatbot data
```

### Node Types

| Node Type | File | Purpose | Handles |
|-----------|------|---------|---------|
| `start` | StartNode.tsx | Entry point with keyword triggers | Output: Right |
| `text` | TextNode.tsx | Send text message | Input: Left, Output: Right |
| `question` | QuestionNode.tsx | Interactive message (buttons/list) | Input: Left, Output: Right (per option) |
| `action` | ActionNode.tsx | Terminal actions (AI, end) | Input: Left only |
| `condition` | ConditionNode.tsx | Branch based on rules | Input: Left, Output: Right (true/false) |
| `media` | MediaNode.tsx | Send media files | Input: Left, Output: Right |
| `user_input_flow` | UserInputFlowNode.tsx | User input flow container | Input: Left, Output: Right |
| `question_input` | QuestionInputNode.tsx | Single question in flow | Input: Left, Output: Right |

### Flow Direction

**Horizontal layout (Left → Right)**:
- Input handles: `Position.Left`
- Output handles: `Position.Right`
- Auto-layout uses `direction: 'LR'` (dagre)

### Key Patterns

#### Node Data Interfaces

```typescript
// All node data types in node-factories.ts
export type ExtendedFlowNodeData =
  | StartNodeData
  | QuestionNodeData
  | ActionNodeData
  | TextNodeData
  | ConditionNodeData
  | MediaNodeData
  | UserInputFlowNodeData
  | QuestionInputNodeData;

export interface ExtendedFlowNode {
  id: string;
  type: 'start' | 'question' | 'action' | 'text' | 'condition' | 'media' | 'user_input_flow' | 'question_input';
  position: NodePosition;
  data: ExtendedFlowNodeData;
}
```

#### Node Registration

Nodes must be registered in `nodes/index.ts`:
```typescript
export const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  action: ActionNode,
  text: TextNode,
  condition: ConditionNode,
  media: MediaNode,
  user_input_flow: UserInputFlowNode,
  question_input: QuestionInputNode,
};
```

#### Creating New Nodes

1. Create node component in `nodes/NewNode.tsx`
2. Create editor in `panels/NewNodeEditor.tsx`
3. Add to `nodes/index.ts` exports
4. Add factory function in `utils/node-factories.ts`
5. Add to toolbar in `FlowToolbar.tsx`
6. Add to `useFlowState.ts` onDrop handler
7. Add to `NodeEditorPanel.tsx`
8. Add to `ConnectionMenu.tsx` menu items
9. Update `FlowBuilder.tsx` minimap colors

#### Editor Pattern with Save Button

Editors use local state with explicit save:
```typescript
const [localData, setLocalData] = useState({ ...data });
const [isDirty, setIsDirty] = useState(false);
const [showSaved, setShowSaved] = useState(false);

const handleChange = (updates) => {
  setLocalData(prev => ({ ...prev, ...updates }));
  setIsDirty(true);
};

const handleSave = () => {
  onUpdate(localData);
  setIsDirty(false);
  setShowSaved(true);
  setTimeout(() => setShowSaved(false), 2000);
};
```

#### Connection Menu UX

When dragging from an output handle to empty canvas:
1. `onConnectStart` stores source node/handle info
2. `onConnectEnd` shows `ConnectionMenu` at drop position
3. User selects node type from categorized menu
4. New node is created and automatically connected

### State Management

`useFlowState` hook manages:
- `nodes` / `edges` - React Flow state
- `selectedNode` - Currently selected node for editor
- `contextMenu` - Right-click menu state
- `connectionMenu` - Drag-to-connect menu state
- Auto-sync to chatbot after 500ms debounce

### Custom Fields Integration

Question nodes can save answers to:
- System fields: `name`, `email`, `phone`
- Custom fields: `custom:field_key` (via `useCustomFields` hook)

```typescript
const { customFields, loading } = useCustomFields(organizationId);
```

### Conversion Functions

`flow-converters.ts` handles:
- `chatbotToFlow()` - Convert ChatbotAutomation → React Flow nodes/edges
- `flowToChatbot()` - Convert React Flow → ChatbotAutomation updates
- `autoLayoutFlow()` - Apply dagre auto-layout (LR direction)
