import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Intelli Onboarding Process",
    description: "Step-by-step guide to onboard new customers to Intelli",
}

export default function OnboardingFlow() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-6">Intelli Customer Onboarding Process</h1>
            
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">1. Initial Setup</h2>
                <div className="space-y-4">
                    <div className="bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-2">Request Dedicated Phone Number</h3>
                        <p>Request a dedicated phone number from the customer to be assigned to their Intelli WhatsApp assistant.</p>
                        <Image 
                            src="/images/onboarding-flow.png"
                            alt="Phone number setup process"
                            width={600}
                            height={400}
                            className="mt-4 rounded-lg"
                        />
                        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                            Add phone number setup image
                        </div>
                    </div>

                    <div className="bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-2">Meta Developer Account Setup</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Create a new WhatsApp app on Meta developers account</li>
                            <li>Register the app with the assigned phone number</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">2. Business Information Collection</h2>
                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-3">Required Information:</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Business FAQs</li>
                        <li>Business Details</li>
                        <li>Amadeus Client Secret Key</li>
                        <li>Amadeus Client ID</li>
                    </ul>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">3. Technical Setup</h2>
                <div className="space-y-4">
                    <div className="bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-2">OpenAI Assistant Creation</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Create OpenAI assistant using collected information</li>
                            <li>Create and deploy business-specific branch</li>
                            <li>Deploy instance on Render</li>
                        </ul>
                    </div>

                    <div className="bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-2">AppService Configuration</h3>
                        <pre className="bg-gray-800 text-white p-4 rounded-md mt-2">
                            <code>{`Required Meta Information:
- phone_number_id
- phone_number
- app_secret
- access_token
- whatsapp_business_account_id
- assistant_id (from OpenAI)`}</code>
                        </pre>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">4. Business Model Setup</h2>
                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-3">Required Details:</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Business name</li>
                        <li>Slug (optional)</li>
                        <li>Owner&apos;s email</li>
                        <li>Organization ID</li>
                    </ul>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">5. Final Steps</h2>
                <div className="space-y-4">
                    <div className="bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-2">Setup Verification</h3>
                        <p>Verify that the WhatsApp assistant is functioning as expected</p>
                    </div>

                    <div className="bg-muted p-6 rounded-lg">
                        <h3 className="text-xl font-medium mb-2">Customer Training</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Provide training on WhatsApp assistant usage</li>
                            <li>Setup ongoing support channels</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}
