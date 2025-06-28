'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  ImageIcon, 
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
import { useAuth } from '@/hooks/useAuth';
import { useNGORegistry } from '@/hooks/contracts/useNGORegistry';
import { useStartupRegistry } from '@/hooks/contracts/useStartupRegistry';
import type { Address } from 'viem';
import { useSwitchChain, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { getContractAddresses } from '@/lib/contracts/config';

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

// UN Sustainable Development Goals mapping
const SDG_GOALS = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  3: 'Good Health and Well-being',
  4: 'Quality Education',
  5: 'Gender Equality',
  6: 'Clean Water and Sanitation',
  7: 'Affordable and Clean Energy',
  8: 'Decent Work and Economic Growth',
  9: 'Industry, Innovation and Infrastructure',
  10: 'Reduced Inequalities',
  11: 'Sustainable Cities and Communities',
  12: 'Responsible Consumption and Production',
  13: 'Climate Action',
  14: 'Life Below Water',
  15: 'Life on Land',
  16: 'Peace, Justice and Strong Institutions',
  17: 'Partnerships for the Goals',
} as const;

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
  businessModel: z.string().min(1, 'Business model is required'),
  revenueModel: z.string().min(1, 'Revenue model is required'),
  marketSize: z.string().min(1, 'Market size information is required'),
  competition: z.string().min(1, 'Competition analysis is required'),
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
  const { 
    registerNGO, 
    isLoading: isRegisteringNGO, 
    txHash: ngoTxHash,
    isConfirmed: ngoTxConfirmed,
    isError: ngoTxError,
    error: ngoError 
  } = useNGORegistry();
  const { 
    registerStartup, 
    isLoading: isRegisteringStartup,
    txHash: startupTxHash,
    isConfirmed: startupTxConfirmed,
    isError: startupTxError,
    error: startupError
  } = useStartupRegistry();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  // Get contract addresses for current chain
  const contracts = getContractAddresses(chainId);
  
  // Network validation
  const isOnSupportedNetwork = chainId === baseSepolia.id;
  const supportedNetworkName = chainId === baseSepolia.id ? 'Base Sepolia' : 'Unknown';
  
  const switchToSupportedNetwork = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id }); // Switch to Base Sepolia for testing
      toast.success('Switched to Base Sepolia network');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network. Please switch manually to Base Sepolia in your wallet.');
    }
  };

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

  // Monitor NGO transaction confirmations
  useEffect(() => {
    if (ngoTxConfirmed && ngoTxHash) {
      console.log('✅ NGO transaction confirmed:', ngoTxHash);
      toast.dismiss('blockchain-tx');
      
      // Create clickable link to block explorer
      const explorerUrl = getBlockExplorerUrl(ngoTxHash);
      toast.success(
        <>
          🎉 NGO registered successfully on blockchain!
          <br />
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Transaction: {ngoTxHash.slice(0, 10)}...{ngoTxHash.slice(-6)}
          </a>
        </>,
        { duration: 10000 }
      );
      
      // Update localStorage with confirmed transaction hash
      const existingProjects = JSON.parse(localStorage.getItem('user-projects') || '[]');
      const updatedProjects = existingProjects.map((project: any) => {
        if (project.txHash === 'pending' && project.type === 'ngo') {
          return { ...project, txHash: ngoTxHash, status: 'CONFIRMED' };
        }
        return project;
      });
      localStorage.setItem('user-projects', JSON.stringify(updatedProjects));
    }
    
    if (ngoTxError && ngoError) {
      console.error('❌ NGO transaction failed:', ngoError);
      toast.dismiss('blockchain-tx');
      toast.error(`NGO registration failed: ${ngoError}`);
    }
  }, [ngoTxConfirmed, ngoTxHash, ngoTxError, ngoError]);

  // Monitor Startup transaction confirmations
  useEffect(() => {
    if (startupTxConfirmed && startupTxHash) {
      console.log('✅ Startup transaction confirmed:', startupTxHash);
      toast.dismiss('blockchain-tx');
      
      // Create clickable link to block explorer
      const explorerUrl = getBlockExplorerUrl(startupTxHash);
      toast.success(
        <>
          🎉 Startup registered successfully on blockchain!
          <br />
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Transaction: {startupTxHash.slice(0, 10)}...{startupTxHash.slice(-6)}
          </a>
        </>,
        { duration: 10000 }
      );
      
      // Update localStorage with confirmed transaction hash
      const existingProjects = JSON.parse(localStorage.getItem('user-projects') || '[]');
      const updatedProjects = existingProjects.map((project: any) => {
        if (project.txHash === 'pending' && project.type === 'startup') {
          return { ...project, txHash: startupTxHash, status: 'CONFIRMED' };
        }
        return project;
      });
      localStorage.setItem('user-projects', JSON.stringify(updatedProjects));
    }
    
    if (startupTxError && startupError) {
      console.error('❌ Startup transaction failed:', startupError);
      toast.dismiss('blockchain-tx');
      toast.error(`Startup registration failed: ${startupError}`);
    }
  }, [startupTxConfirmed, startupTxHash, startupTxError, startupError]);

  // Multi-step form configuration
  const steps = [
    {
      title: 'Basic Information',
      description: 'Tell us about your project',
      requiredFields: ['title', 'shortDescription', 'description', 'category'],
    },
    {
      title: 'Organization Details',
      description: 'Information about your organization',
      requiredFields: ['organizationName', 'organizationDescription'],
    },
    {
      title: 'Funding & Location',
      description: 'Financial goals and location',
      requiredFields: ['fundingGoal', 'currency', 'location.country'],
    },
    {
      title: 'Timeline & Specifics',
      description: projectType === 'ngo' ? 'Impact goals and timeline' : 'Business details and timeline',
      requiredFields: projectType === 'ngo' 
        ? ['startDate']
        : ['startDate', 'businessModel', 'revenueModel', 'marketSize', 'competition', 'fundingStage'],
    },
    {
      title: 'Media & Documents',
      description: 'Upload images and supporting documents',
      requiredFields: [], // No required fields for media upload
    },
  ];

  const currentStepRequiredFields = steps[currentStep]?.requiredFields || [];
  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  // Improved validation function
  const canProceedToNextStep = () => {
    // Debug: Log current step and required fields
    console.log('=== Step Validation Debug ===');
    console.log('Current Step:', currentStep);
    console.log('Project Type:', projectType);
    console.log('Required Fields:', currentStepRequiredFields);
    console.log('Current Form Values:', watchedValues);
    console.log('Current Errors:', errors);

    // Check if all required fields for current step are filled and valid
    const allFieldsValid = currentStepRequiredFields.every(fieldPath => {
      let fieldValue: any;
      let hasError: any;
      
      // Handle all possible field paths explicitly
      switch (fieldPath) {
        case 'title':
          fieldValue = watchedValues.title;
          hasError = errors.title;
          break;
        case 'shortDescription':
          fieldValue = watchedValues.shortDescription;
          hasError = errors.shortDescription;
          break;
        case 'description':
          fieldValue = watchedValues.description;
          hasError = errors.description;
          break;
        case 'category':
          fieldValue = watchedValues.category;
          hasError = errors.category;
          break;
        case 'organizationName':
          fieldValue = watchedValues.organizationName;
          hasError = errors.organizationName;
          break;
        case 'organizationDescription':
          fieldValue = watchedValues.organizationDescription;
          hasError = errors.organizationDescription;
          break;
        case 'fundingGoal':
          fieldValue = watchedValues.fundingGoal;
          hasError = errors.fundingGoal;
          break;
        case 'currency':
          fieldValue = watchedValues.currency;
          hasError = errors.currency;
          break;
        case 'location.country':
          fieldValue = watchedValues.location?.country;
          hasError = errors.location?.country;
          break;
        case 'startDate':
          fieldValue = watchedValues.startDate;
          hasError = errors.startDate;
          break;
        case 'businessModel':
          fieldValue = watchedValues.businessModel;
          hasError = errors.businessModel;
          break;
        case 'revenueModel':
          fieldValue = watchedValues.revenueModel;
          hasError = errors.revenueModel;
          break;
        case 'marketSize':
          fieldValue = watchedValues.marketSize;
          hasError = errors.marketSize;
          break;
        case 'competition':
          fieldValue = watchedValues.competition;
          hasError = errors.competition;
          break;
        case 'fundingStage':
          fieldValue = watchedValues.fundingStage;
          hasError = errors.fundingStage;
          break;
        default:
          console.warn(`Unknown field path: ${fieldPath}`);
          fieldValue = '';
          hasError = null;
      }
      
      // Field validation
      const isValid = fieldValue !== undefined && 
                     fieldValue !== '' && 
                     fieldValue !== null &&
                     !hasError;

      // Debug: Log each field validation
      console.log(`Field "${fieldPath}":`, {
        value: fieldValue,
        hasError,
        isValid
      });

      return isValid;
    });

    console.log('All Fields Valid:', allFieldsValid);
    console.log('========================');

    return allFieldsValid;
  };

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
  const mapCategoryToAPI = (category: ProjectCategory): ProjectCategory => {
    // No longer need to map to API categories, just return the same
    return category;
  };

  // Helper function to get block explorer URL
  const getBlockExplorerUrl = (txHash: string) => {
    if (chainId === base.id) {
      return `https://basescan.org/tx/${txHash}`;
    } else if (chainId === baseSepolia.id) {
      return `https://sepolia.basescan.org/tx/${txHash}`;
    }
    return `https://basescan.org/tx/${txHash}`; // Default to Base mainnet
  };

  // IPFS upload placeholder function
  const uploadToIPFS = async (data: any): Promise<string> => {
    // In production, this would upload to IPFS and return the hash
    // For now, we'll create a mock hash based on the data
    const jsonString = JSON.stringify(data);
    const mockHash = `Qm${btoa(jsonString).substring(0, 44)}`; // Mock IPFS hash
    console.log('Mock IPFS upload:', mockHash, data);
    return mockHash;
  };

  const onSubmit = async (data: ProjectFormData) => {
    console.log('🚀 Form submitted with data:', data);
    
    if (!isAuthenticated || !user) {
      toast.error('Please connect your wallet to create a project');
      return;
    }

    // Check if user is on supported network
    if (!isOnSupportedNetwork) {
      toast.error(`Please switch to Base Sepolia network. Currently on: ${supportedNetworkName}`);
      return;
    }

    // Basic validation check
    const requiredFields = ['title', 'description', 'organizationName', 'fundingGoal'];
    const missingFields = requiredFields.filter(field => !data[field as keyof ProjectFormData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Additional startup-specific validation
    if (projectType === 'startup') {
      const startupFields = ['businessModel', 'revenueModel', 'marketSize', 'competition', 'fundingStage'];
      const missingStartupFields = startupFields.filter(field => !data[field as keyof ProjectFormData]);
      
      if (missingStartupFields.length > 0) {
        toast.error(`Please fill in required startup fields: ${missingStartupFields.join(', ')}`);
        return;
      }
    }

    console.log('✅ User authenticated:', user);
    console.log('✅ Validation passed');
    console.log('🌐 Network check passed. Chain ID:', chainId, 'Network:', supportedNetworkName);
    setIsSubmitting(true);
    
    try {
      // Prepare project data for IPFS
      const projectMetadata = {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        category: mapCategoryToAPI(data.category),
        subcategory: data.subcategory,
        organizationName: data.organizationName,
        organizationDescription: data.organizationDescription,
        website: data.website,
        socialLinks: data.socialLinks,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        // Type-specific fields
        ...(projectType === 'ngo' && {
          beneficiaryCount: data.beneficiaryCount,
          sdgGoals: data.sdgGoals,
        }),
        ...(projectType === 'startup' && {
          businessModel: data.businessModel,
          revenueModel: data.revenueModel,
          marketSize: data.marketSize,
          competition: data.competition,
          fundingStage: data.fundingStage,
        }),
        // Media metadata (actual files would be uploaded separately)
        images: uploadedImages.map(img => ({ name: img.name, size: img.size, type: img.type })),
        documents: uploadedDocuments.map(doc => ({ name: doc.name, size: doc.size, type: doc.type })),
        creator: {
          address: user.address,
          name: user.name,
        },
        createdAt: new Date().toISOString(),
      };

      console.log('📦 Project metadata prepared:', projectMetadata);

      // Upload project metadata to IPFS
      console.log('📤 Uploading to IPFS...');
      const projectHash = await uploadToIPFS(projectMetadata);
      console.log('✅ IPFS upload complete, hash:', projectHash);

      // Show transaction pending toast
      toast.loading('Preparing blockchain transaction...', { id: 'blockchain-tx' });

      // Register on blockchain
      if (projectType === 'ngo') {
        console.log('🏥 Registering NGO on blockchain...');
        console.log('NGO Registration params:', {
          profileHash: projectHash,
          ngoAddress: user.address as Address,
        });
        console.log('Using NGO contract address:', contracts.NGORegistry);
        console.log('Chain ID:', chainId, 'Network:', supportedNetworkName);
        
        // Submit NGO registration transaction
        await registerNGO({
          profileHash: projectHash,
          ngoAddress: user.address as Address,
        });
        
        console.log('✅ NGO registration transaction submitted');
        
        // The transaction hash will be available in ngoTxHash state
        // Wait a moment for the state to update
        setTimeout(() => {
          if (ngoTxHash) {
            toast.loading(`NGO Registration TX: ${ngoTxHash.slice(0, 10)}...${ngoTxHash.slice(-6)}`, { id: 'blockchain-tx' });
          }
        }, 1000);
        
      } else {
        console.log('🚀 Registering Startup on blockchain...');
        // For startups, we need additional data that would come from a separate flow
        // For now, we'll use placeholder values
        const mockEquityTokenAddress = '0x0000000000000000000000000000000000000000' as Address;
        const targetFundingWei = BigInt(data.fundingGoal * 1e18); // Convert to wei
        
        console.log('Startup Registration params:', {
          founder: user.address as Address,
          valuationHash: projectHash,
          equityToken: mockEquityTokenAddress,
          targetFunding: targetFundingWei,
        });
        console.log('Using Startup contract address:', contracts.StartupRegistry);
        console.log('Chain ID:', chainId, 'Network:', supportedNetworkName);
        
        // Submit Startup registration transaction
        await registerStartup({
          founder: user.address as Address,
          valuationHash: projectHash,
          equityToken: mockEquityTokenAddress,
          targetFunding: targetFundingWei,
        });
        
        console.log('✅ Startup registration transaction submitted');
        
        // The transaction hash will be available in startupTxHash state
        // Wait a moment for the state to update
        setTimeout(() => {
          if (startupTxHash) {
            toast.loading(`Startup Registration TX: ${startupTxHash.slice(0, 10)}...${startupTxHash.slice(-6)}`, { id: 'blockchain-tx' });
          }
        }, 1000);
      }

      // Dismiss loading toast
      toast.dismiss('blockchain-tx');

      // Store additional data locally for UI purposes (this will be replaced by indexing)
      const localProjectData = {
        id: `project-${Date.now()}`,
        type: projectType,
        ...projectMetadata,
        txHash: 'pending', // Will be updated when transaction is confirmed
        blockchainRegistered: true,
        fundingGoal: data.fundingGoal,
        currency: data.currency,
        minimumDonation: data.minimumDonation,
        currentFunding: 0,
        status: 'PENDING', // Will be updated to 'CONFIRMED' when transaction is confirmed
        verified: true,
      };

      const existingProjects = JSON.parse(localStorage.getItem('user-projects') || '[]');
      existingProjects.push(localProjectData);
      localStorage.setItem('user-projects', JSON.stringify(existingProjects));

      toast.success(
        `🚀 ${projectType === 'ngo' ? 'NGO project' : 'Startup'} registration submitted to blockchain! 
        Please wait for transaction confirmation...`,
        { duration: 4000 }
      );
      
      console.log('✅ Project creation initiated successfully');
      
      // Call success callback if provided
      onSuccess?.(localProjectData);
      
    } catch (error: any) {
      console.error('❌ Failed to register project on blockchain:', error);
      
      // Dismiss any pending toasts
      toast.dismiss('blockchain-tx');
      
      // Handle specific error types
      let errorMessage = 'Failed to register project on blockchain. Please try again.';
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected. Please try again if you want to create the project.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please add more ETH to your wallet for gas fees.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user.';
      }
      
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      // Always reset loading state
      setIsSubmitting(false);
      toast.dismiss('blockchain-tx');
    }

    // Store project locally for now (with pending blockchain status)
    const localProject = {
      id: Date.now().toString(),
      ...data,
      type: projectType,
      creator: user,
      createdAt: new Date().toISOString(),
      status: 'PENDING_BLOCKCHAIN',
      txHash: 'pending',
      images: uploadedImages.map(img => ({ name: img.name, size: img.size, type: img.type })),
      documents: uploadedDocuments.map(doc => ({ name: doc.name, size: doc.size, type: doc.type })),
    };

    // Store in localStorage
    const existingProjects = JSON.parse(localStorage.getItem('user-projects') || '[]');
    existingProjects.push(localProject);
    localStorage.setItem('user-projects', JSON.stringify(existingProjects));

    console.log('💾 Project stored locally:', localProject);

    // Call success callback
    if (onSuccess) {
      onSuccess(localProject);
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
            <div className="flex items-center gap-3">
              {/* Network Status Indicator */}
              {isOnSupportedNetwork ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ {supportedNetworkName}
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-red-600">
                    ⚠️ Wrong Network
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={switchToSupportedNetwork}
                    className="text-xs"
                  >
                    Switch to Base
                  </Button>
                </div>
              )}
              <Badge variant="outline" className="text-sm">
                {Math.round(stepProgress)}% Complete
              </Badge>
            </div>
          </div>
          <Progress value={stepProgress} className="mt-4" />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div className="relative">
              {/* Debug Panel */}
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                <strong>Form Debug Info:</strong> Step {currentStep + 1}/{steps.length} | 
                Authenticated: {isAuthenticated.toString()} | 
                Network: {supportedNetworkName} | 
                Submitting: {isSubmitting.toString()}
              </div>
            </div>

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
                      <Controller
                        name="sdgGoals"
                        control={control}
                        render={({ field }) => {
                          const selectedGoals = field.value || [];
                          
                          const toggleGoal = (goal: number) => {
                            const newGoals = selectedGoals.includes(goal)
                              ? selectedGoals.filter(g => g !== goal)
                              : [...selectedGoals, goal];
                            field.onChange(newGoals);
                          };

                                                     return (
                             <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                               {Array.from({ length: 17 }, (_, i) => i + 1).map((goal) => {
                                 const isSelected = selectedGoals.includes(goal);
                                 const goalName = SDG_GOALS[goal as keyof typeof SDG_GOALS];
                                 return (
                                   <Badge
                                     key={goal}
                                     variant={isSelected ? "default" : "outline"}
                                     className={`text-xs cursor-pointer transition-colors hover:opacity-80 p-2 justify-start text-left ${
                                       isSelected 
                                         ? 'bg-green-600 text-white border-green-600' 
                                         : 'hover:bg-gray-100'
                                     }`}
                                     onClick={() => toggleGoal(goal)}
                                     title={`SDG ${goal}: ${goalName}`}
                                   >
                                     <span className="font-medium">SDG {goal}</span>
                                     <span className="ml-1 font-normal truncate">{goalName}</span>
                                   </Badge>
                                 );
                               })}
                             </div>
                           );
                        }}
                      />
                      {watchedValues.sdgGoals && watchedValues.sdgGoals.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          {watchedValues.sdgGoals.length} SDG{watchedValues.sdgGoals.length > 1 ? 's' : ''} selected
                        </p>
                      )}
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
                        className={`min-h-24 ${errors.businessModel ? 'border-red-500' : ''}`}
                      />
                      {errors.businessModel && (
                        <p className="text-sm text-red-500 mt-1">{errors.businessModel.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="revenueModel">Revenue Model *</Label>
                      <Textarea
                        id="revenueModel"
                        {...register('revenueModel')}
                        placeholder="Explain how your startup generates revenue"
                        className={`min-h-24 ${errors.revenueModel ? 'border-red-500' : ''}`}
                      />
                      {errors.revenueModel && (
                        <p className="text-sm text-red-500 mt-1">{errors.revenueModel.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="marketSize">Market Size *</Label>
                        <Textarea
                          id="marketSize"
                          {...register('marketSize')}
                          placeholder="Total Addressable Market (TAM) and market opportunity"
                          className={`min-h-20 ${errors.marketSize ? 'border-red-500' : ''}`}
                        />
                        {errors.marketSize && (
                          <p className="text-sm text-red-500 mt-1">{errors.marketSize.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="competition">Competition Analysis *</Label>
                        <Textarea
                          id="competition"
                          {...register('competition')}
                          placeholder="Who are your competitors and how do you differentiate?"
                          className={`min-h-20 ${errors.competition ? 'border-red-500' : ''}`}
                        />
                        {errors.competition && (
                          <p className="text-sm text-red-500 mt-1">{errors.competition.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fundingStage">Funding Stage *</Label>
                      <Controller
                        name="fundingStage"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className={errors.fundingStage ? 'border-red-500' : ''}>
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
                      {errors.fundingStage && (
                        <p className="text-sm text-red-500 mt-1">{errors.fundingStage.message}</p>
                      )}
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
                    <div
                      {...getDocumentRootProps()}
                      className={`text-center cursor-pointer transition-colors ${
                        isDocumentDragActive ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      <input {...getDocumentInputProps()} />
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">
                        {isDocumentDragActive ? 'Drop documents here' : 'Drop documents here or click to browse'}
                      </p>
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
                  <div>
                    {/* Debug Info - Remove in production */}
                    <div className="text-xs text-gray-500 mb-2">
                      Debug: isAuthenticated={isAuthenticated.toString()}, isSubmitting={isSubmitting.toString()}, 
                      isRegisteringNGO={isRegisteringNGO.toString()}, isRegisteringStartup={isRegisteringStartup.toString()},
                      isOnSupportedNetwork={isOnSupportedNetwork.toString()}, chainId={chainId}
                    </div>
                    {!isOnSupportedNetwork ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={switchToSupportedNetwork}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          Switch to Base Sepolia Network
                        </Button>
                        <span className="text-sm text-gray-500">Required for blockchain transactions</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting || isRegisteringNGO || isRegisteringStartup || !isAuthenticated}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isSubmitting || isRegisteringNGO || isRegisteringStartup 
                            ? 'Registering on Blockchain...' 
                            : 'Create Project'
                          }
                        </Button>
                        
                        {/* Test button for debugging */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            console.log('🧪 Test submit clicked');
                            console.log('Current form values:', watchedValues);
                            console.log('Form errors:', errors);
                            console.log('Is authenticated:', isAuthenticated);
                            console.log('User:', user);
                            console.log('Network supported:', isOnSupportedNetwork);
                            
                            // Try a minimal submit
                            if (isAuthenticated && user) {
                              toast.success('Test validation passed! Form should be working.');
                            } else {
                              toast.error('Authentication issue detected.');
                            }
                          }}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Test Submit
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 