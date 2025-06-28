import { Document, ObjectId } from 'mongoose';
import { Request } from 'express';

// Common enums and types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
export type UserRole = 'vc' | 'startup_founder' | 'ngo_admin' | 'individual' | 'csr_manager' | 'admin' | 'super_admin';
export type ProjectType = 'startup' | 'product' | 'charity' | 'individual_assistance' | 'csr_initiative';
export type ProjectStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'funded' | 'active' | 'completed' | 'failed' | 'cancelled';
export type DonationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type MilestoneStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
export type VoteType = 'approval' | 'funding' | 'milestone' | 'governance' | 'dispute';
export type VoteStatus = 'pending' | 'active' | 'passed' | 'rejected' | 'expired';
export type AIServiceType = 'screening' | 'verification' | 'translation' | 'qa_bot' | 'analytics' | 'prediction';
export type Currency = 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'MATIC';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'hi' | 'ar' | 'pt' | 'ru' | 'ja';

// Base entity interface
export interface BaseEntity {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: Record<string, any>;
}

// Authenticated Request interface
export interface AuthenticatedRequest extends Request {
  user?: any; // Will be properly typed when User model is created
  traceId?: string;
}

// File upload interface
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  url?: string;
  ipfsHash?: string;
}

// Blockchain transaction interface
export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  gasUsed?: string;
  nonce: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: Date;
  status: 'pending' | 'confirmed' | 'failed';
} 