'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Edit, Send, Trash2, Plus, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Playground() {
  const [useCustomAssistants, setUseCustomAssistants] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>("You are a helpful assistant.");
  const [customAssistants, setCustomAssistants] = useState<string[]>(["My Assistant 1", "My Assistant 2"]);
  const [newAssistantName, setNewAssistantName] = useState<string>("");
  const [isAddingAssistant, setIsAddingAssistant] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultModels = ["gpt-3.5-turbo", "gpt-4", "claude-v1"];

  const handleSendMessage = () => {
    if (newMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: newMessage },
        { role: 'assistant', content: `Response from ${selectedAssistant}: ${newMessage}` },
      ]);
      setNewMessage("");
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const handleAddAssistant = () => {
    if (newAssistantName) {
      setCustomAssistants((prev) => [...prev, newAssistantName]);
      setNewAssistantName("");
      setIsAddingAssistant(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full mx-auto my-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-background">
          {/* Side Panel */}
          <div className="w-full lg:w-1/4 p-4 border-r border-border border-rounded-sm ">
            <h2 className="text-xl font-semibold mb-4">Playground</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="custom-assistant-mode"
                  checked={useCustomAssistants}
                  onCheckedChange={setUseCustomAssistants}
                />
                <Label htmlFor="custom-assistant-mode">Use Custom Assistants</Label>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {useCustomAssistants ? "Custom Assistant" : "Model"}
                </label>
                <Select 
                  value={selectedAssistant} 
                  onValueChange={setSelectedAssistant}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(useCustomAssistants ? customAssistants : defaultModels).map((assistant) => (
                        <SelectItem key={assistant} value={assistant}>
                          {assistant}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {useCustomAssistants && (
                <Dialog open={isAddingAssistant} onOpenChange={setIsAddingAssistant}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Assistant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Assistant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        value={newAssistantName}
                        onChange={(e) => setNewAssistantName(e.target.value)}
                        placeholder="Enter assistant name"
                      />
                      <Button onClick={handleAddAssistant}>Add Assistant</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">System Prompt</label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt"
                  className="h-24"
                />
              </div>
             
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-foreground mb-1">
                  Upload File (PDF, DOC, TXT)
                </label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="sr-only"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                  >
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload a file
                    </Button>
                  </label>
                </div>
                {uploadedFile && (
                  <div className="mt-2 flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <span className="text-sm text-foreground truncate">{uploadedFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <Card className="h-full">
                <ScrollArea className="h-full p-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <p className={`font-bold ${msg.role === 'user' ? 'text-primary' : 'text-secondary'}`}>
                        {msg.role === 'user' ? 'You:' : 'Assistant:'}
                      </p>
                      <p className={`${msg.role === 'user' ? 'bg-primary/10' : 'bg-secondary/10'} p-2 rounded-lg inline-block`}>
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </ScrollArea>
              </Card>
            </div>
            <div className="p-4 bg-background border-t border-border">
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
                <Button variant="outline" onClick={handleClearConversation}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}