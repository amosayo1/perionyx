export interface AiRecommendation {
  confidence: number;
  recommendation: string;
  reason: string;
  supportingEvidence: string[];
  suggestedAction: string | null;
}

export interface IAiRecommendationService {
  analyzeInvoice(invoiceId: string, companyId: string): Promise<AiRecommendation>;
  assessException(exceptionId: string, companyId: string): Promise<AiRecommendation>;
}

export class AiRecommendationService implements IAiRecommendationService {
  async analyzeInvoice(_invoiceId: string, _companyId: string): Promise<AiRecommendation> {
    return {
      confidence: 0.15,
      recommendation: "AI analysis is not yet available",
      reason: "The AI recommendation engine has not been connected. Invoice data has been captured and is ready for manual review.",
      supportingEvidence: [
        "All invoice fields have been captured",
        "Three-way match data is available for review",
        "Historical vendor data can be accessed",
      ],
      suggestedAction: "Proceed with manual review using the available match, exception, and approval data",
    };
  }

  async assessException(_exceptionId: string, _companyId: string): Promise<AiRecommendation> {
    return {
      confidence: 0.1,
      recommendation: "AI assessment is not available",
      reason: "Exception assessment requires AI integration which is not yet configured.",
      supportingEvidence: [],
      suggestedAction: "Review exception details manually and resolve based on policy",
    };
  }
}

export const aiRecommendationService = new AiRecommendationService();
