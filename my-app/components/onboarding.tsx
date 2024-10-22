import { useState } from 'react';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // Handler for creating a team
  const handleCreateTeam = () => {
    if (teamName.trim() === '') {
      alert('Team name is required');
      return;
    }
    // Proceed to next step (invite members)
    setCurrentStep(2);
  };
  
  // Handler to simulate API key generation and move to next step
  const handleInviteMembers = () => {
    // Simulate API key generation
    const generatedApiKey = 'xai-' + Math.random().toString(36).substring(2, 40);
    setApiKey(generatedApiKey);
    setCurrentStep(3);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API Key copied to clipboard!');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white shadow-md p-8 rounded-lg">
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create team</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Team name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                placeholder="Enter team name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                placeholder="Enter a team description"
              />
            </div>
            <button
              onClick={handleCreateTeam}
              className="w-full bg-black text-white py-2 px-4 rounded-md">
              Create team
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Invite members</h2>
            {/* Simulating Invite Members */}
            <p>Invite members to your team.</p>
            <button
              onClick={handleInviteMembers}
              className="w-full bg-black text-white py-2 px-4 rounded-md mt-4">
              Continue
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create an API key</h2>
            <p className="text-sm text-gray-500">Make sure to copy your API key as you won’t be able to see it again.</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-md text-center">
              <input
                type="text"
                value={apiKey}
                readOnly
                className="text-center bg-transparent font-mono w-full"
              />
              <button
                onClick={handleCopyApiKey}
                className="mt-2 bg-gray-500 text-white py-1 px-3 rounded-md">
                Copy API Key
              </button>
            </div>
            <pre className="bg-gray-200 p-2 rounded-md mt-4 text-xs overflow-auto">
              {`curl https://api.x.ai/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer ${apiKey}" -d '{
  "messages": [
    { "role": "system", "content": "You are a test assistant." },
    { "role": "user", "content": "Testing. Just say hi and hello world and nothing else." }
  ],
  "model": "grok-beta",
  "stream": false,
  "temperature": 0
}'`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
