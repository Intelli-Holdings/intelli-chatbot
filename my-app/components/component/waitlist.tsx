"use client";
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { joinWaitlist } from '@/lib/waitlist';

const Waitlist: React.FC = () => {
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = email && companyName && phoneNumber && fullName;

    useEffect(() => {
        const savedForm = localStorage.getItem('waitlistForm');
        if (savedForm) {
            const { email, companyName, phoneNumber, fullName } = JSON.parse(savedForm);
            setEmail(email);
            setCompanyName(companyName);
            setPhoneNumber(phoneNumber);
            setFullName(fullName);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isFormValid) {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('companyName', companyName);
            formData.append('phoneNumber', phoneNumber);
            formData.append('fullName', fullName);

            try {
                setIsLoading(true);
                const { success } = await joinWaitlist(formData);

                if (success) {
                    setIsSubmitted(true);
                    localStorage.setItem('waitlistForm', JSON.stringify({ email, companyName, phoneNumber, fullName }));
                    toast.success('Success! You have joined the waitlist and received a 20% discount!');
                } else {
                    toast.error('Failed to join waitlist');
                }
            } catch (error) {
                console.error('Error joining waitlist:', error);
                toast.error('Something went wrong, please try submitting again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            toast.error('Please fill in all fields');
        }
    };

    return (
        <Card className="bg-white rounded-lg p-6">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Early Access Form</CardTitle>
                <CardDescription className="text-lg font-medium text-gray-600">
                    Join the waitlist to get a 20% discount.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="block text-gray-700 font-medium mb-2">Full Name:</Label>
                        <Input
                            placeholder="Your full name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="border border-gray-150 shadow-sm rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <Label className="block text-gray-700 font-medium mb-2">Email:</Label>
                        <Input
                            placeholder="Your email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border border-gray-150 shadow-sm rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <Label className="block text-gray-700 font-medium mb-2">Company Name:</Label>
                        <Input
                            placeholder="Your company name"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="border border-gray-150 shadow-sm rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <Label className="block text-gray-700 font-medium mb-2">Phone Number:</Label>
                        <Input
                            placeholder="Start with country code e.g +1"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="border border-gray-150 shadow-sm rounded-md px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md border border-gray-150 shadow-sm text-lg"
                        type="submit"
                        disabled={!isFormValid || isLoading || isSubmitted}
                    >
                        {isSubmitted ? 'Joined Waitlist!' : isLoading ? 'Joining Waitlist...' : 'Join Waitlist'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default Waitlist;