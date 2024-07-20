"use client";
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { joinWaitlist } from '@/lib/waitlist';

const Waitlist: React.FC = () => {
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (email && companyName && phoneNumber) {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('companyName', companyName);
            formData.append('phoneNumber', phoneNumber);

            try {
                setIsLoading(true);

                const { success } = await joinWaitlist(formData);

                if (success) {
                    setHasSubmitted(true);
                    toast.success('Success, you have joined the waitlist');
                } else {
                    toast.error('Failed to join waitlist');
                }
            } catch (error) {
                console.error('Error joining waitlist:', error);
                setError('An error occurred while joining the waitlist');
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('Please fill in all fields');
            showTooltip();
        }
    };

    const showTooltip = () => {
        return (
            <Tooltip>
                <span>Please fill in all fields</span>
            </Tooltip>
        );
    };

    if (hasSubmitted) {
        return (
            <div>
                <span>Thanks for signing up! You have joined our Community of Beta Users.</span>
            </div>
        );
    } else if (error) {
        return (
            <div>
                <span>{toast.error('An error occurred while joining the waitlist')}</span>
            </div>
        );
    }

    return (
        <>
            <Card className="shadow-md  sm:justify-center bg-grey border-none">
                <CardHeader>
                    <CardTitle className="text-center">Join Our Waitlist.</CardTitle>
                    <CardDescription className="">
                        <p className="text-center text-lg font-bold font-medium text-gray-800">
                           Sign up to gain early access to our platform.
                        </p>
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
                            />
                        </Label>
                        <br />
                        <Label>
                            Company Name:
                            <Input
                                placeholder="Your Company/Business Name"
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </Label>
                        <br />
                        <Label>
                            Phone Number:
                            <Input
                                placeholder="Your phone number"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </Label>
                        <br />
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg" type="submit" disabled={isLoading}>
                            {isLoading ? 'Joining Waitlist...' : 'Join Waitlist'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
};

export default Waitlist;
