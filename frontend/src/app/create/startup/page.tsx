'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCreationForm } from '@/components/forms';
import { ProtectedRoute } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateStartupPage() {
  const router = useRouter();

  const handleSuccess = (project: any) => {
    toast.success('Startup project created successfully!');
    // Navigate to the project page or dashboard
    router.push(`/project/${project.id || 'new'}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProtectedRoute requiredPermissions={['create_startup_project']}>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-wide py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Startup</h1>
                    <p className="text-gray-600">Launch your venture on ImpactChain</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>ImpactChain Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-wide py-8">
          <div className="max-w-4xl mx-auto">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Rocket className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Creating a Startup Project</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your startup will be reviewed by our investment committee. 
                    Once approved, accredited investors will be able to view and invest in your venture. 
                    Provide comprehensive business information for the best results.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Creation Form */}
            <ProjectCreationForm
              projectType="startup"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              className="bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white border-t border-gray-200 mt-12">
          <div className="container-wide py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Rocket className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Innovation</h3>
                  <p className="text-sm text-gray-600">
                    Showcase your unique value proposition and how you're solving real problems.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Growth Potential</h3>
                  <p className="text-sm text-gray-600">
                    Demonstrate clear market opportunity and scalable business model.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Investment Ready</h3>
                  <p className="text-sm text-gray-600">
                    Provide financial projections and clear use of funds for investor confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 