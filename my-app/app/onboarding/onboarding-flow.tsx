import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUser } from '@clerk/nextjs';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreateAssistantDialog } from "@/components/create-assistant-dialog";
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { WorkgroundDialog } from '@/components/workground-dialog';
import dynamic from 'next/dynamic';


import {
  Trophy,
  Sparkles,
  Rocket,
  Zap,
  Users,
  Building2,
  MessageSquare,
  Globe,
  Mail
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createNewOrganization } from '@/services/organization';

const DynamicWorkgroundDialog = dynamic(
  () => import('@/components/workground-dialog').then(mod => mod.WorkgroundDialog),
  { ssr: false }
);


const ConfettiExplosion = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className={`
            absolute w-2 h-2 rounded-full
            animate-[confetti_1s_ease-out_forwards]
            ${['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500'][i % 4]}
          `}
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
          animationDelay: `${Math.random() * 0.2}s`
        }}
      />
    ))}
  </div>
);

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

  const { user } = useUser();
  const [businessName, setBusinessName] = useState("");

  const handleCreateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      await createNewOrganization(businessName, user.id);
      toast.success("Business created successfully!");
    } catch (error) {
      console.error("Failed to create business:", error);
      toast.error("Failed to create business");
    }
  };

  interface FormData {
    source: string;
    goals: string[];
    businessType: string;
    otherSource?: string;
    platforms: any[];
    employeeCount: string;
    assistantName: string;
    logo: any;
    personality: string;
    customGoal?: string;
    teamSize?: number;
    channels?: string[];
    aiPersonality?: { [key: string]: boolean };
    organizationProfile: OrganizationProfile;
    assistantPrompt: string;
  }

  const [formData, setFormData] = useState<FormData>({
    source: '',
    goals: [],
    businessType: '',
    platforms: [],
    employeeCount: '',
    assistantName: '',
    logo: null,
    personality: '',
    teamSize: 1,
    channels: [],
    aiPersonality: {
      friendly: false,
      professional: false,
      casual: false,
      formal: false
    },
    organizationProfile: {
      revenue: '',
      teamSize: 4,
      messageVolume: {
        daily: 100,
        monthly: 3000
      },
      supportCost: 500,
      type: '',
      customType: '',
      customTypeDescription: ''
    },
    assistantPrompt: ''
  });

  const totalSteps = 10;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = async () => {
    setLoading(true);

    if (currentStep === 7) {
      try {
        if (!user || !activeOrganizationId) {
          throw new Error('Missing user or organization data');
        }

        const assistantData = {
          name: formData.assistantName || 'Default Assistant',
          prompt: formData.assistantPrompt || 'Default business context prompt',
          organization_id: activeOrganizationId,
          type: formData.organizationProfile.type || 'general',
          user: user.id
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/api/assistants/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assistantData),
        });

        if (!response.ok) {
          throw new Error('Failed to create assistant');
        }

        toast.success('Assistant created successfully!');
      } catch (error) {
        console.error('Error creating assistant:', error);
        toast.error('Failed to create assistant');
        setLoading(false);
        return;
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
                <SelectItem value="google">Google Search</SelectItem>
                <SelectItem value="social">Social Media Ads</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="appstore">Instagram</SelectItem>
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
            <h3 className="text-2xl font-semibold">Tell us about your Business</h3>
            <div className="rounded-lg border p-4 justify items-center">
              <form onSubmit={handleCreateBusiness} className="w-full">
                <div className="mb-4">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Your legal business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <Button type="submit">Create Business</Button>
              </form>
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

      case 5:
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

      case 6:
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

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Create Your AI Assistant</h3>
            <p className="text-gray-500">This AI assistant will help handle customer inquiries based on your business context</p>
            <div className="space-y-4">
              <div>
                <Label>Assistant Name</Label>
                <Input
                  placeholder="e.g., Support Assistant, Sales Helper"
                  value={formData.assistantName}
                  onChange={(e) => {
                    // Validate and format assistant name
                    const name = e.target.value.trim();
                    if (name.length > 0) {
                      setFormData({
                        ...formData,
                        assistantName: name
                      });
                    }
                  }}
                />
              </div>
              <div>
                <Label>Business Context & Knowledge Base</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Provide detailed information about your business, products, services, and common customer inquiries
                </p>
                <Textarea
                  placeholder="Describe your business, products, services, pricing, policies, and any other information your assistant should know..."
                  value={formData.assistantPrompt}
                  onChange={(e) => {
                    const prompt = e.target.value.trim();
                    setFormData({
                      ...formData,
                      assistantPrompt: prompt
                    });
                  }}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </motion.div>
        );


      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold">Where should we deploy your Assistant?</h3>
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
                    checked={(formData.channels ?? []).includes(channel.name)}
                    onCheckedChange={(checked) => {
                      const currentChannels = formData.channels ?? [];
                      const channels = checked
                        ? [...currentChannels, channel.name]
                        : currentChannels.filter(c => c !== channel.name);

                      // Save to localStorage
                      localStorage.setItem('selectedChannels', JSON.stringify(channels));

                      setFormData({ ...formData, channels });

                      // Handle specific channel actions
                      if (checked) {
                        switch (channel.name) {
                          case 'website':
                            // Show Workground dialog
                            const workgroundDialog = document.createElement('div');
                            workgroundDialog.innerHTML = '<div id="workground-root"></div>';
                            document.body.appendChild(workgroundDialog);
                            // You'll need to implement the actual dialog rendering logic
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




      case 9:
        return (
          <div className="space-y-6">
            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                <Trophy className="w-16 h-16" />
                <h2 className="text-3xl font-bold text-center">You&apos;re All Set! 🎉</h2>
                <p className="text-lg text-center max-w-md">
                  Your AI assistant is ready to help your customers. Let&apos;s take you to the dashboard!
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-teal-50 p-6">
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {currentStep === 0 ? "Let's Get You Started" : `Step ${currentStep} of ${totalSteps - 1}`}
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
                className="hover:bg-blue-600"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}