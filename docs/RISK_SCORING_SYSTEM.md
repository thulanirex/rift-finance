# RIFT Risk Scoring System

## Overview

The RIFT (Risk-Informed Financing Technology) scoring system is a comprehensive risk assessment framework that evaluates invoices and organizations to determine creditworthiness and default probability.

## Risk Score Components

### 1. **RIFT Score** (0-100)
A numerical score where **higher is better**:
- **80-100**: Grade A (Low Risk) - Excellent credit quality
- **60-79**: Grade B (Medium Risk) - Acceptable credit quality
- **0-59**: Grade C (High Risk) - Elevated default risk

### 2. **RIFT Grade** (A, B, C)
Letter grade classification for quick risk assessment.

## Scoring Factors

### Seller/Organization Factors (40% weight)
1. **KYB Status** (15%)
   - Approved: Full points
   - Pending: Partial points
   - Rejected: Zero points

2. **KYB Score** (10%)
   - Organization verification score (0-100)
   - Based on document completeness and verification

3. **Document Verification** (10%)
   - Number of approved documents
   - Document types (registration, tax, financial statements)
   - Document recency

4. **Sanctions Risk** (5%)
   - Low: Full points
   - Medium/High: Reduced points
   - Checks against international sanctions lists

### Invoice-Specific Factors (35% weight)
1. **Tenor Period** (10%)
   - Shorter tenors = Lower risk
   - 30 days: Full points
   - 90 days: Moderate points
   - 120+ days: Reduced points

2. **Invoice Amount** (10%)
   - Relative to organization size
   - Concentration risk assessment

3. **Buyer Creditworthiness** (10%)
   - Buyer country risk rating
   - Buyer payment history (if available)

4. **Invoice Characteristics** (5%)
   - Invoice number validity
   - Due date reasonableness
   - Document quality

### Historical Performance (25% weight)
1. **Payment History** (15%)
   - On-time payment rate
   - Default history
   - Repayment patterns

2. **Platform Activity** (10%)
   - Number of invoices funded
   - Total volume
   - Account age

## Risk Assessment Process

### For Invoice Review:
1. **Automatic Scoring**: System calculates initial RIFT score based on available data
2. **Operator Review**: 
   - Review seller KYB status and documents
   - Verify invoice authenticity
   - Check buyer information
   - Assess risk factors
3. **Manual Override**: Operators can adjust scores based on additional information
4. **Approval Decision**: Based on score, grade, and operator judgment

### For KYB Review:
1. **Document Collection**: Organization uploads required documents
2. **Verification**: Operator reviews:
   - Business registration documents
   - Tax identification
   - Financial statements
   - Beneficial ownership information
3. **Sanctions Screening**: Check against OFAC, EU, UN sanctions lists
4. **Risk Scoring**: Calculate KYB score based on completeness and verification
5. **Approval/Rejection**: Operator makes final decision

## Risk Mitigation Strategies

### Low Risk (Grade A)
- Standard approval process
- Competitive rates
- Higher funding limits

### Medium Risk (Grade B)
- Additional documentation may be required
- Moderate rates
- Standard funding limits
- Enhanced monitoring

### High Risk (Grade C)
- Requires senior operator approval
- Higher rates to compensate for risk
- Lower funding limits
- Frequent monitoring
- May require additional collateral

## Continuous Monitoring

The system continuously monitors:
- Payment performance
- Changes in organization status
- Sanctions list updates
- Country risk changes
- Market conditions

Scores are automatically recalculated when:
- New invoices are submitted
- Payments are made/missed
- Documents are updated
- External risk factors change

## Integration Points

### Data Sources:
- Internal: Invoice history, payment records, KYB documents
- External: Country risk ratings, sanctions lists, credit bureaus (future)

### Outputs:
- RIFT Score (0-100)
- RIFT Grade (A/B/C)
- Risk factors breakdown
- Approval recommendations
- Pricing suggestions

## Future Enhancements

1. **Machine Learning**: Train models on historical data to improve predictions
2. **External Credit Data**: Integration with credit bureaus and trade credit insurers
3. **Real-time Monitoring**: Continuous risk assessment and alerts
4. **Buyer Scoring**: Separate scoring system for invoice buyers
5. **Portfolio Risk**: Aggregate risk metrics across all funded invoices
