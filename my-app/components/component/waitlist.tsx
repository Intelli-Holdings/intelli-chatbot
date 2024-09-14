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
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = email && companyName && phoneNumber;

    useEffect(() => {
        const savedForm = localStorage.getItem('waitlistForm');
        if (savedForm) {
            const { email, companyName, phoneNumber } = JSON.parse(savedForm);
            setEmail(email);
            setCompanyName(companyName);
            setPhoneNumber(phoneNumber);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isFormValid) {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('companyName', companyName);
            formData.append('phoneNumber', phoneNumber);

            try {
                setIsLoading(true);
                const { success } = await joinWaitlist(formData);

                if (success) {
                    setIsSubmitted(true);
                    localStorage.setItem('waitlistForm', JSON.stringify({ email, companyName, phoneNumber }));
                    toast.success('Success! You have joined the waitlist and received a 20% discount!');
                } else {
                    toast.error('Failed to join waitlist');
                }
            } catch (error) {
                console.error('Error joining waitlist:', error);
                toast.error('Something went wrong on, please try submitting again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            toast.error('Please fill in all fields');
        }
    };

    return (
        <Card className="sm:justify-center border-none">
            <CardHeader>
                <CardTitle className="text-center text-2xl">Early Access Form</CardTitle>
                <CardDescription className="text-center text-lg font-bold font-medium text-gray-800">
                   Join the waitlist to get a 20% discount.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Label>
                        Email:
                        <Input
                            placeholder="Your email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Label>
                    <br />
                    <Label>
                        Company Name:
                        <Input
                            placeholder="Your company name"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </Label>
                    <br />
                    <Label>
                        Phone Number:
                        <Input
                            placeholder="Start with country code e.g +1"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </Label>
                    <br />
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg" 
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