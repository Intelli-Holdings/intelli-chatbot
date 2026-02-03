"use client"

import { useState } from 'react';
import { CheckCircleIcon, CircleIcon } from 'lucide-react';

const SetupChecklist = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Create Organization', completed: false, active: true },
    { id: 2, name: 'Invite Employees', completed: false, active: false },
    { id: 3, name: 'Choose Channel', completed: false, active: false },
    { id: 4, name: 'Create Business App Service', completed: false, active: false },
    { id: 5, name: 'Deploy App Service', completed: false, active: false }
  ]);

  const [activeTask, setActiveTask] = useState(0);
  const [organization, setOrganization] = useState({ name: '', email: '', phone: '' });
  const [employees, setEmployees] = useState<string[]>([]);
  const [channel, setChannel] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [context, setContext] = useState('');

  const handleNextTask = () => {
    const updatedTasks = tasks.map((task, index) =>
      index === activeTask ? { ...task, completed: true, active: false } : task
    );
    if (activeTask + 1 < tasks.length) {
      updatedTasks[activeTask + 1].active = true;
    }
    setTasks(updatedTasks);
    setActiveTask((prev) => prev + 1);
  };

  const handleAddEmployee = (email: string) => {
    if (email && !employees.includes(email)) {
      setEmployees([...employees, email]);
    }
  };

  const handleChannelSelect = (selectedChannel: string) => {
    if (['whatsapp', 'facebook', 'website'].includes(selectedChannel)) {
      setChannel(selectedChannel);
    }
  };

  return (
    <div className="flex flex-col  min-h-screen ">
      <div className="flex w-3/4 p-8 bg-white rounded-lg shadow-md">
        {/* Left Section: Checklist */}
        <div className="w-1/4 p-4 border-r">
          <h2 className="text-lg font-semibold mb-4">Setup Checklist</h2>
          <div>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-center p-2 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  task.active ? 'bg-gray-200' : ''
                }`}
              >
                <button className="mr-3 focus:outline-none">
                  {task.completed ? (
                    <CheckCircleIcon className="text-green-500 w-5 h-5" />
                  ) : (
                    <CircleIcon className="text-gray-500 w-5 h-5" />
                  )}
                </button>
                <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Task Form */}
        <div className="w-3/4 p-4">
          {activeTask === 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Create Organization</h3>
              <input
                type="text"
                placeholder="Business Name"
                value={organization.name}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                className="border p-2 mb-4 w-full rounded"
              />
              <input
                type="email"
                placeholder="Business Email"
                value={organization.email}
                onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
                className="border p-2 mb-4 w-full rounded"
              />
              <input
                type="tel"
                placeholder="Business Phone"
                value={organization.phone}
                onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
                className="border p-2 mb-4 w-full rounded"
              />
              <button
                onClick={handleNextTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save and Continue
              </button>
            </div>
          )}

          {activeTask === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Invite Employees</h3>
              <input
                type="email"
                placeholder="Enter employee email"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddEmployee(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="border p-2 mb-4 w-full rounded"
              />
              <div className="flex flex-wrap mb-4">
                {employees.map((email) => (
                  <span key={email} className="bg-gray-200 p-2 mr-2 mb-2 rounded-full">
                    {email}
                  </span>
                ))}
              </div>
              <button
                onClick={handleNextTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save and Continue
              </button>
            </div>
          )}

          {activeTask === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Channel</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleChannelSelect('whatsapp')}
                  className={`px-4 py-2 rounded-lg ${
                    channel === 'whatsapp' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleChannelSelect('facebook')}
                  className={`px-4 py-2 rounded-lg ${
                    channel === 'facebook' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleChannelSelect('website')}
                  className={`px-4 py-2 rounded-lg ${
                    channel === 'website' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Website Widget
                </button>
              </div>
              <div className="text-gray-400 mt-4">Coming Soon: Instagram, Email, Voice AI</div>
              <button
                onClick={handleNextTask}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Save and Continue
              </button>
            </div>
          )}

          {activeTask === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Create Business App Service</h3>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
              >
                <option value="">Select AI Model</option>
                <option value="gpt-3.5">GPT-3.5</option>
                <option value="gpt-4">GPT-4</option>
              </select>
              <textarea
                placeholder="Add context for your app service"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
              />
              <button
                onClick={handleNextTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Create App Service
              </button>
            </div>
          )}

          {activeTask === 4 && (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Deploy App Service</h3>
              <div className="text-green-500 mb-4">
                <CheckCircleIcon className="w-12 h-12 inline-block" />
              </div>
              <p className="text-xl font-bold">App Service Deployed Successfully!</p>
              <p className="text-gray-600 mt-4">Your service URL: <span className="text-blue-500 underline">https://intelli.app/service-url</span></p>
              <div className="mt-6">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupChecklist;
