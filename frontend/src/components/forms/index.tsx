'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import {
  Upload,
  Image as ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  Users,
  FileText,
  Tag,
  Globe,
  Plus,
  X,
  Camera,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}

const FormField = ({ label, error, required, description, children }: FormFieldProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {description && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
    {error && (
      <p className="text-xs text-red-600 flex items-center space-x-1">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

interface CampaignFormData {
  title: string;
  description: string;
  shortDescription: string;
  goal: string;
  deadline: string;
  category: string;
  location: {
    country: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  tags: string[];
  images: File[];
  documents: File[];
  milestones: Array<{
    title: string;
    description: string;
    targetAmount: string;
    deadline: string;
  }>;
  kpis: Array<{
    name: string;
    description: string;
    target: string;
    unit: string;
  }>;
}

export const CampaignCreationForm = ({ onSubmit }: { onSubmit: (data: CampaignFormData) => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    shortDescription: '',
    goal: '',
    deadline: '',
    category: '',
    location: { country: '', region: '' },
    tags: [],
    images: [],
    documents: [],
    milestones: [{ title: '', description: '', targetAmount: '', deadline: '' }],
    kpis: [{ name: '', description: '', target: '', unit: '' }]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const categories = [
    'education', 'healthcare', 'environment', 'poverty', 'disaster-relief',
    'animal-welfare', 'human-rights', 'technology', 'infrastructure', 'arts-culture'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 2:
        if (!formData.goal || parseFloat(formData.goal) <= 0) newErrors.goal = 'Valid funding goal is required';
        if (!formData.deadline) newErrors.deadline = 'Campaign deadline is required';
        if (!formData.location.country.trim()) newErrors.country = 'Country is required';
        break;
      case 3:
        if (formData.images.length === 0) newErrors.images = 'At least one image is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', targetAmount: '', deadline: '' }]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const addKPI = () => {
    setFormData(prev => ({
      ...prev,
      kpis: [...prev.kpis, { name: '', description: '', target: '', unit: '' }]
    }));
  };

  const removeKPI = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText },
    { id: 2, title: 'Goals & Timeline', icon: Target },
    { id: 3, title: 'Media & Documents', icon: ImageIcon },
    { id: 4, title: 'Milestones & KPIs', icon: CheckCircle },
    { id: 5, title: 'Review & Submit', icon: Shield }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField label="Campaign Title" required error={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a compelling campaign title..."
                maxLength={100}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.title.length}/100
              </div>
            </FormField>

            <FormField label="Short Description" required error={errors.shortDescription}>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief summary for campaign cards..."
                maxLength={150}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.shortDescription.length}/150
              </div>
            </FormField>

            <FormField label="Category" required error={errors.category}>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={formData.category === category ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, category }))}
                    className="justify-start text-sm"
                  >
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </FormField>

            <FormField label="Detailed Description" required error={errors.description}>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description of your campaign, its goals, and expected impact..."
                className="w-full p-3 border rounded-md h-32 resize-none"
                maxLength={2000}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.description.length}/2000
              </div>
            </FormField>

            <FormField label="Tags" description="Add relevant tags to help people discover your campaign">
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormField>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <FormField label="Funding Goal" required error={errors.goal}>
              <Input
                type="number"
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="0"
                leftIcon={<DollarSign className="h-4 w-4" />}
                rightText="USD"
              />
            </FormField>

            <FormField label="Campaign Deadline" required error={errors.deadline}>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                leftIcon={<Calendar className="h-4 w-4" />}
              />
            </FormField>

            <FormField label="Location" required>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    value={formData.location.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, country: e.target.value }
                    }))}
                    placeholder="Country"
                    leftIcon={<Globe className="h-4 w-4" />}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>
                <Input
                  value={formData.location.region}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, region: e.target.value }
                  }))}
                  placeholder="State/Region"
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </FormField>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField label="Campaign Images" required error={errors.images}>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB each
                    </p>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Campaign image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="Supporting Documents" description="Optional: Upload PDFs, reports, or other supporting documents">
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload supporting documents
                </p>
              </div>
            </FormField>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Project Milestones</h3>
                <Button type="button" onClick={addMilestone} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      {formData.milestones.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[index].title = e.target.value;
                          setFormData(prev => ({ ...prev, milestones: newMilestones }));
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Target amount"
                        value={milestone.targetAmount}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[index].targetAmount = e.target.value;
                          setFormData(prev => ({ ...prev, milestones: newMilestones }));
                        }}
                        leftIcon={<DollarSign className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <textarea
                        placeholder="Milestone description"
                        value={milestone.description}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[index].description = e.target.value;
                          setFormData(prev => ({ ...prev, milestones: newMilestones }));
                        }}
                        className="w-full p-3 border rounded-md h-20 resize-none"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <Input
                        type="date"
                        value={milestone.deadline}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[index].deadline = e.target.value;
                          setFormData(prev => ({ ...prev, milestones: newMilestones }));
                        }}
                        leftIcon={<Calendar className="h-4 w-4" />}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
                <Button type="button" onClick={addKPI} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add KPI
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.kpis.map((kpi, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">KPI {index + 1}</h4>
                      {formData.kpis.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeKPI(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        placeholder="KPI name"
                        value={kpi.name}
                        onChange={(e) => {
                          const newKPIs = [...formData.kpis];
                          newKPIs[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, kpis: newKPIs }));
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Target value"
                        value={kpi.target}
                        onChange={(e) => {
                          const newKPIs = [...formData.kpis];
                          newKPIs[index].target = e.target.value;
                          setFormData(prev => ({ ...prev, kpis: newKPIs }));
                        }}
                      />
                      <Input
                        placeholder="Unit (e.g., people)"
                        value={kpi.unit}
                        onChange={(e) => {
                          const newKPIs = [...formData.kpis];
                          newKPIs[index].unit = e.target.value;
                          setFormData(prev => ({ ...prev, kpis: newKPIs }));
                        }}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <textarea
                        placeholder="KPI description"
                        value={kpi.description}
                        onChange={(e) => {
                          const newKPIs = [...formData.kpis];
                          newKPIs[index].description = e.target.value;
                          setFormData(prev => ({ ...prev, kpis: newKPIs }));
                        }}
                        className="w-full p-3 border rounded-md h-20 resize-none"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-charity-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Review Your Campaign</h3>
              <p className="text-muted-foreground">
                Please review all information before submitting for approval
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Campaign Details</h4>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                  <p><strong>Goal:</strong> {formatCurrency(parseFloat(formData.goal) || 0)}</p>
                  <p><strong>Location:</strong> {formData.location.country}, {formData.location.region}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Media</h4>
                  <p>{formData.images.length} images uploaded</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Milestones</h4>
                  <p>{formData.milestones.length} milestones defined</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">KPIs</h4>
                  <p>{formData.kpis.length} KPIs defined</p>
                </div>
              </div>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Campaign Review Process
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Your campaign will be reviewed by our team within 24-48 hours. 
                    You'll receive an email once it's approved and goes live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-charity-500 border-charity-500 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-4 min-w-0">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-charity-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-charity-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Progress value={(currentStep / steps.length) * 100} variant="charity" />
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 5) {
            onSubmit(formData);
          }
        }}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                variant="charity"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="charity"
              >
                Submit for Review
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export const QuickDonationForm = ({ 
  campaignId, 
  onSubmit 
}: { 
  campaignId: string; 
  onSubmit: (data: any) => void; 
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-charity-500" />
          <span>Quick Donation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ campaignId, amount, message, isAnonymous });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (USD)</label>
            <div className="flex space-x-2 mb-3">
              {[25, 50, 100, 250].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              leftIcon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave an encouraging message..."
              className="w-full p-3 border rounded-md h-20 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous" className="text-sm">Donate anonymously</label>
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="charity"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Donate {amount ? formatCurrency(parseFloat(amount)) : '$0'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 