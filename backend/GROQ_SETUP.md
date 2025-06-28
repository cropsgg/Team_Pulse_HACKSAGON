# Groq AI Integration Setup

The ImpactChain backend has been completely integrated with Groq AI services, replacing OpenAI dependencies for better performance and cost-effectiveness.

## Features Integrated with Groq

### 1. Project Screening
- **Model Used**: `llama-3.3-70b-versatile`
- **Purpose**: Comprehensive analysis of project proposals
- **Scoring Criteria**:
  - Feasibility (0-100)
  - Impact potential (0-100)
  - Innovation level (0-100)
  - Sustainability (0-100)
  - Risk assessment (0-100)

### 2. NGO Verification
- **Model Used**: `llama-3.3-70b-versatile`
- **Purpose**: Credibility and compliance assessment
- **Evaluation Areas**:
  - Organizational credibility
  - Impact measurement
  - Regulatory compliance

### 3. Translation Services
- **Model Used**: `llama-3.1-8b-instant` (for speed)
- **Purpose**: Multi-language support for global accessibility
- **Features**:
  - Automatic language detection
  - High-confidence translations
  - Cached results for performance

### 4. Support Bot
- **Model Used**: `llama-3.1-8b-instant`
- **Purpose**: Intelligent customer support
- **Capabilities**:
  - Platform guidance
  - Process explanation
  - Contextual suggestions

### 5. Audio Transcription
- **Model Used**: `whisper-large-v3-turbo`
- **Purpose**: Converting audio content to text
- **Use Cases**:
  - Project pitch audio
  - Meeting transcriptions
  - Voice notes

### 6. Document Analysis
- **Model Used**: `llama-3.3-70b-versatile`
- **Purpose**: Document authenticity verification
- **Features**:
  - Fraud detection
  - Data extraction
  - Compliance checking

## Environment Configuration

Add the following environment variable to your `.env` file:

```bash
# Groq AI Configuration
GROQ_API_KEY=
```

## API Models Available

### Chat Completion Models
- `llama-3.3-70b-versatile` - High-performance model for complex analysis
- `llama-3.1-8b-instant` - Fast model for quick responses
- `llama3-8b-8192` - Alternative fast model
- `gemma2-9b-it` - Google's efficient model

### Audio Models
- `whisper-large-v3-turbo` - Fast transcription
- `whisper-large-v3` - High-accuracy transcription
- `distil-whisper-large-v3-en` - English-optimized model

## Rate Limits and Performance

### Groq Advantages
- **Speed**: 10x faster than traditional models
- **Cost**: Significantly lower than OpenAI
- **Reliability**: High uptime and consistent performance
- **Compatibility**: OpenAI-compatible API format

### Caching Strategy
- Project screening results cached for 24 hours
- Translation results cached for 7 days
- Support responses cached for similar queries
- Document analysis cached for 30 days

## Error Handling

The AI service includes comprehensive fallback mechanisms:

1. **API Failures**: Graceful degradation with default responses
2. **JSON Parsing Errors**: Fallback to structured responses
3. **Rate Limiting**: Automatic retry with exponential backoff
4. **Network Issues**: Cached responses when available

## Monitoring and Logging

All AI operations are logged with:
- Response times
- Confidence scores
- Error rates
- Usage patterns

## Usage Examples

### Project Screening
```typescript
const aiService = new AIService();
const result = await aiService.screenProject(project);
console.log(`Overall Score: ${result.overallScore}`);
```

### Translation
```typescript
const translation = await aiService.translateText(
  "Hello world", 
  "es", 
  "en"
);
console.log(translation.translatedText); // "Hola mundo"
```

### Support Bot
```typescript
const response = await aiService.processSupportMessage(
  "How do I fund a project?",
  "en",
  userId
);
console.log(response.message);
```

## Security Considerations

- API keys are stored securely in environment variables
- All responses are sanitized and validated
- Rate limiting prevents abuse
- Caching reduces API calls and costs

## Testing

The AI service includes mock responses for testing:
- Fallback analysis for projects
- Default NGO assessments
- Standard support responses

## Migration from OpenAI

This implementation completely replaces OpenAI dependencies:
- ✅ Removed `openai` package
- ✅ Removed `@huggingface/inference` package
- ✅ Added Groq-compatible API calls
- ✅ Maintained all existing functionality
- ✅ Improved performance and cost efficiency

## Troubleshooting

### Common Issues
1. **API Key Invalid**: Ensure GROQ_API_KEY is set correctly
2. **Rate Limiting**: Check Groq dashboard for usage limits
3. **Model Not Found**: Verify model names match Groq's available models
4. **Timeout Errors**: Increase timeout values for large requests

### Support
For Groq-specific issues, refer to:
- [Groq Documentation](https://docs.groq.com)
- [API Reference](https://docs.groq.com/api-reference)
- [Rate Limits](https://docs.groq.com/rate-limits) 