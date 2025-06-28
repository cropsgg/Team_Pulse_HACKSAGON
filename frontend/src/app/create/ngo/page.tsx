'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCreationForm } from '@/components/forms';
import { ProtectedRoute } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateNGOPage() {
  const router = useRouter();

  const handleSuccess = (project: any) => {
    toast.success('NGO project created successfully!');
    // Navigate to the project page or dashboard
    router.push(`/project/${project.id || 'new'}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProtectedRoute requiredPermissions={['create_ngo_project']}>
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
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create NGO Project</h1>
                    <p className="text-gray-600">Launch your charitable initiative on CharityChain</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>CharityChain Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-wide py-8">
          <div className="max-w-4xl mx-auto">
            {/* Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900">Creating an NGO Project</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your project will be submitted for review after creation. Once approved, 
                    it will be live on the platform and eligible to receive donations. 
                    Make sure to provide complete and accurate information.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Creation Form */}
            <ProjectCreationForm
              projectType="ngo"
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
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Impact Focused</h3>
                  <p className="text-sm text-gray-600">
                    Clearly define your project's social impact and how it will help communities.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Transparent</h3>
                  <p className="text-sm text-gray-600">
                    Provide detailed information about your organization and how funds will be used.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ArrowLeft className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Supported</h3>
                  <p className="text-sm text-gray-600">
                    Our team will help review and optimize your project for maximum impact.
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
