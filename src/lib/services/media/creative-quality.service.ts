export interface CreativeQualityAuditResult {
  status: 'PASS' | 'WARNING' | 'FAIL';
  warnings: string[];
  errors: string[];
  aspectRatioMatch: boolean;
  fileValid: boolean;
  policyRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
}

export class CreativeQualityService {
  async auditCreativeAsset(data: {
    prompt: string;
    mediaUrl: string;
    aspectRatio: string;
    type: 'IMAGE' | 'VIDEO';
  }): Promise<CreativeQualityAuditResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!data.mediaUrl || data.mediaUrl.length < 10) {
      errors.push('Media URL is empty or invalid.');
    }

    if (!data.prompt || data.prompt.length < 5) {
      warnings.push('Prompt description is very short.');
    }

    const hasDeceptiveClaim = ['100% safe', 'guaranteed results', 'risk-free'].some(kw =>
      data.prompt.toLowerCase().includes(kw)
    );

    if (hasDeceptiveClaim) {
      errors.push('Health Canada Compliance Violation: Prompt contains forbidden medical guarantee.');
    }

    const status = errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARNING' : 'PASS';

    return {
      status,
      warnings,
      errors,
      aspectRatioMatch: true,
      fileValid: errors.length === 0,
      policyRisk: hasDeceptiveClaim ? 'HIGH' : 'LOW',
      score: status === 'PASS' ? 96 : status === 'WARNING' ? 75 : 0,
    };
  }
}

export const creativeQualityService = new CreativeQualityService();
