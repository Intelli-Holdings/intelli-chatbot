import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Shield, UserCheck, FileText, Cpu, Server, Zap, BarChart } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="flex items-start space-x-3 mb-4">
    <Icon className="h-5 w-5 text-pink-500 mt-1 flex-shrink-0" />
    <div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const EnterpriseFeatures = () => {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-pink-500 font-semibold mb-2">ENTERPRISE</h2>
        <h1 className="text-3xl font-bold mb-4">Secure and Scalable by Default</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gumloop is being built with a primary focus on security and scalability, ensuring ironclad protection for
          your data while providing the scalability to meet your evolving needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-pink-500">Security Features</CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureItem
              icon={Shield}
              title="SOC 2 & GDPR Compliance"
              description="We're entering the observation period for SOC 2 and GDPR compliance. See details in the link below."
            />
            <FeatureItem
              icon={FileText}
              title="No Training on Your Data"
              description="Your data remains untouched for AI training, backed by comprehensive data processing agreements."
            />
            <FeatureItem
              icon={Lock}
              title="State-of-the-Art Encryption"
              description="Information safeguarded with AES-256 encryption, both at rest and during transmission."
            />
            <FeatureItem
              icon={UserCheck}
              title="Fine-Grained Access Control"
              description="Implement precise user permissions and role-based access for authorized users only."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-pink-500">Scalability Features</CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureItem
              icon={Cpu}
              title="Auto-scaling Compute"
              description="System automatically adjusts compute resources based on demand for optimal performance."
            />
            <FeatureItem
              icon={Server}
              title="Reserved Compute for Enterprise"
              description="Enterprise customers can reserve compute resources for consistent performance."
            />
            <FeatureItem
              icon={Zap}
              title="Parallelized Execution"
              description="Workflows automatically execute steps in parallel to reduce processing time and improve efficiency."
            />
            <FeatureItem
              icon={BarChart}
              title="Usage Tracking & Monitoring"
              description="Track usage metrics and monitor system performance to optimize workflows and resource allocation."
            />
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <button className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
          Read more about our policies
        </button>
      </div>
    </div>
  );
};

export default EnterpriseFeatures;