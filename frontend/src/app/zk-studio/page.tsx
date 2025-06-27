'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  FileText,
  CheckCircle,
  AlertTriangle,
  Code,
  Zap,
  Key,
  Database,
  Globe,
  Download,
  Upload
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ZKStudioPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'verify' | 'history'>('create');
  const [selectedProofType, setSelectedProofType] = useState<string>('impact');
  const [proofData, setProofData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<any>(null);

  const proofTypes = [
    {
      id: 'impact',
      name: 'Impact Verification',
      description: 'Prove impact metrics without revealing sensitive data',
      icon: Shield,
      complexity: 'Medium',
      time: '2-5 minutes'
    },
    {
      id: 'donation',
      name: 'Anonymous Donation',
      description: 'Prove donation eligibility while maintaining privacy',
      icon: Lock,
      complexity: 'Low',
      time: '30 seconds'
    },
    {
      id: 'identity',
      name: 'Identity Verification',
      description: 'Prove identity attributes without revealing actual data',
      icon: Key,
      complexity: 'High',
      time: '5-10 minutes'
    },
    {
      id: 'compliance',
      name: 'Compliance Check',
      description: 'Prove regulatory compliance without exposing details',
      icon: FileText,
      complexity: 'Medium',
      time: '3-7 minutes'
    }
  ];

  const proofHistory = [
    {
      id: 'proof_001',
      type: 'Impact Verification',
      campaignId: 'clean-water-kenya',
      status: 'verified',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      verificationHash: '0x7f8c9a2b1e4d6f3a8c5b9e2f1a4d7c3b6e9f2a5d8c1b4e7a3f6c9e2b5a8d1f4c7',
      publicInputs: ['water_access_count: 3250', 'quality_score: 92'],
      verified: true
    },
    {
      id: 'proof_002',
      type: 'Anonymous Donation',
      campaignId: 'ukraine-education',
      status: 'verified',
      createdAt: new Date('2024-01-12T14:20:00Z'),
      verificationHash: '0x3a6d8f1c4e7b2a5d9c6f3a8e1b4d7c2a5f8e1b4d7c3a6f9e2b5d8c1a4e7f3b6d9',
      publicInputs: ['min_amount: true', 'whitelist_status: true'],
      verified: true
    },
    {
      id: 'proof_003',
      type: 'Identity Verification',
      campaignId: 'amazon-reforestation',
      status: 'pending',
      createdAt: new Date('2024-01-10T09:15:00Z'),
      verificationHash: '0x2b5e8c1f4a7d3c6f9e2b5a8d1f4c7a3b6e9f2a5d8c1b4e7a3f6c9e2b5a8d1f4c',
      publicInputs: ['age_verification: true', 'location_check: true'],
      verified: false
    }
  ];

  const generateProof = async () => {
    if (!proofData.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockProof = {
      proofHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      publicInputs: proofData.split('\n').filter(line => line.trim()),
      verificationKey: `0x${Math.random().toString(16).substr(2, 32)}`,
      proof: `0x${Math.random().toString(16).substr(2, 128)}`,
      timestamp: new Date(),
      type: selectedProofType
    };
    
    setGeneratedProof(mockProof);
    setIsGenerating(false);
  };

  const renderCreateTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Choose Proof Type
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proofTypes.map((type) => (
            <motion.div
              key={type.id}
              variants={itemVariants}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProofType === type.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedProofType(type.id)}
            >
              <div className="flex items-start gap-3">
                <type.icon className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{type.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {type.complexity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {type.time}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Private Data Input
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Private Inputs (one per line)
            </label>
            <textarea
              value={proofData}
              onChange={(e) => setProofData(e.target.value)}
              placeholder={`Example for Impact Verification:
water_access_count=3250
water_quality_score=92
location_coordinates=2.5177,34.4753
verification_date=2024-01-15`}
              className="w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Privacy Notice
                </div>
                <div className="text-amber-700 dark:text-amber-300">
                  Your private data never leaves your browser. Only zero-knowledge proofs are generated and shared.
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateProof}
            disabled={!proofData.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Generating Proof...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Generate ZK Proof
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedProof && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              Proof Generated Successfully
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Proof Hash</label>
                  <div className="bg-background p-2 rounded border text-sm font-mono break-all">
                    {generatedProof.proofHash}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Verification Key</label>
                  <div className="bg-background p-2 rounded border text-sm font-mono break-all">
                    {generatedProof.verificationKey}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Public Inputs</label>
                <div className="bg-background p-2 rounded border">
                  {generatedProof.publicInputs.map((input: string, index: number) => (
                    <div key={index} className="text-sm font-mono">{input}</div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Proof
                </Button>
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Publish to Blockchain
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  const renderVerifyTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verify ZK Proof
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Proof Hash</label>
            <input
              type="text"
              placeholder="0x7f8c9a2b1e4d6f3a8c5b9e2f1a4d7c3b6e9f2a5d8c..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Verification Key
            </label>
            <input
              type="text"
              placeholder="0x3a6d8f1c4e7b2a5d9c6f3a8e1b4d7c2a..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Public Inputs (JSON)
            </label>
            <textarea
              placeholder='["water_access_count: 3250", "quality_score: 92"]'
              className="w-full h-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <Button className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify Proof
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Verification</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Water Access Proof #001</div>
              <div className="text-sm text-muted-foreground">Clean Water Kenya Campaign</div>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Education Impact #002</div>
              <div className="text-sm text-muted-foreground">Ukraine Education Fund</div>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderHistoryTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Proof History
        </h3>
        
        <div className="space-y-4">
          {proofHistory.map((proof) => (
            <div key={proof.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{proof.type}</h4>
                  <p className="text-sm text-muted-foreground">
                    Campaign: {proof.campaignId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {proof.verified ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Proof Hash:</span>
                  <span className="ml-2 font-mono text-xs break-all">
                    {proof.verificationHash}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Public Inputs:</span>
                  <div className="ml-2 mt-1">
                    {proof.publicInputs.map((input, index) => (
                      <div key={index} className="text-xs font-mono bg-muted/50 px-2 py-1 rounded inline-block mr-2 mb-1">
                        {input}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">{proof.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            ZK Proof <span className="text-primary">Studio</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate and verify zero-knowledge proofs for privacy-preserving impact verification.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="flex p-1 space-x-1 bg-muted rounded-lg">
            {[
              { id: 'create', label: 'Create Proof', icon: Shield },
              { id: 'verify', label: 'Verify Proof', icon: CheckCircle },
              { id: 'history', label: 'History', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'create' && renderCreateTab()}
        {activeTab === 'verify' && renderVerifyTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
} 