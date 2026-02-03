"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingInfoForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    usage: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Onboarding Info:", formData);
    onComplete();
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Tell Us About Yourself</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="mb-4">
          <label className="block text-sm font-medium">Who are you?</label>
          <Input
            name="name"
            placeholder="Your name or role"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Where did you hear about us?</label>
          <Input
            name="source"
            placeholder="E.g., Google, Friend, Social Media"
            value={formData.source}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">What will you use Intelli for?</label>
          <Textarea
            name="usage"
            placeholder="Describe your intended use case"
            value={formData.usage}
            onChange={handleInputChange}
          />
        </div>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogContent>
    </div>
  );
}
