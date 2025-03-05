import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUser } from '@clerk/nextjs';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';

interface FormData {
  organization_id: string;
  source: string;
  otherSource?: string;
  goals: string[];
  customGoal?: string;
  organizationProfile: {
    type: string;
    customType?: string;
    customTypeDescription?: string;
    messageVolume: {
      daily: number;
      monthly?: number;
    };
    supportCost: number;
    revenue: string;
  };
  businessType?: string; // Keep for backward compatibility
  platforms?: any[]; // Keep for backward compatibility
  employeeCount?: string; // Keep for backward compatibility
  teamSize: number;
  channels: string[];
}

interface AssistantData {
  name: string;
  prompt: string;
  type: string;
}


import {
  Trophy,
  Sparkles,
  Rocket,
  Zap,
  Users,
  Building2,
  MessageSquare,
  Globe,
  Mail,
  Loader2, 
  Clipboard, 
  ClipboardCheck, 
  Info,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createNewOrganization } from '@/services/organization';


interface GoalCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ icon: Icon, title, description, selected, onClick }) => (
  <div
    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-full bg-blue-100">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

interface OnboardingData {
  source: string;
  goals: any[];
  businessType: string;
  platforms: any[];
  employees: string;
}


interface OnboardingFlowProps {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

interface OrganizationProfile {
  revenue: string;
  teamSize: number;
  messageVolume: {
    daily: number;
    monthly: number;
  };
  supportCost: number;
  type: string;
  customType?: string;
  customTypeDescription?: string;
}

export default function OnboardingFlow({ onboardingData, updateOnboardingData }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const activeOrganizationId = useActiveOrganizationId();

  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [assistantFormData, setAssistantFormData] = useState({
    name: "",
    prompt: "",
    organization_id: activeOrganizationId || "", 
  });
  
  // Update assistantFormData when activeOrganizationId changes
  React.useEffect(() => {
    if (activeOrganizationId) {
      setAssistantFormData(prev => ({
        ...prev,
        organization_id: activeOrganizationId
      }));
    }
  }, [activeOrganizationId]);

  // Function to handle assistant creation - removed organization selection validation
  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeOrganizationId) {
      toast.error("No active organization found. Please create an organization first.");
      return;
    }

    setIsCreatingAssistant(true);
    try {
      // According to API schema, it needs 'organization' not 'organization_id'
      const data = {
        name: assistantFormData.name,
        prompt: assistantFormData.prompt,
        organization: assistantFormData.organization_id,
        type: "USER" // Adding required type field from API schema
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error("Failed to create assistant");
      }

      toast.success(
        "Assistant created successfully; Your assistant will help handle customer inquiries"
      );
      setAssistantFormData({ name: "", prompt: "", organization_id: activeOrganizationId || "" });
      
      // Automatically proceed to next step after successful creation
      handleNext();
    } catch (error) {
      console.error("Error creating assistant:", error);
      toast.error("Failed to create assistant");
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const { user } = useUser();
 

  const [formData, setFormData] = useState<FormData>({
    organization_id: activeOrganizationId || "",
    source: '',
    otherSource: "",
    goals: [],
    customGoal: '',
    organizationProfile: {
      type: '',
      customType: '',
      customTypeDescription: '',
      messageVolume: {
        daily: 100
      },
      supportCost: 500,
      revenue: ''
    },
    teamSize: 1,
    channels: [],
    
    businessType: '',
    platforms: [],
    employeeCount: ''
  });

  const [assistantData, setAssistantData] = useState<AssistantData>({
    name: '',
    prompt: '',
    type: 'general'
  });

  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = async () => {
    setLoading(true);

    // Submit form data when moving from step 7 
    if (currentStep === 7) {
      try {
        if (!user || !activeOrganizationId) {
          console.warn('Missing user or organization data');
          toast.warning('Proceeding with limited functionality');
        } else {
          // Update organization_id from the active organization
          const updatedFormData = {
            ...formData,
            organization_id: activeOrganizationId,
            user_id: user.id
          };
          
          console.log('Submitting onboarding data:', updatedFormData);
          
          let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/onboarding/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFormData),
          });

          // If we get a 400 with message about onboarding info already existing, try PUT instead
          if (response.status === 400) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            
            if (errorText.includes("Onboarding information already exists")) {
              toast.info('Updating existing onboarding information...');
              
              // Try again with PUT method to update
              response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/onboarding/`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFormData),
              });
            }
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`Failed to submit onboarding data: ${response.statusText}`);
          }

          toast.success('Your onboarding is completed successfully!');
          
          // Update the form data with the active organization ID
          setFormData(prev => ({
            ...prev,
            organization_id: activeOrganizationId
          }));
        }
      } catch (error) {
        console.error('Error submitting onboarding data:', error);
        toast.info('Failed to complete onboarding, but you can still proceed');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    setCurrentStep(prev => prev + 1);
  };


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="absolute inset-0 bg-[url('/api/placeholder/400/320')] opacity-10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-3xl font-bold text-white">Welcome to Intelli!</h2>
              </div>
            </div>
            <p className="text-lg text-gray-600">
              Intelli is your AI-powered assistant for effortless customer conversations across WhatsApp, website, and email.
            </p>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-semibold">How did you find out about us?</h3>
            <Select
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  source: value,
                  // Reset otherSource if not "other"
                  otherSource: value === "other" ? formData.otherSource || "" : ""
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="googlesearch">Google Search</SelectItem>
                <SelectItem value="socialmediaads">Social Media Ads</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formData.source === "other" && (
              <Input
                placeholder="kindly describe where you heard about us, be more specific"
                value={(formData as any).otherSource || ""}
                onChange={(e) =>
                  setFormData({ ...formData, otherSource: e.target.value })
                }
              />
            )}
          </motion.div>
        );


      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">What will you use Intelli for?</h3>
            <p className="text-gray-500">Select all that apply</p>
            <div className="grid gap-4">
              <GoalCard
                icon={Zap}
                title="Automate Support"
                description="Handle common questions automatically"
                selected={formData.goals.includes('support')}
                onClick={() => {
                  const goals = formData.goals.includes('support')
                    ? formData.goals.filter(g => g !== 'support')
                    : [...formData.goals, 'support'];
                  setFormData({ ...formData, goals });
                }}
              />
              <GoalCard
                icon={Users}
                title="Generate Leads"
                description="Convert website visitors into customers"
                selected={formData.goals.includes('leads')}
                onClick={() => {
                  const goals = formData.goals.includes('leads')
                    ? formData.goals.filter(g => g !== 'leads')
                    : [...formData.goals, 'leads'];
                  setFormData({ ...formData, goals });
                }}
              />
              <GoalCard
                icon={MessageSquare}
                title="Engage Customers"
                description="Provide 24/7 instant responses on Whatsapp"
                selected={formData.goals.includes('engage')}
                onClick={() => {
                  const goals = formData.goals.includes('engage')
                    ? formData.goals.filter(g => g !== 'engage')
                    : [...formData.goals, 'engage'];
                  setFormData({ ...formData, goals });
                }}
              />
              <GoalCard
                icon={Sparkles}
                title="Don't see your usecase?"
                description="Tell us about it."
                selected={formData.goals.includes('custom')}
                onClick={() => {
                  const exists = formData.goals.includes('custom');
                  const newGoals = exists
                    ? formData.goals.filter(g => g !== 'custom')
                    : [...formData.goals, 'custom'];
                  setFormData({ ...formData, goals: newGoals });
                }}
              />
            </div>
            {formData.goals.includes('custom') && (
              <Input
                placeholder="Describe your custom usecase/business goal"
                value={(formData as any).customGoal || ''}
                onChange={(e) =>
                  setFormData({ ...formData, customGoal: e.target.value })
                }
              />
            )}
          </div>
        );


      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Tell us more about your business</h3>
            <div className="space-y-4">
              <Label>What type of organization is it?</Label>
              <RadioGroup
                defaultValue={formData.organizationProfile.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    organizationProfile: {
                      ...formData.organizationProfile,
                      type: value
                    }
                  })
                }
              >
                {[
                  {
                    value: 'ecommerce',
                    label: 'E-commerce',
                    desc: 'Online retail, marketplaces, and digital commerce platforms'
                  },
                  {
                    value: 'education',
                    label: 'Education',
                    desc: 'Schools, universities, online learning platforms, and educational services'
                  },
                  {
                    value: 'travel',
                    label: 'Travel',
                    desc: 'Tourism, hospitality, travel agencies, and booking services'
                  },
                  {
                    value: 'ngo',
                    label: 'NGO',
                    desc: 'Non-profit organizations, charities, and social impact organizations'
                  },
                  {
                    value: 'government',
                    label: 'Government',
                    desc: 'Government agencies, public services, and administrative bodies'
                  },
                  {
                    value: 'other',
                    label: 'Other Sector',
                    desc: 'Tell us about your specific industry or sector'
                  }
                ].map(({ value, label, desc }) => (
                  <div key={value} className="flex items-center space-x-3 p-4 border rounded-lg hover:border-blue-200 transition-all">
                    <RadioGroupItem value={value} id={value} />
                    <div className="flex-1">
                      <Label htmlFor={value}>{label}</Label>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {formData.organizationProfile.type === 'other' && (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>Your Industry/Sector</Label>
                    <Input
                      placeholder="e.g., Healthcare, Technology, Manufacturing"
                      value={formData.organizationProfile.customType || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationProfile: {
                            ...formData.organizationProfile,
                            customType: e.target.value
                          }
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Brief Description</Label>
                    <textarea
                      placeholder="Tell us more about what your organization does..."
                      value={formData.organizationProfile.customTypeDescription || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationProfile: {
                            ...formData.organizationProfile,
                            customTypeDescription: e.target.value
                          }
                        })
                      }
                      className="w-full mt-1 p-2 border rounded-md h-24 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">What is the current status of your customer support</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between">
                  <Label>Daily messages/inquiries from customers</Label>
                  <span className="text-sm text-blue-600 font-medium">
                    {formData.organizationProfile.messageVolume.daily}
                  </span>
                </div>
                <Slider
                  value={[formData.organizationProfile.messageVolume.daily]}
                  onValueChange={([value]) =>
                    setFormData({
                      ...formData,
                      organizationProfile: {
                        ...formData.organizationProfile,
                        messageVolume: {
                          ...formData.organizationProfile.messageVolume,
                          daily: value,
                          monthly: value * 30
                        }
                      }
                    })
                  }
                  max={500}
                  step={10}
                  className="mt-2"
                />
                {formData.organizationProfile.messageVolume.daily >= 100 &&
                  formData.organizationProfile.messageVolume.daily <= 300 && (
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <Info className="w-4 h-4 mr-1" />
                      Perfect fit for automation
                    </p>
                  )}
              </div>

              <div>
                <div className="flex justify-between p-2 pb-1">
                  <Label>How much do you spend on customer support monthly ? (USD)</Label>
                  <span className="text-sm text-blue-600 font-medium">
                    ${formData.organizationProfile.supportCost}
                  </span>
                </div>
                <Slider
                  value={[formData.organizationProfile.supportCost]}
                  onValueChange={([value]) =>
                    setFormData({
                      ...formData,
                      organizationProfile: {
                        ...formData.organizationProfile,
                        supportCost: value
                      }
                    })
                  }
                  max={5000}
                  step={100}
                  className="mt-2"
                />
                {formData.organizationProfile.supportCost >= 400 &&
                  formData.organizationProfile.supportCost <= 2000 && (
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <Info className="w-4 h-4 mr-1" />
                      We can help your business reduce this significantly
                    </p>
                  )}
              </div>

              <div>
                <div className="flex justify-between">
                  <Label>Monthly revenue (USD) [Give an estimate]</Label>
                  <span className="text-sm text-blue-600 font-medium">
                    {formData.organizationProfile.revenue}
                  </span>
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      organizationProfile: {
                        ...formData.organizationProfile,
                        revenue: value
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-10k">Less than $10k</SelectItem>
                    <SelectItem value="10k-50k">$10k - $50k</SelectItem>
                    <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                    <SelectItem value="100k+">More than $100k</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">How many employees will be using Intelli?</h3>
            <div className="space-y-8">
              <Slider
                value={[formData.teamSize ?? 1]}
                onValueChange={([value]) => setFormData({ ...formData, teamSize: value })}
                max={50}
                step={1}
                className="mt-6"
              />
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  {formData.teamSize} {formData.teamSize === 1 ? 'member' : 'members'}
                </span>
                <span className="text-sm text-gray-500">
                  {(formData.teamSize ?? 1) < 10 ? 'Startup' : (formData.teamSize ?? 1) < 30 ? 'Growing' : 'Enterprise'}
                </span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Create Your AI Assistant</h3>
            <p className="text-gray-500">This AI assistant will help handle customer inquiries based on your business context</p>
            
            <form onSubmit={handleCreateAssistant} className="space-y-4">
              <div>
                <Label htmlFor="assistant-name">Assistant Name</Label>
                <Input
                  id="assistant-name"
                  placeholder="Give your assistant a name (e.g., SupportBot)"
                  value={assistantFormData.name}
                  onChange={(e) => setAssistantFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="assistant-prompt">Assistant Instructions</Label>
                <Textarea
                  id="assistant-prompt"
                  placeholder="Describe what your assistant should know and how it should respond to customers/Alternatively use and modify the example instructions; we've provided.."
                  value={assistantFormData.prompt}
                  onChange={(e) => setAssistantFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  required
                  className="min-h-[150px] mt-1"
                />
                <div className="flex items-center justify-between mt-1">
                  <div>
                    {/* Show Example Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                      const exampleText = document.getElementById('example-prompt-text');
                      const button = e.currentTarget;
                      if (exampleText) {
                        const isHidden = exampleText.classList.toggle('hidden');
                        // Update button text based on visibility state
                        button.textContent = isHidden ? 'Show Example Instructions' : 'Hide Example Instructions';
                      }
                      }}
                    >
                      Show Example Instructions
                    </Button>
                    
                    {/* Hidden Example Text */}
                    <div id="example-prompt-text" className="hidden text-xs text-gray-500 mt-2 p-3 border rounded-md bg-gray-50 max-w-[600px]">
                      Example: &quot;You are a customer support assistant for [Your Company Name], a  [briefly describe your business, e.g., &quot;subscription-based meal kit service&quot;]. Your role is to help customers with [key services, e.g., &quot;order changes, recipe questions, and account issues&quot;] while being [tone, e.g., &quot;approachable, professional, or upbeat&quot;]. Always align with our brand voice below.&quot; 

                      <p className="font-medium mt-1">Brand Voice & Style</p>
                      - Tone: [e.g., &quot;Friendly but concise. Use simple language and occasional emojis like &quot;]
                      - Avoid/Never: [e.g., &quot;Technical jargon. Never say &quot;That is not my job.&quot;]  
                      - Key phrases: [e.g., &quot;We&quot;ve got your back!&quot;, &quot;Let me help you with that.&quot;]  

                      <p className="font-medium mt-1">Services & Solutions</p>
                      - What we offer: [e.g., &quot;Weekly meal kits with pre-portioned ingredients and step-by-step recipes. Customizable plans for dietary needs.&quot;] 

                      <p className="font-medium mt-1">Resources</p>
                      - Use these resources: Answer questions using the attached [knowledge base/FAQs, e.g., &quot;Recipe_Guide_2024.pdf&quot; or &quot;Delivery_Schedule.csv&quot;]. If unsure, say: [fallback message, e.g., &quot;I&quot;ll need to check with the team! For faster help, visit [Help Page Link]  

                      <p className="font-medium mt-1">Example Interactions</p>
                      - Good response:  
                      User: &quot;How do I skip a delivery?&quot;*  
                      Assistant: *&quot;No problem! Go to &quot;Manage Deliveries&quot; in your account settings and select the week you&quot;d like to skip. Need a hand? I can guide you step by step! &quot;
                      -Avoid: [e.g., &quot;You have to do it yourself in the app.&quot;] 

                      <p className="font-medium mt-1">Response Rules</p>
                      - Keep answers under [length, e.g., &quot;2–3 sentences or bullet points&quot;].  
                      - For [specific scenarios, e.g., &quot;recipe substitutions&quot;], follow this script: [e.g., &quot;1. Ask about dietary needs. 2. Suggest alternatives (e.g., almond milk for dairy). 3. Link to our substitution guide.&quot;] 
                      &quot;
                    </div>
                  </div>
                  
                  {/* Copy Button with Icon - updated to copy full example text */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      const button = e.currentTarget;
                      const fullExampleText = `You are a customer support assistant for [Your Company Name], a [briefly describe your business, e.g., "subscription-based meal kit service"]. Your role is to help customers with [key services, e.g., "order changes, recipe questions, and account issues"] while being [tone, e.g., "approachable, professional, or upbeat"]. Always align with our brand voice below.

Brand Voice & Style
- Tone: [e.g., "Friendly but concise. Use simple language and occasional emojis like "]
- Avoid/Never: [e.g., "Technical jargon. Never say "That is not my job."]
- Key phrases: [e.g., "We've got your back!", "Let me help you with that."]

Services & Solutions
- What we offer: [e.g., "Weekly meal kits with pre-portioned ingredients and step-by-step recipes. Customizable plans for dietary needs."]

Resources
- Use these resources: Answer questions using the attached [knowledge base/FAQs, e.g., "Recipe_Guide_2024.pdf" or "Delivery_Schedule.csv"]. If unsure, say: [fallback message, e.g., "I'll need to check with the team! For faster help, visit [Help Page Link]

Example Interactions
- Good response:
User: "How do I skip a delivery?"
Assistant: "No problem! Go to "Manage Deliveries" in your account settings and select the week you'd like to skip. Need a hand? I can guide you step by step!"
-Avoid: [e.g., "You have to do it yourself in the app."]

Response Rules
- Keep answers under [length, e.g., "2–3 sentences or bullet points"].
- For [specific scenarios, e.g., "recipe substitutions"], follow this script: [e.g., "1. Ask about dietary needs. 2. Suggest alternatives (e.g., almond milk for dairy). 3. Link to our substitution guide."]`;
                      
                      navigator.clipboard.writeText(fullExampleText)
                        .then(() => {
                          // Change icon to check mark
                          const icon = button.querySelector('svg');
                          if (icon) {
                            icon.innerHTML = '<path d="M20 6L9 17l-5-5"/>';
                            icon.setAttribute('stroke', 'currentColor');
                            icon.setAttribute('fill', 'none');
                            icon.setAttribute('stroke-width', '2');
                            icon.setAttribute('stroke-linecap', 'round');
                            icon.setAttribute('stroke-linejoin', 'round');
                          }
                          
                          toast.success("Example prompt copied to clipboard");
                          
                          // Reset after 2 seconds
                          setTimeout(() => {
                            if (icon) {
                              icon.innerHTML = '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M8 10h8"/><path d="M8 14h8"/><path d="M8 18h8"/>';
                            }
                          }, 2000);
                        });
                    }}
                    title="Copy example prompt"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              
                <Button 
                  onClick={handleCreateAssistant}
                  className="w-full" 
                  disabled={isCreatingAssistant}
                  style={{ backgroundColor: '#007fff' }}
                >
                  {isCreatingAssistant ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Assistant...
                  </>
                  ) : "Create Assistant"}
                </Button>
            </form>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Where should we deploy your Assistant first?</h3>
            <div className="grid gap-4">
              {[
                { icon: Globe, name: 'website', label: 'Website Widget', desc: 'Embed on your website' },
                { icon: MessageSquare, name: 'whatsapp', label: 'WhatsApp', desc: 'Connect to WhatsApp Business' },
                { icon: Mail, name: 'email', label: 'Email', desc: 'Handle email inquiries' }
              ].map(channel => (
                <div key={channel.name} className="flex items-center space-x-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
                  <channel.icon className="w-6 h-6 text-blue-500" />
                  <div className="flex-1">
                    <Label>{channel.label}</Label>
                    <p className="text-sm text-gray-500">{channel.desc}</p>
                  </div>
                  <Switch
                    checked={formData.channels?.[0] === channel.name}
                    onCheckedChange={(checked) => {
                      const channels = checked ? [channel.name] : [];

                      // Save to localStorage
                      localStorage.setItem('selectedChannels', JSON.stringify(channels));

                      setFormData({ ...formData, channels });

                      // Handle specific channel actions
                      if (checked) {
                        switch (channel.name) {
                          case 'website':
                            // Redirect to Website Widget page
                            window.location.href = '/dashboard/playground';
                            break;
                          case 'whatsapp':
                            // Redirect to WhatsApp page
                            window.location.href = '/dashboard/channels/whatsapp';
                            break;
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-xl ">
      <Card className="w-full border rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semi-bold">
            {currentStep === 0 ? "What is Intelli?" : `Step ${currentStep} of ${totalSteps - 1}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Progress value={progress} className="h-2 blue-600 bg-blue-200" />
          </div>
          {renderStep()}
          <div className="mt-6 flex justify-end space-x-4">
            {currentStep > 0 && currentStep < totalSteps - 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={loading}
              >
                Back
              </Button>
            )}
            {currentStep < totalSteps - 1 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                style={{ backgroundColor: '#007fff' }}
                className="hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Redirect to /dashboard after onboarding
                  window.location.href = '/dashboard';
                }}
                disabled={loading}
                style={{ backgroundColor: '#007fff' }}
                className="hover:bg-blue-600 relative overflow-hidden shadow-lg
                  before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:to-transparent before:opacity-50
                  after:absolute after:bottom-0 after:h-1/3 after:w-full after:bg-gradient-to-t after:from-black/20 after:to-transparent
                  border-t border-white/30 border-b border-blue-900/30"
              >
                <span className="relative z-10 font-medium">Go to Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 to-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}