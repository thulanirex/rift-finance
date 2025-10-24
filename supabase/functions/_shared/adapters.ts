// Feature flags - read from environment or default to mock mode
const MOCK_COMPLIANCE = Deno.env.get('MOCK_COMPLIANCE') !== 'false';
const MOCK_SANCTIONS = Deno.env.get('MOCK_SANCTIONS') !== 'false';
const MOCK_VAT = Deno.env.get('MOCK_VAT') !== 'false';
const MOCK_INSURANCE = Deno.env.get('MOCK_INSURANCE') !== 'false';
const MOCK_REPAYMENT_INFLOW = Deno.env.get('MOCK_REPAYMENT_INFLOW') !== 'false';

interface KYBPayload {
  org_id: string;
  name: string;
  country: string;
  vat_number?: string;
  eori_number?: string;
  documents?: Array<{url: string; type: string}>;
}

interface KYBResponse {
  review: {
    status: string;
    result?: string;
    risk_score?: number;
    reason?: string;
  };
  reference_id: string;
}

interface ScreeningResult {
  pep: boolean;
  sanctions_hit: boolean;
  adverse_media: string[];
}

interface VATResult {
  valid: boolean;
  status: string;
  company_name?: string;
}

// Compliance Adapter
export const complianceAdapter = {
  async submitKYB(payload: KYBPayload, forceFail = false): Promise<KYBResponse> {
    if (MOCK_COMPLIANCE || forceFail) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      if (forceFail) {
        return {
          review: {
            status: 'completed',
            result: 'rejected',
            risk_score: 0.95,
            reason: 'High risk indicators detected (forced failure for demo)'
          },
          reference_id: `MOCK-KYB-FAIL-${crypto.randomUUID()}`
        };
      }
      
      return {
        review: {
          status: 'completed',
          result: 'approved',
          risk_score: 0.14
        },
        reference_id: `MOCK-KYB-${crypto.randomUUID()}`
      };
    }
    
    // Real Sumsub/Veriff integration would go here
    const apiKey = Deno.env.get('SUMSUB_API_KEY');
    if (!apiKey) throw new Error('SUMSUB_API_KEY not configured');
    
    // Placeholder for real API call
    throw new Error('Real KYB integration not yet implemented');
  }
};

// Screening Adapter
export const screeningAdapter = {
  async run(name: string, org: string, forceFail = false): Promise<ScreeningResult> {
    if (MOCK_SANCTIONS || forceFail) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (forceFail) {
        return {
          pep: true,
          sanctions_hit: true,
          adverse_media: ['Sanctions list match found (forced failure for demo)']
        };
      }
      
      return {
        pep: false,
        sanctions_hit: false,
        adverse_media: []
      };
    }
    
    // Real OpenSanctions integration would go here
    throw new Error('Real screening integration not yet implemented');
  }
};

// VAT Adapter
export const vatAdapter = {
  async verify(country: string, vatNumber: string, forceFail = false): Promise<VATResult> {
    if (MOCK_VAT || forceFail) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (forceFail) {
        return {
          valid: false,
          status: 'invalid'
        };
      }
      
      return {
        valid: true,
        status: 'active',
        company_name: 'Mock Company Ltd'
      };
    }
    
    // Real VIES integration would go here
    throw new Error('Real VAT verification not yet implemented');
  }
};

// Insurance Adapter
export const insuranceAdapter = {
  async emit(event: string, payload: any, forceFail = false): Promise<{success: boolean; policy_id?: string}> {
    if (MOCK_INSURANCE || forceFail) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (forceFail) {
        return { success: false };
      }
      
      return {
        success: true,
        policy_id: `MOCK-POLICY-${crypto.randomUUID()}`
      };
    }
    
    // Real insurance webhook integration would go here
    throw new Error('Real insurance integration not yet implemented');
  }
};

// Repayment Inflow Adapter
export const repaymentInflowAdapter = {
  async credit(supabaseClient: any, poolId: string, amount: number, invoiceId: string, forceFail = false): Promise<{success: boolean}> {
    if (MOCK_REPAYMENT_INFLOW || forceFail) {
      if (forceFail) {
        return { success: false };
      }
      
      // Create ledger entry for mock repayment inflow
      const { error } = await supabaseClient
        .from('ledger_entries')
        .insert({
          ref_type: 'repayment_inflow',
          ref_id: invoiceId,
          pool_id: poolId,
          amount: amount,
          metadata: { source: 'mock', timestamp: new Date().toISOString() }
        });
      
      if (error) throw error;
      return { success: true };
    }
    
    // Real fiat → token rail would go here
    throw new Error('Real repayment inflow not yet implemented');
  }
};
