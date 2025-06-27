# ML Integration Specifications - ImpactChain Platform

## Overview
This document defines the complete interface specifications for integrating Machine Learning models into the ImpactChain platform. All endpoints are designed for easy model swapping without backend modifications.

## Service Architecture

### ML-Stub Service Endpoints
- **Protocol**: gRPC + HTTP REST fallback
- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: 1000 requests/minute per service
- **Timeout**: 30 seconds max response time
- **Retry Policy**: 3 attempts with exponential backoff

## Core ML Tasks

### 1. KPI Verification Service

**Endpoint**: `POST /ml/verify-kpi`  
**gRPC Method**: `VerifyKPI`

#### Input Schema
```json
{
  "campaignId": "string",
  "milestoneId": "string", 
  "kpiType": "enum[WATER_ACCESS, EDUCATION_ENROLLMENT, TREES_PLANTED, INFRASTRUCTURE_BUILT]",
  "targetValue": "number",
  "claimedValue": "number",
  "evidenceData": {
    "satelliteImages": [
      {
        "url": "string",
        "timestamp": "ISO8601",
        "coordinates": {
          "lat": "number",
          "lng": "number"
        },
        "resolution": "number"
      }
    ],
    "documentUrls": ["string"],
    "oracleData": {
      "source": "string",
      "value": "number",
      "confidence": "number"
    },
    "blockchainProofs": [
      {
        "transactionHash": "string",
        "blockNumber": "number",
        "eventData": "object"
      }
    ]
  },
  "historicalData": {
    "previousMilestones": [
      {
        "completedAt": "ISO8601",
        "verifiedValue": "number",
        "accuracy": "number"
      }
    ],
    "campaignPerformance": {
      "averageAccuracy": "number",
      "totalMilestones": "number",
      "successRate": "number"
    }
  }
}
```

#### Expected Output Schema
```json
{
  "verified": "boolean",
  "confidence": "number", // 0.0 - 1.0
  "verifiedValue": "number",
  "accuracy": "number", // percentage accuracy vs claimed
  "anomalies": [
    {
      "type": "enum[TEMPORAL, SPATIAL, STATISTICAL]",
      "severity": "enum[LOW, MEDIUM, HIGH]",
      "description": "string",
      "confidence": "number"
    }
  ],
  "evidenceAnalysis": {
    "satelliteAnalysis": {
      "changeDetected": "boolean",
      "changeConfidence": "number",
      "areaAnalyzed": "number",
      "temporalConsistency": "number"
    },
    "documentAnalysis": {
      "authenticityScore": "number",
      "metadataConsistency": "boolean",
      "contentVerification": "number"
    },
    "oracleConsistency": "number",
    "blockchainConsistency": "number"
  },
  "recommendations": [
    {
      "action": "enum[APPROVE, REJECT, REQUEST_MORE_EVIDENCE, MANUAL_REVIEW]",
      "reason": "string",
      "priority": "enum[LOW, MEDIUM, HIGH]"
    }
  ],
  "metadata": {
    "modelVersion": "string",
    "processingTime": "number",
    "dataQuality": "number",
    "timestamp": "ISO8601"
  }
}
```

### 2. Churn Prediction Service

**Endpoint**: `POST /ml/predict-churn`  
**gRPC Method**: `PredictChurn`

#### Input Schema
```json
{
  "userId": "string",
  "userProfile": {
    "registrationDate": "ISO8601",
    "totalDonated": "number",
    "donationCount": "number",
    "avgDonationAmount": "number",
    "lastDonationDate": "ISO8601",
    "preferredCategories": ["string"],
    "volunteerHours": "number",
    "reputationScore": "number",
    "socialConnections": "number"
  },
  "engagementMetrics": {
    "last30Days": {
      "loginCount": "number",
      "campaignsViewed": "number",
      "donationsMade": "number",
      "volunteerTasksCompleted": "number",
      "proposalsVoted": "number"
    },
    "last90Days": {
      "loginCount": "number",
      "campaignsViewed": "number", 
      "donationsMade": "number",
      "volunteerTasksCompleted": "number",
      "proposalsVoted": "number"
    },
    "emailEngagement": {
      "openRate": "number",
      "clickRate": "number",
      "unsubscribed": "boolean"
    }
  },
  "campaignInteractions": [
    {
      "campaignId": "string",
      "interactionType": "enum[VIEWED, DONATED, SHARED, FOLLOWED]",
      "timestamp": "ISO8601",
      "amount": "number"
    }
  ],
  "seasonalFactors": {
    "currentMonth": "number",
    "holidaysSeason": "boolean",
    "taxSeason": "boolean"
  }
}
```

#### Expected Output Schema
```json
{
  "churnProbability": "number", // 0.0 - 1.0
  "riskLevel": "enum[LOW, MEDIUM, HIGH, CRITICAL]",
  "timeToChurn": "number", // days
  "confidence": "number",
  "factors": [
    {
      "factor": "string",
      "importance": "number",
      "direction": "enum[POSITIVE, NEGATIVE]",
      "description": "string"
    }
  ],
  "retentionStrategies": [
    {
      "strategy": "enum[PERSONALIZED_CAMPAIGN, VOLUNTEER_OPPORTUNITY, MATCHING_OFFER, SOCIAL_ENGAGEMENT]",
      "expectedEffectiveness": "number",
      "urgency": "enum[LOW, MEDIUM, HIGH]",
      "description": "string",
      "parameters": "object"
    }
  ],
  "segmentAnalysis": {
    "userSegment": "string",
    "segmentChurnRate": "number",
    "segmentSize": "number",
    "comparativeRisk": "number"
  },
  "metadata": {
    "modelVersion": "string",
    "featureImportance": "object",
    "predictionTimestamp": "ISO8601"
  }
}
```

### 3. Need Ranking Service

**Endpoint**: `POST /ml/rank-needs`  
**gRPC Method**: `RankNeeds`

#### Input Schema
```json
{
  "helpRequests": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "amount": "number",
      "currency": "string",
      "category": "string",
      "urgency": "enum[LOW, MEDIUM, HIGH, CRITICAL]",
      "location": {
        "country": "string",
        "region": "string",
        "coordinates": {
          "lat": "number",
          "lng": "number"
        }
      },
      "demographics": {
        "householdSize": "number",
        "income": "number",
        "dependents": "number",
        "age": "number",
        "gender": "string",
        "employment": "string"
      },
      "verification": {
        "documentsProvided": ["string"],
        "verificationScore": "number",
        "thirdPartyVerified": "boolean"
      },
      "historicalData": {
        "previousRequests": "number",
        "successfulCompletions": "number",
        "timeToCompletion": "number"
      },
      "submittedAt": "ISO8601",
      "requesterProfile": {
        "registrationDate": "ISO8601",
        "communityConnections": "number",
        "localReferences": "number"
      }
    }
  ],
  "contextData": {
    "totalAvailableFunds": "number",
    "currentFundingQueue": "number",
    "regionalFactors": {
      "disasterEvents": ["object"],
      "economicIndicators": "object",
      "seasonalFactors": "object"
    },
    "donorPreferences": {
      "categoryPreferences": "object",
      "regionPreferences": "object",
      "urgencyThresholds": "object"
    }
  }
}
```

#### Expected Output Schema
```json
{
  "rankedRequests": [
    {
      "id": "string",
      "priority": "number", // 0-100
      "urgencyAdjusted": "number",
      "needScore": {
        "financialNeed": "number",
        "socialImpact": "number", 
        "urgency": "number",
        "verification": "number",
        "completion": "number"
      },
      "reasoning": [
        {
          "factor": "string",
          "weight": "number",
          "explanation": "string"
        }
      ],
      "recommendedAmount": "number",
      "estimatedTimeToFund": "number",
      "riskFactors": [
        {
          "type": "string",
          "severity": "enum[LOW, MEDIUM, HIGH]",
          "description": "string"
        }
      ]
    }
  ],
  "summaryAnalysis": {
    "totalNeedScore": "number",
    "averageUrgency": "number",
    "geographicDistribution": "object",
    "categoryBreakdown": "object",
    "fundingGap": "number"
  },
  "recommendations": {
    "priorityThreshold": "number",
    "batchFundingStrategy": "string",
    "alertCriticalCases": ["string"]
  },
  "metadata": {
    "modelVersion": "string",
    "processingTime": "number",
    "dataQuality": "number",
    "timestamp": "ISO8601"
  }
}
```

### 4. Fraud Detection Service

**Endpoint**: `POST /ml/detect-fraud`  
**gRPC Method**: `DetectFraud`

#### Input Schema
```json
{
  "transactionData": {
    "id": "string",
    "type": "enum[DONATION, WITHDRAWAL, TRANSFER]",
    "amount": "number",
    "currency": "string",
    "timestamp": "ISO8601",
    "fromAddress": "string",
    "toAddress": "string",
    "campaignId": "string",
    "gasPrice": "number",
    "gasUsed": "number"
  },
  "userBehavior": {
    "userId": "string",
    "accountAge": "number",
    "transactionHistory": [
      {
        "amount": "number",
        "timestamp": "ISO8601",
        "type": "string"
      }
    ],
    "loginPatterns": {
      "frequentLocations": ["string"],
      "deviceFingerprints": ["string"],
      "timeZoneConsistency": "boolean"
    },
    "socialSignals": {
      "connections": "number",
      "vouches": "number",
      "communityScore": "number"
    }
  },
  "networkAnalysis": {
    "addressClustering": {
      "cluster": "string",
      "clusterSize": "number",
      "clusterActivity": "number"
    },
    "transactionGraph": {
      "directConnections": "number",
      "indirectConnections": "number",
      "knownFraudConnections": "number"
    }
  },
  "externalData": {
    "blacklistedAddresses": ["string"],
    "sanctionLists": ["string"],
    "riskDatabases": ["object"]
  }
}
```

#### Expected Output Schema
```json
{
  "fraudScore": "number", // 0.0 - 1.0
  "riskLevel": "enum[LOW, MEDIUM, HIGH, CRITICAL]",
  "recommendation": "enum[APPROVE, REVIEW, REJECT, FREEZE]",
  "confidence": "number",
  "fraudTypes": [
    {
      "type": "enum[MONEY_LAUNDERING, WASH_TRADING, SYBIL_ATTACK, CAMPAIGN_FRAUD]",
      "probability": "number",
      "indicators": ["string"]
    }
  ],
  "riskFactors": [
    {
      "category": "enum[BEHAVIORAL, NETWORK, TEMPORAL, FINANCIAL]",
      "factor": "string",
      "severity": "number",
      "description": "string"
    }
  ],
  "anomalies": [
    {
      "type": "string",
      "deviation": "number",
      "baseline": "number",
      "significance": "number"
    }
  ],
  "networkInsights": {
    "suspiciousConnections": ["string"],
    "clusterRisk": "number",
    "propagationRisk": "number"
  },
  "mitigationActions": [
    {
      "action": "string",
      "urgency": "enum[LOW, MEDIUM, HIGH]",
      "effectiveness": "number"
    }
  ],
  "metadata": {
    "modelVersion": "string",
    "analysisDepth": "enum[QUICK, STANDARD, DEEP]",
    "processingTime": "number",
    "timestamp": "ISO8601"
  }
}
```

## Batch Processing Endpoints

### Batch KPI Verification
**Endpoint**: `POST /ml/batch/verify-kpis`

```json
{
  "requests": [
    // Array of KPI verification requests
  ],
  "priority": "enum[LOW, NORMAL, HIGH]",
  "callback": "string" // Webhook URL for completion
}
```

### Batch Churn Prediction
**Endpoint**: `POST /ml/batch/predict-churn`

```json
{
  "userIds": ["string"],
  "includePastPredictions": "boolean",
  "callback": "string"
}
```

## Model Performance Monitoring

### Model Metrics Endpoint
**Endpoint**: `GET /ml/metrics`

```json
{
  "models": [
    {
      "name": "string",
      "version": "string",
      "accuracy": "number",
      "precision": "number",
      "recall": "number",
      "f1Score": "number",
      "lastUpdated": "ISO8601",
      "requestCount": "number",
      "averageLatency": "number"
    }
  ]
}
```

### Model Health Check
**Endpoint**: `GET /ml/health`

```json
{
  "status": "enum[HEALTHY, DEGRADED, UNHEALTHY]",
  "models": [
    {
      "name": "string",
      "status": "enum[ACTIVE, INACTIVE, ERROR]",
      "lastPrediction": "ISO8601",
      "errorRate": "number"
    }
  ],
  "systemMetrics": {
    "cpuUsage": "number",
    "memoryUsage": "number",
    "diskUsage": "number"
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object",
    "retryable": "boolean",
    "timestamp": "ISO8601"
  }
}
```

### Error Codes
- `MODEL_NOT_AVAILABLE`: Model is currently unavailable
- `INVALID_INPUT`: Input validation failed
- `INSUFFICIENT_DATA`: Not enough data for prediction
- `TIMEOUT`: Request exceeded time limit
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Model processing error

## Authentication & Security

### JWT Token Requirements
```json
{
  "sub": "service-account-id",
  "iss": "impactchain-auth",
  "aud": "ml-service",
  "exp": "timestamp",
  "scope": ["ml:predict", "ml:batch", "ml:metrics"]
}
```

### Rate Limiting
- Standard requests: 1000/minute per service
- Batch requests: 100/minute per service
- Health checks: Unlimited

## Integration Examples

### Node.js Integration
```javascript
import { MLServiceClient } from '@impactchain/ml-client';

const client = new MLServiceClient({
  endpoint: 'http://ml-service:8080',
  token: process.env.ML_SERVICE_TOKEN
});

// KPI Verification
const result = await client.verifyKPI({
  campaignId: '123',
  milestoneId: '456',
  kpiType: 'WATER_ACCESS',
  // ... rest of input
});

// Churn Prediction
const churnResult = await client.predictChurn({
  userId: '789',
  // ... rest of input
});
```

### Python Integration
```python
import grpc
from ml_service_pb2_grpc import MLServiceStub
from ml_service_pb2 import VerifyKPIRequest

channel = grpc.insecure_channel('ml-service:9090')
client = MLServiceStub(channel)

request = VerifyKPIRequest(
    campaign_id='123',
    milestone_id='456',
    # ... rest of request
)

response = client.VerifyKPI(request)
```

## Deployment Considerations

### Resource Requirements
- **CPU**: 4 cores minimum, 8 cores recommended
- **Memory**: 16GB minimum, 32GB for batch processing
- **Storage**: 100GB SSD for model storage
- **GPU**: Optional, NVIDIA T4 or better for deep learning models

### Scaling Strategy
- Horizontal scaling for inference
- Model versioning with A/B testing
- Feature store for consistent feature engineering
- Model registry for deployment management

### Monitoring & Alerting
- Prediction latency > 5 seconds
- Error rate > 1%
- Model accuracy degradation > 5%
- Resource utilization > 80%

## Data Privacy & Compliance

### PII Handling
- No PII stored in ML service
- Data anonymization for model training
- Retention policies for prediction logs
- GDPR compliance for EU users

### Model Explainability
- SHAP values for feature importance
- LIME explanations for individual predictions
- Model cards documenting bias and limitations
- Audit trails for all predictions

---

This specification enables seamless integration of ML models while maintaining high performance, security, and reliability standards across the ImpactChain platform. 