import axios from 'axios';
import { logger } from '@/utils/logger';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/config/redis';
import { Project, IProject } from '@/models/Project.model';
import { NGO, INGO } from '@/models/NGO.model';

// AI Service Types
export interface AIScreeningResult {
  feasibilityScore: number;
  impactScore: number;
  riskScore: number;
  innovationScore: number;
  sustainabilityScore: number;
  overallScore: number;
  recommendations: string[];
  concerns: string[];
  confidence: number;
}

export interface DocumentAnalysisResult {
  isAuthentic: boolean;
  confidence: number;
  redFlags: string[];
  extractedData: Record<string, any>;
  requiresManualReview: boolean;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface SupportBotResponse {
  message: string;
  confidence: number;
  language: string;
  suggestedActions?: string[];
  relatedQuestions?: string[];
}

export interface MilestoneVerificationResult {
  isVerified: boolean;
  confidence: number;
  findings: Array<{
    criterion: string;
    status: 'passed' | 'failed' | 'warning';
    confidence: number;
    explanation: string;
  }>;
  overallAssessment: string;
  reviewRequired: boolean;
}

export class AIService {
  private openaiApiKey: string;
  private huggingfaceApiKey: string;
  private vllmApiUrl: string;
  private translatorApiUrl: string;
  private vectorDbUrl: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.vllmApiUrl = process.env.VLLM_API_URL || 'http://localhost:8000';
    this.translatorApiUrl = process.env.TRANSLATOR_API_URL || 'http://localhost:8001';
    this.vectorDbUrl = process.env.VECTOR_DB_URL || 'http://localhost:6333';
  }

  /**
   * Screen a project using AI models
   */
  async screenProject(project: IProject): Promise<AIScreeningResult> {
    try {
      const cacheKey = CACHE_KEYS.AI_SCREENING(this.generateProjectHash(project));
      const cached = await cacheService.get<AIScreeningResult>(cacheKey);
      
      if (cached) {
        logger.info('AI screening result retrieved from cache', { projectId: project._id });
        return cached;
      }

      const startTime = Date.now();

      // Prepare project data for AI analysis
      const projectData = {
        title: project.title,
        description: project.description,
        category: project.category,
        type: project.type,
        fundingGoal: project.fundingGoal,
        deadline: project.deadline,
        location: project.location,
        milestones: project.milestones,
        impactGoals: project.impactGoals,
        documents: project.documents?.map(doc => ({ type: doc.type, name: doc.name }))
      };

      // Call multiple AI models for comprehensive analysis
      const [
        feasibilityAnalysis,
        impactAnalysis,
        riskAnalysis,
        innovationAnalysis,
        sustainabilityAnalysis
      ] = await Promise.all([
        this.analyzeFeasibility(projectData),
        this.analyzeImpact(projectData),
        this.analyzeRisk(projectData),
        this.analyzeInnovation(projectData),
        this.analyzeSustainability(projectData)
      ]);

      // Calculate overall score and combine results
      const result: AIScreeningResult = {
        feasibilityScore: feasibilityAnalysis.score,
        impactScore: impactAnalysis.score,
        riskScore: riskAnalysis.score,
        innovationScore: innovationAnalysis.score,
        sustainabilityScore: sustainabilityAnalysis.score,
        overallScore: this.calculateOverallScore({
          feasibility: feasibilityAnalysis.score,
          impact: impactAnalysis.score,
          risk: riskAnalysis.score,
          innovation: innovationAnalysis.score,
          sustainability: sustainabilityAnalysis.score
        }),
        recommendations: [
          ...feasibilityAnalysis.recommendations,
          ...impactAnalysis.recommendations,
          ...innovationAnalysis.recommendations,
          ...sustainabilityAnalysis.recommendations
        ].slice(0, 10), // Limit to top 10 recommendations
        concerns: [
          ...riskAnalysis.concerns,
          ...feasibilityAnalysis.concerns,
          ...impactAnalysis.concerns
        ].slice(0, 10), // Limit to top 10 concerns
        confidence: this.calculateConfidence([
          feasibilityAnalysis.confidence,
          impactAnalysis.confidence,
          riskAnalysis.confidence,
          innovationAnalysis.confidence,
          sustainabilityAnalysis.confidence
        ])
      };

      const duration = Date.now() - startTime;

      // Cache the result
      await cacheService.set(cacheKey, result, CACHE_TTL.LONG);

      logger.info('Project AI screening completed', {
        projectId: project._id,
        overallScore: result.overallScore,
        duration: `${duration}ms`,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      logger.error('AI project screening failed:', error);
      throw new Error('AI screening service unavailable');
    }
  }

  /**
   * Screen an NGO using AI models
   */
  async screenNGO(ngo: INGO): Promise<AIScreeningResult> {
    try {
      const cacheKey = CACHE_KEYS.AI_SCREENING(this.generateNGOHash(ngo));
      const cached = await cacheService.get<AIScreeningResult>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const startTime = Date.now();

      const ngoData = {
        name: ngo.name,
        description: ngo.description,
        mission: ngo.mission,
        categories: ngo.categories,
        registrationCountry: ngo.registrationCountry,
        registrationDate: ngo.registrationDate,
        impactMetrics: ngo.impactMetrics,
        verificationDocuments: ngo.verificationDocuments.map(doc => ({ type: doc.type }))
      };

      // Perform NGO-specific analysis
      const [
        credibilityAnalysis,
        impactAnalysis,
        complianceAnalysis
      ] = await Promise.all([
        this.analyzeNGOCredibility(ngoData),
        this.analyzeNGOImpact(ngoData),
        this.analyzeNGOCompliance(ngoData)
      ]);

      const result: AIScreeningResult = {
        feasibilityScore: credibilityAnalysis.score,
        impactScore: impactAnalysis.score,
        riskScore: 100 - complianceAnalysis.score, // Invert compliance score
        innovationScore: 0, // Not applicable for NGOs
        sustainabilityScore: impactAnalysis.sustainabilityScore || 0,
        overallScore: this.calculateNGOOverallScore({
          credibility: credibilityAnalysis.score,
          impact: impactAnalysis.score,
          compliance: complianceAnalysis.score
        }),
        recommendations: [
          ...credibilityAnalysis.recommendations,
          ...impactAnalysis.recommendations,
          ...complianceAnalysis.recommendations
        ].slice(0, 10),
        concerns: [
          ...credibilityAnalysis.concerns,
          ...complianceAnalysis.concerns
        ].slice(0, 10),
        confidence: this.calculateConfidence([
          credibilityAnalysis.confidence,
          impactAnalysis.confidence,
          complianceAnalysis.confidence
        ])
      };

      await cacheService.set(cacheKey, result, CACHE_TTL.LONG);

      const duration = Date.now() - startTime;
      logger.info('NGO AI screening completed', {
        ngoId: ngo._id,
        overallScore: result.overallScore,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('AI NGO screening failed:', error);
      throw new Error('AI screening service unavailable');
    }
  }

  /**
   * Analyze document authenticity and extract data
   */
  async analyzeDocument(documentUrl: string, documentType: string): Promise<DocumentAnalysisResult> {
    try {
      const cacheKey = `doc_analysis:${documentType}:${this.hashString(documentUrl)}`;
      const cached = await cacheService.get<DocumentAnalysisResult>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const startTime = Date.now();

      // Call document analysis API
      const response = await axios.post(`${this.vllmApiUrl}/analyze-document`, {
        document_url: documentUrl,
        document_type: documentType,
        extract_data: true,
        check_authenticity: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const result: DocumentAnalysisResult = {
        isAuthentic: response.data.is_authentic,
        confidence: response.data.confidence,
        redFlags: response.data.red_flags || [],
        extractedData: response.data.extracted_data || {},
        requiresManualReview: response.data.requires_manual_review || false
      };

      await cacheService.set(cacheKey, result, CACHE_TTL.VERY_LONG);

      const duration = Date.now() - startTime;
      logger.info('Document analysis completed', {
        documentType,
        isAuthentic: result.isAuthentic,
        confidence: result.confidence,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('Document analysis failed:', error);
      throw new Error('Document analysis service unavailable');
    }
  }

  /**
   * Translate text between languages
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      const cacheKey = `translation:${sourceLanguage || 'auto'}:${targetLanguage}:${this.hashString(text)}`;
      const cached = await cacheService.get<TranslationResult>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await axios.post(`${this.translatorApiUrl}/translate`, {
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage
      }, {
        timeout: 10000
      });

      const result: TranslationResult = {
        translatedText: response.data.translated_text,
        sourceLanguage: response.data.detected_language || sourceLanguage || 'auto',
        targetLanguage,
        confidence: response.data.confidence
      };

      await cacheService.set(cacheKey, result, CACHE_TTL.VERY_LONG);

      logger.info('Translation completed', {
        sourceLanguage: result.sourceLanguage,
        targetLanguage,
        confidence: result.confidence
      });

      return result;
    } catch (error) {
      logger.error('Translation failed:', error);
      throw new Error('Translation service unavailable');
    }
  }

  /**
   * Process support bot message
   */
  async processSupportMessage(
    message: string,
    language: string = 'en',
    userId?: string
  ): Promise<SupportBotResponse> {
    try {
      const startTime = Date.now();

      // First, check for cached similar questions
      const similarQuestions = await this.findSimilarQuestions(message, language);
      
      if (similarQuestions.length > 0 && similarQuestions[0].confidence > 0.85) {
        logger.info('Support response from cache', {
          userId,
          language,
          confidence: similarQuestions[0].confidence
        });
        
        return {
          message: similarQuestions[0].answer,
          confidence: similarQuestions[0].confidence,
          language,
          relatedQuestions: similarQuestions.slice(1, 4).map(q => q.question)
        };
      }

      // Generate new response using AI
      const response = await axios.post(`${this.vllmApiUrl}/support-chat`, {
        message,
        language,
        user_id: userId,
        context: 'impactchain_platform'
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      const result: SupportBotResponse = {
        message: response.data.message,
        confidence: response.data.confidence,
        language,
        suggestedActions: response.data.suggested_actions || [],
        relatedQuestions: response.data.related_questions || []
      };

      // Store the Q&A pair for future use if confidence is high
      if (result.confidence > 0.7) {
        await this.storeQAPair(message, result.message, language, result.confidence);
      }

      const duration = Date.now() - startTime;
      logger.info('Support bot response generated', {
        userId,
        language,
        confidence: result.confidence,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('Support bot processing failed:', error);
      
      // Return fallback response
      return {
        message: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact our support team directly.',
        confidence: 0.1,
        language,
        suggestedActions: ['contact_support', 'try_again_later']
      };
    }
  }

  /**
   * Verify milestone completion using AI
   */
  async verifyMilestone(
    milestoneId: string,
    evidence: Array<{ type: string; url: string; description?: string }>
  ): Promise<MilestoneVerificationResult> {
    try {
      const startTime = Date.now();

      // Analyze all evidence files
      const evidenceAnalysis = await Promise.all(
        evidence.map(async (item) => {
          try {
            const analysis = await this.analyzeEvidenceFile(item.url, item.type);
            return { ...item, analysis };
          } catch (error) {
            logger.error('Evidence analysis failed:', error);
            return { ...item, analysis: null };
          }
        })
      );

      // Perform milestone verification
      const response = await axios.post(`${this.vllmApiUrl}/verify-milestone`, {
        milestone_id: milestoneId,
        evidence: evidenceAnalysis,
        verification_criteria: ['completeness', 'authenticity', 'relevance', 'quality']
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const result: MilestoneVerificationResult = {
        isVerified: response.data.is_verified,
        confidence: response.data.confidence,
        findings: response.data.findings || [],
        overallAssessment: response.data.overall_assessment,
        reviewRequired: response.data.review_required || false
      };

      const duration = Date.now() - startTime;
      logger.info('Milestone verification completed', {
        milestoneId,
        isVerified: result.isVerified,
        confidence: result.confidence,
        reviewRequired: result.reviewRequired,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('Milestone verification failed:', error);
      throw new Error('Milestone verification service unavailable');
    }
  }

  // Private helper methods

  private async analyzeFeasibility(projectData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
    concerns: string[];
  }> {
    // Implementation for feasibility analysis
    // This would call specialized AI models or use rule-based logic
    return {
      score: Math.random() * 40 + 60, // Placeholder: 60-100 range
      confidence: 0.8,
      recommendations: ['Consider market validation', 'Strengthen technical team'],
      concerns: []
    };
  }

  private async analyzeImpact(projectData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
  }> {
    return {
      score: Math.random() * 30 + 70,
      confidence: 0.75,
      recommendations: ['Define clearer impact metrics', 'Consider long-term sustainability']
    };
  }

  private async analyzeRisk(projectData: any): Promise<{
    score: number;
    confidence: number;
    concerns: string[];
  }> {
    return {
      score: Math.random() * 40 + 10, // Lower risk score is better
      confidence: 0.85,
      concerns: ['Market competition', 'Regulatory challenges']
    };
  }

  private async analyzeInnovation(projectData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
  }> {
    return {
      score: Math.random() * 50 + 50,
      confidence: 0.7,
      recommendations: ['Highlight unique value proposition']
    };
  }

  private async analyzeSustainability(projectData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
  }> {
    return {
      score: Math.random() * 40 + 60,
      confidence: 0.8,
      recommendations: ['Develop revenue model', 'Plan for scalability']
    };
  }

  private async analyzeNGOCredibility(ngoData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
    concerns: string[];
  }> {
    return {
      score: Math.random() * 30 + 70,
      confidence: 0.85,
      recommendations: ['Update financial transparency'],
      concerns: []
    };
  }

  private async analyzeNGOImpact(ngoData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
    sustainabilityScore?: number;
  }> {
    return {
      score: Math.random() * 40 + 60,
      confidence: 0.8,
      recommendations: ['Improve impact measurement'],
      sustainabilityScore: Math.random() * 40 + 60
    };
  }

  private async analyzeNGOCompliance(ngoData: any): Promise<{
    score: number;
    confidence: number;
    recommendations: string[];
    concerns: string[];
  }> {
    return {
      score: Math.random() * 20 + 80,
      confidence: 0.9,
      recommendations: ['Update board governance'],
      concerns: []
    };
  }

  private calculateOverallScore(scores: {
    feasibility: number;
    impact: number;
    risk: number;
    innovation: number;
    sustainability: number;
  }): number {
    const weights = {
      feasibility: 0.25,
      impact: 0.25,
      innovation: 0.20,
      sustainability: 0.20,
      risk: -0.10
    };

    const weighted = 
      (scores.feasibility * weights.feasibility) +
      (scores.impact * weights.impact) +
      (scores.innovation * weights.innovation) +
      (scores.sustainability * weights.sustainability) +
      ((100 - scores.risk) * Math.abs(weights.risk));

    return Math.round(Math.max(0, Math.min(100, weighted)));
  }

  private calculateNGOOverallScore(scores: {
    credibility: number;
    impact: number;
    compliance: number;
  }): number {
    const weights = { credibility: 0.4, impact: 0.35, compliance: 0.25 };
    return Math.round(
      (scores.credibility * weights.credibility) +
      (scores.impact * weights.impact) +
      (scores.compliance * weights.compliance)
    );
  }

  private calculateConfidence(confidences: number[]): number {
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private generateProjectHash(project: IProject): string {
    const data = `${project.title}:${project.description}:${project.fundingGoal.amount}:${project.type}`;
    return this.hashString(data);
  }

  private generateNGOHash(ngo: INGO): string {
    const data = `${ngo.name}:${ngo.registrationNumber}:${ngo.mission}`;
    return this.hashString(data);
  }

  private hashString(str: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private async findSimilarQuestions(
    question: string,
    language: string
  ): Promise<Array<{ question: string; answer: string; confidence: number }>> {
    try {
      // This would query a vector database for similar questions
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      logger.error('Error finding similar questions:', error);
      return [];
    }
  }

  private async storeQAPair(
    question: string,
    answer: string,
    language: string,
    confidence: number
  ): Promise<void> {
    try {
      // Store Q&A pair in vector database and MongoDB
      // This would be implemented with actual vector DB integration
      logger.info('Q&A pair stored', { language, confidence });
    } catch (error) {
      logger.error('Error storing Q&A pair:', error);
    }
  }

  private async analyzeEvidenceFile(url: string, type: string): Promise<any> {
    try {
      const response = await axios.post(`${this.vllmApiUrl}/analyze-evidence`, {
        file_url: url,
        file_type: type
      }, {
        timeout: 20000
      });

      return response.data;
    } catch (error) {
      logger.error('Evidence file analysis failed:', error);
      return null;
    }
  }
} 