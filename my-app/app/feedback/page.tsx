'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FeedbackForm {
    satisfaction: string;
    targetAudience: string;
    mainBenefit: string;
    improvements: string;
}

export default function FeedbackPage({ onComplete }: { onComplete: () => void }) {
    const [formData, setFormData] = useState<FeedbackForm>({
        satisfaction: "",
        targetAudience: "",
        mainBenefit: "",
        improvements: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (value: string) => {
        setFormData(prev => ({ ...prev, satisfaction: value }));
    };

    const handleSubmit = async () => {
        // Validate all fields are filled
        if (!Object.values(formData).every(value => value.trim())) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            toast.success("Thank you for your feedback!");
            onComplete?.();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-1 p-4 m-2 justify-center mx-auto">
            <Card className="shadow-md border rounded-xl max-w-2xl w-full">
                <CardHeader>
                    <CardTitle className="text-xl font-medium">
                        Your answers help us make the product better
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="text-sm font-medium mb-3">
                            1. How would you feel if you could no longer use Intelli?
                        </Label>
                        <RadioGroup
                            value={formData.satisfaction}
                            onValueChange={handleRadioChange}
                            className="mt-2 space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="very_disappointed" id="very_disappointed" />
                                <Label htmlFor="very_disappointed">Very disappointed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="somewhat_disappointed" id="somewhat_disappointed" />
                                <Label htmlFor="somewhat_disappointed">Somewhat disappointed</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="not_disappointed" id="not_disappointed" />
                                <Label htmlFor="not_disappointed">Not disappointed</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">
                            2. Describe the type of people you think would benefit most from Intelli?
                        </Label>
                        <Textarea
                            name="targetAudience"
                            placeholder="Give a detailed description."
                            value={formData.targetAudience}
                            onChange={handleTextAreaChange}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium">
                            3. What is the main benefit you receive from Intelli?
                        </Label>
                        <Textarea
                            name="mainBenefit"
                            placeholder="Describe what you use Intelli for and what you gain from using it."
                            value={formData.mainBenefit}
                            onChange={handleTextAreaChange}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium">
                            4. How can we improve Intelli for you?
                        </Label>
                        <Textarea
                            name="improvements"
                            placeholder="Describe the things you would like Intelli to be able to do"
                            value={formData.improvements}
                            onChange={handleTextAreaChange}
                            className="mt-2"
                        />
                    </div>

                    <Button 
                        className="w-full bg-blue-200 border-blue-200 text-black hover:text-white hover:bg-blue-500 border rounded-xl"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


