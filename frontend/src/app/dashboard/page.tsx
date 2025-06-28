'use client';

import React, { useEffect, useState } from 'react';
import { UserDashboard } from '@/components/dashboard';
import { ProtectedRoute } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface StoredProject {
  id: string;
  title: string;
  type: string;
  fundingGoal: number;
  currency: string;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    address: string;
    name: string;
  };
}

export default function DashboardPage() {
  const [userProjects, setUserProjects] = useState<StoredProject[]>([]);

  useEffect(() => {
    // Load projects from localStorage
    const projects = JSON.parse(localStorage.getItem('user-projects') || '[]');
    setUserProjects(projects);
  }, []);

  return (
    <ProtectedRoute requiredPermissions={['view_dashboard']}>
      <main className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your projects and track their progress
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/create/startup">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Create Startup</h3>
                  <p className="text-gray-600 text-sm">Launch your startup funding campaign</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/create/ngo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Create NGO Project</h3>
                  <p className="text-gray-600 text-sm">Start a charitable cause</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/explore">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Explore Projects</h3>
                  <p className="text-gray-600 text-sm">Discover and support causes</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* User Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <p className="text-gray-600">
                {userProjects.length === 0 
                  ? "You haven't created any projects yet. Start by creating your first project!"
                  : `You have created ${userProjects.length} project${userProjects.length !== 1 ? 's' : ''}`
                }
              </p>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Plus className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-6">Create your first project to get started</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/create/startup">
                      <Button>Create Startup</Button>
                    </Link>
                    <Link href="/create/ngo">
                      <Button variant="outline">Create NGO Project</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {userProjects.map((project) => (
                    <Card key={project.id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {project.title}
                              </h3>
                              <Badge variant={project.type === 'startup' ? 'default' : 'secondary'}>
                                {project.type === 'startup' ? 'Startup' : 'NGO'}
                              </Badge>
                              <Badge variant="outline" className="text-green-600">
                                {project.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>Goal: {project.fundingGoal.toLocaleString()} {project.currency}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Creator:</span> {project.creator.name} 
                              <span className="text-gray-400 ml-2">({project.creator.address.slice(0, 6)}...{project.creator.address.slice(-4)})</span>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-6">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Original UserDashboard component for additional features */}
          <div className="mt-8">
            <UserDashboard />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 