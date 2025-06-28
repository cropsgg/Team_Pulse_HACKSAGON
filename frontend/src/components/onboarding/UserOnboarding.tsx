'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Heart, 
  Building, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  FileText,
  Settings
} from 'lucide-react';

interface UserOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function UserOnboarding({ onComplete, onSkip }: UserOnboardingProps) {
  const { user, userRole } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    selectedRole: (userRole && userRole.length > 0) ? userRole[0] as UserRole : UserRole.DONOR,
    website: '',
    twitter: '',
    linkedin: '',
  });

  // Role selection step
  const RoleSelectionStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Your Role</h3>
        <p className="text-muted-foreground">
          Select the role that best describes how you plan to use the platform.
        </p>
      </div>
      
      <div className="grid gap-4">
        {[
          {
            role: UserRole.DONOR,
            title: 'Donor',
            description: 'Support NGOs and charitable causes',
            icon: <Heart className="w-6 h-6" />,
            features: ['Make donations', 'Track impact', 'Receive tax receipts']
          },
          {
            role: UserRole.NGO_ADMIN,
            title: 'NGO Administrator',
            description: 'Manage an NGO and receive donations',
            icon: <Building className="w-6 h-6" />,
            features: ['Create campaigns', 'Manage funds', 'Report impact']
          },
          {
            role: UserRole.VC,
            title: 'Venture Capitalist',
            description: 'Invest in startups and participate in governance',
            icon: <TrendingUp className="w-6 h-6" />,
            features: ['Invest in startups', 'Vote on proposals', 'Access analytics']
          },
          {
            role: UserRole.FOUNDER,
            title: 'Startup Founder',
            description: 'Raise funding for your startup',
            icon: <User className="w-6 h-6" />,
            features: ['Create funding rounds', 'Manage milestones', 'Engage investors']
          }
        ].map(({ role, title, description, icon, features }) => (
          <Card 
            key={role}
            className={`cursor-pointer transition-all ${
              formData.selectedRole === role 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-accent'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, selectedRole: role as UserRole }))}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  {icon}
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-sm">{description}</CardDescription>
                </div>
                {formData.selectedRole === (role as UserRole) && (
                  <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const steps = [
    {
      id: 'role',
      title: 'Choose Role',
      description: 'Select your primary role on the platform',
      icon: <User className="w-5 h-5" />,
      component: <RoleSelectionStep />,
      completed: !!formData.selectedRole,
      required: true,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Getting Started</h2>
          <Badge variant="outline">
            Step {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="mb-4" />
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep.component}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" disabled>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onComplete}>
          Complete
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 