import React, { useState } from 'react';
import { Copy, Check, Plus, X } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface TeamForm {
  businessName: string;
  companyEmail: string;
  description: string;
}

const OnboardingComponent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamForm, setTeamForm] = useState<TeamForm>({
    businessName: '',
    companyEmail: '',
    description: '',
  });
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [apiKey] = useState('xai-wXKcD6jvLOrhu0QyaNEUlKmCgxa0uXNfdzqxJdXRBckoFKCXZ');
  
  const steps: OnboardingStep[] = [
    { id: 1, title: 'Create team', isCompleted: currentStep > 1 },
    { id: 2, title: 'Invite members', isCompleted: currentStep > 2 },
    { id: 3, title: 'Create an API key', isCompleted: currentStep > 3 },
  ];

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamForm.businessName.trim() && teamForm.companyEmail.trim()) {
      setCurrentStep(2);
    }
  };

  const handleTeamFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTeamForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleInviteEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const addEmailField = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  const removeEmailField = (index: number) => {
    if (inviteEmails.length > 1) {
      const newEmails = inviteEmails.filter((_, i) => i !== index);
      setInviteEmails(newEmails);
    }
  };

  const handleInviteMembers = (e: React.FormEvent) => {
    e.preventDefault();
    const validEmails = inviteEmails.filter(email => email.trim().length > 0);
    if (validEmails.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
    } catch (err) {
      console.error('Failed to copy API key:', err);
    }
  };

  const sampleCode = `curl https://api.x.ai/v1/chat/completions -H "Content-Type: application/json" \\
"messages": [
  {
    "role": "system",
    "content": "You are a test assistant."
  },
  {
    "role": "user",
    "content": "Testing. Just say hi and hello world and nothing else."
  }
],
"model": "grok-beta",
"stream": false,
"temperature": 0
}`;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-bold">x1</div>
          <button className="text-gray-500 hover:text-gray-700">Logout</button>
        </div>

        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start space-x-4">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${step.isCompleted 
                  ? 'bg-black text-white' 
                  : step.id === currentStep 
                    ? 'border-2 border-black text-black' 
                    : 'border-2 border-gray-300 text-gray-300'
                }
              `}>
                {step.isCompleted ? <Check size={14} /> : step.id}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${step.id === currentStep ? 'text-black' : 'text-gray-400'}`}>
                  {step.title}
                </h3>
                
                {step.id === 1 && currentStep === 1 && (
                  <form onSubmit={handleCreateTeam} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={teamForm.businessName}
                        onChange={handleTeamFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter business name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Email</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={teamForm.companyEmail}
                        onChange={handleTeamFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter company email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={teamForm.description}
                        onChange={handleTeamFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter a team description"
                        rows={4}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    >
                      Create team
                    </button>
                  </form>
                )}

                {step.id === 2 && currentStep === 2 && (
                  <form onSubmit={handleInviteMembers} className="mt-4 space-y-4">
                    <div className="space-y-3">
                      {inviteEmails.map((email, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleInviteEmailChange(index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Enter email address"
                          />
                          {inviteEmails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEmailField(index)}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={addEmailField}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                      <Plus size={16} />
                      <span>Add another email</span>
                    </button>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                      >
                        Send invites
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Skip for now
                      </button>
                    </div>
                  </form>
                )}

                {step.id === 3 && currentStep === 3 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-600">
                      Make sure to copy your API key now as you won't be able to see it again. It
                      may take a few seconds for it to propagate.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Key status</div>
                      <div className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span>Ready to use</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Here's your API key:</div>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-gray-100 p-2 rounded">{apiKey}</code>
                        <button
                          onClick={handleCopyApiKey}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Start by making your first request to the chat completions API:
                      </div>
                      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                        <code>{sampleCode}</code>
                      </pre>
                    </div>

                    <button
                      onClick={() => setCurrentStep(4)}
                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingComponent;