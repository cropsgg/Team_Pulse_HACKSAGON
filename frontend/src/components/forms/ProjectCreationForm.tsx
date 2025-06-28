'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  Calendar,
  DollarSign,
  Target,
  Users,
  Building,
  Globe,
  ChevronLeft,
  ChevronRight,
  Save,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateProject, useUploadProjectImage } from '@/hooks/api/useProjectApi';
import { useAuth } from '@/hooks/useAuth';
import { ProjectCategory as APIProjectCategory } from '@/lib/api/services/projectService';

// Define basic project categories as an enum
enum ProjectCategory {
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  ENVIRONMENT = 'environment',
  POVERTY = 'poverty',
  DISASTER = 'disaster',
  FINTECH = 'fintech',
  HEALTHTECH = 'healthtech',
  EDTECH = 'edtech',
  GREENTECH = 'greentech',
  OTHER = 'other',
}

// Form validation schemas
const baseProjectSchema = z.object({
  type: z.enum(['ngo', 'startup']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(200, 'Short description must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description must be less than 5000 characters'),
  category: z.nativeEnum(ProjectCategory),
  subcategory: z.string().optional(),
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationDescription: z.string().min(20, 'Organization description must be at least 20 characters'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
  }),
  fundingGoal: z.number().min(100, 'Funding goal must be at least $100'),
  currency: z.enum(['ETH', 'USDC', 'DAI']),
  minimumDonation: z.number().min(1, 'Minimum donation must be at least $1').optional(),
  location: z.object({
    country: z.string().min(2, 'Country is required'),
    state: z.string().optional(),
    city: z.string().optional(),
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
});

const ngoSpecificSchema = baseProjectSchema.extend({
  beneficiaryCount: z.number().min(1, 'Beneficiary count must be at least 1').optional(),
  sdgGoals: z.array(z.number().min(1).max(17)).optional(),
});

const startupSpecificSchema = baseProjectSchema.extend({
  businessModel: z.string().min(20, 'Business model description is required'),
  revenueModel: z.string().min(20, 'Revenue model description is required'),
  marketSize: z.string().min(10, 'Market size information is required'),
  competition: z.string().min(20, 'Competition analysis is required'),
  fundingStage: z.enum(['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'ipo']),
});

type ProjectFormData = z.infer<typeof baseProjectSchema> & {
  beneficiaryCount?: number;
  sdgGoals?: number[];
  businessModel?: string;
  revenueModel?: string;
  marketSize?: string;
  competition?: string;
  fundingStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'ipo';
};

interface ProjectCreationFormProps {
  projectType: 'ngo' | 'startup';
  onSuccess?: (project: any) => void;
  onCancel?: () => void;
  className?: string;
}

export function ProjectCreationForm({
  projectType,
  onSuccess,
  onCancel,
  className,
}: ProjectCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API and auth hooks
  const { user, isAuthenticated } = useAuth();
  const createProjectMutation = useCreateProject();
  const uploadProjectImage = useUploadProjectImage();

  const schema = projectType === 'ngo' ? ngoSpecificSchema : startupSpecificSchema;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: projectType,
      currency: 'USDC',
      socialLinks: {},
      location: {},
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Multi-step form configuration
  const steps = [
    {
      title: 'Basic Information',
      description: 'Tell us about your project',
      fields: ['title', 'shortDescription', 'description', 'category'],
    },
    {
      title: 'Organization Details',
      description: 'Information about your organization',
      fields: ['organizationName', 'organizationDescription', 'website', 'socialLinks'],
    },
    {
      title: 'Funding & Location',
      description: 'Financial goals and location',
      fields: ['fundingGoal', 'currency', 'minimumDonation', 'location'],
    },
    {
      title: 'Timeline & Specifics',
      description: projectType === 'ngo' ? 'Impact goals and timeline' : 'Business details and timeline',
      fields: projectType === 'ngo' 
        ? ['startDate', 'endDate', 'beneficiaryCount', 'sdgGoals']
        : ['startDate', 'endDate', 'businessModel', 'revenueModel', 'marketSize', 'competition', 'fundingStage'],
    },
    {
      title: 'Media & Documents',
      description: 'Upload images and supporting documents',
      fields: ['images', 'documents'],
    },
  ];

  const currentStepFields = steps[currentStep]?.fields || [];
  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  // Image upload handler
  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length + uploadedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setUploadedImages(prev => [...prev, ...imageFiles]);
  }, [uploadedImages.length]);

  // Document upload handler
  const onDocumentDrop = useCallback((acceptedFiles: File[]) => {
    const docFiles = acceptedFiles.filter(file => 
      file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')
    );
    if (docFiles.length + uploadedDocuments.length > 3) {
      toast.error('Maximum 3 documents allowed');
      return;
    }
    setUploadedDocuments(prev => [...prev, ...docFiles]);
  }, [uploadedDocuments.length]);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
  });

  const {
    getRootProps: getDocumentRootProps,
    getInputProps: getDocumentInputProps,
    isDragActive: isDocumentDragActive,
  } = useDropzone({
    onDrop: onDocumentDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 3,
  });

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const canProceedToNextStep = () => {
    return currentStepFields.every(field => {
      const value = watchedValues[field as keyof ProjectFormData];
      return value !== undefined && value !== '' && !errors[field as keyof ProjectFormData];
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Map local enum to API enum
  const mapCategoryToAPI = (category: ProjectCategory): APIProjectCategory => {
    const mapping: Record<ProjectCategory, APIProjectCategory> = {
      [ProjectCategory.EDUCATION]: APIProjectCategory.EDUCATION,
      [ProjectCategory.HEALTHCARE]: APIProjectCategory.HEALTHCARE,
      [ProjectCategory.ENVIRONMENT]: APIProjectCategory.ENVIRONMENT,
      [ProjectCategory.POVERTY]: APIProjectCategory.POVERTY,
      [ProjectCategory.DISASTER]: APIProjectCategory.DISASTER_RELIEF,
      [ProjectCategory.FINTECH]: APIProjectCategory.FINTECH,
      [ProjectCategory.HEALTHTECH]: APIProjectCategory.HEALTHTECH,
      [ProjectCategory.EDTECH]: APIProjectCategory.EDTECH,
      [ProjectCategory.GREENTECH]: APIProjectCategory.GREENTECH,
      [ProjectCategory.OTHER]: APIProjectCategory.AGRICULTURE, // Fallback
    };
    return mapping[category] || APIProjectCategory.EDUCATION;
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to create a project');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare project data for API
      const projectData = {
        type: projectType,
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        category: mapCategoryToAPI(data.category),
        subcategory: data.subcategory,
        organizationName: data.organizationName,
        organizationDescription: data.organizationDescription,
        website: data.website,
        socialLinks: data.socialLinks,
        fundingGoal: data.fundingGoal,
        currency: data.currency,
        minimumDonation: data.minimumDonation,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        // NGO specific fields
        ...(projectType === 'ngo' && {
          beneficiaryCount: data.beneficiaryCount,
          sdgGoals: data.sdgGoals,
        }),
        // Startup specific fields
        ...(projectType === 'startup' && {
          businessModel: data.businessModel,
          revenueModel: data.revenueModel,
          marketSize: data.marketSize,
          competition: data.competition,
          fundingStage: data.fundingStage,
        }),
      };

      // Create project via API
      const project = await createProjectMutation.mutateAsync(projectData);

      // Upload images if any
      if (uploadedImages.length > 0) {
        for (const image of uploadedImages) {
          try {
            await uploadProjectImage.mutateAsync({
              projectId: project.id,
              file: image,
            });
          } catch (imageError) {
            console.warn('Failed to upload image:', imageError);
          }
        }
      }

      // Note: Document upload will be handled separately
      if (uploadedDocuments.length > 0) {
        console.log('Document upload will be implemented separately');
      }

      toast.success(`${projectType === 'ngo' ? 'NGO project' : 'Startup'} created successfully!`);
      onSuccess?.(project);
      
    } catch (error: any) {
      console.error('Failed to create project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    // TODO: Implement save as draft functionality
    toast.success('Project saved as draft');
  };

  return (
    <div className={className}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Create {projectType === 'ngo' ? 'NGO Project' : 'Startup'}
              </CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(stepProgress)}% Complete
            </Badge>
          </div>
          <Progress value={stepProgress} className="mt-4" />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter your project title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    {...register('shortDescription')}
                    placeholder="A brief description of your project (max 200 characters)"
                    className={errors.shortDescription ? 'border-red-500' : ''}
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.shortDescription && (
                      <p className="text-sm text-red-500">{errors.shortDescription.message}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {watchedValues.shortDescription?.length || 0}/200
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Provide a detailed description of your project, its goals, and impact"
                    className={`min-h-32 ${errors.description ? 'border-red-500' : ''}`}
                    maxLength={5000}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {watchedValues.description?.length || 0}/5000
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectType === 'ngo' ? (
                            <>
                              <SelectItem value={ProjectCategory.EDUCATION}>Education</SelectItem>
                              <SelectItem value={ProjectCategory.HEALTHCARE}>Healthcare</SelectItem>
                              <SelectItem value={ProjectCategory.ENVIRONMENT}>Environment</SelectItem>
                              <SelectItem value={ProjectCategory.POVERTY}>Poverty Alleviation</SelectItem>
                              <SelectItem value={ProjectCategory.DISASTER}>Disaster Relief</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value={ProjectCategory.FINTECH}>FinTech</SelectItem>
                              <SelectItem value={ProjectCategory.HEALTHTECH}>HealthTech</SelectItem>
                              <SelectItem value={ProjectCategory.EDTECH}>EdTech</SelectItem>
                              <SelectItem value={ProjectCategory.GREENTECH}>GreenTech</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Organization Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    {...register('organizationName')}
                    placeholder="Your organization name"
                    className={errors.organizationName ? 'border-red-500' : ''}
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-red-500 mt-1">{errors.organizationName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="organizationDescription">Organization Description *</Label>
                  <Textarea
                    id="organizationDescription"
                    {...register('organizationDescription')}
                    placeholder="Tell us about your organization"
                    className={errors.organizationDescription ? 'border-red-500' : ''}
                  />
                  {errors.organizationDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.organizationDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://yourwebsite.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...register('socialLinks.twitter')}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      {...register('socialLinks.linkedin')}
                      placeholder="linkedin.com/company/name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Funding & Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fundingGoal">Funding Goal *</Label>
                    <Input
                      id="fundingGoal"
                      type="number"
                      {...register('fundingGoal', { valueAsNumber: true })}
                      placeholder="10000"
                      className={errors.fundingGoal ? 'border-red-500' : ''}
                    />
                    {errors.fundingGoal && (
                      <p className="text-sm text-red-500 mt-1">{errors.fundingGoal.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency *</Label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="DAI">DAI</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="minimumDonation">Minimum Donation</Label>
                  <Input
                    id="minimumDonation"
                    type="number"
                    {...register('minimumDonation', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty for no minimum</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        {...register('location.country')}
                        placeholder="United States"
                        className={errors.location?.country ? 'border-red-500' : ''}
                      />
                      {errors.location?.country && (
                        <p className="text-sm text-red-500 mt-1">{errors.location.country.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        {...register('location.state')}
                        placeholder="California"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register('location.city')}
                        placeholder="San Francisco"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Timeline & Specifics */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Timeline Section */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('startDate')}
                        className={errors.startDate ? 'border-red-500' : ''}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('endDate')}
                      />
                      <p className="text-sm text-gray-500 mt-1">Leave empty for ongoing projects</p>
                    </div>
                  </div>
                </div>

                {/* NGO-specific fields */}
                {projectType === 'ngo' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="beneficiaryCount">Expected Beneficiaries</Label>
                      <Input
                        id="beneficiaryCount"
                        type="number"
                        {...register('beneficiaryCount', { valueAsNumber: true })}
                        placeholder="Number of people this project will help"
                      />
                    </div>

                    <div>
                      <Label>UN Sustainable Development Goals</Label>
                      <p className="text-sm text-gray-500 mb-2">Select relevant SDGs (optional)</p>
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {Array.from({ length: 17 }, (_, i) => i + 1).map((goal) => (
                          <Badge key={goal} variant="outline" className="text-xs">
                            SDG {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Startup-specific fields */}
                {projectType === 'startup' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessModel">Business Model *</Label>
                      <Textarea
                        id="businessModel"
                        {...register('businessModel')}
                        placeholder="Describe your business model and how you create value"
                        className="min-h-24"
                      />
                    </div>

                    <div>
                      <Label htmlFor="revenueModel">Revenue Model *</Label>
                      <Textarea
                        id="revenueModel"
                        {...register('revenueModel')}
                        placeholder="Explain how your startup generates revenue"
                        className="min-h-24"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="marketSize">Market Size *</Label>
                        <Textarea
                          id="marketSize"
                          {...register('marketSize')}
                          placeholder="Total Addressable Market (TAM) and market opportunity"
                          className="min-h-20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="competition">Competition Analysis *</Label>
                        <Textarea
                          id="competition"
                          {...register('competition')}
                          placeholder="Who are your competitors and how do you differentiate?"
                          className="min-h-20"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fundingStage">Funding Stage *</Label>
                      <Controller
                        name="fundingStage"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                              <SelectItem value="seed">Seed</SelectItem>
                              <SelectItem value="series-a">Series A</SelectItem>
                              <SelectItem value="series-b">Series B</SelectItem>
                              <SelectItem value="series-c">Series C</SelectItem>
                              <SelectItem value="ipo">IPO</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Media & Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Project Images
                  </h4>
                  <p className="text-sm text-gray-600">
                    Upload images that showcase your project. These will be displayed on your project page.
                  </p>
                  
                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div
                      {...getImageRootProps()}
                      className={`text-center cursor-pointer transition-colors ${
                        isImageDragActive ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      <input {...getImageInputProps()} />
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">
                        {isImageDragActive ? 'Drop images here' : 'Drop images here or click to browse'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each (max 5 images)</p>
                    </div>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Supporting Documents
                  </h4>
                  <p className="text-sm text-gray-600">
                    Upload relevant documents such as business plans, impact reports, or legal documents.
                  </p>
                  
                  {/* Document Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">Drop documents here or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT up to 10MB each (max 3 documents)</p>
                    </div>
                  </div>

                  {uploadedDocuments.length > 0 && (
                    <div className="space-y-2">
                      {uploadedDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / (1024 * 1024)).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveAsDraft}
                  disabled={!isDirty}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>

              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isValid}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 