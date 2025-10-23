import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useFunderProfile } from '@/hooks/useFunderProfile';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';

const STEPS = ['Profile Type', 'Identity Details', 'AML & Tax', 'Consents'];

export function FunderOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    profile: {
      type: 'individual',
      residency_country: '',
      nationality: '',
      tax_residency_country: '',
      source_of_funds: [],
      source_of_wealth: '',
      fatca_crs_self_cert: {},
      aml_answers: {},
      consent_docs: {},
    },
    documents: [],
    bankAccount: null,
  });

  const { submitProfile, isSubmitting } = useFunderProfile();

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    submitProfile(formData);
    // Redirect to dashboard after submission
    setTimeout(() => {
      navigate('/dashboard/funder');
    }, 1500); // Wait for toast to show
  };

  const updateProfile = (field: string, value: any) => {
    setFormData({
      ...formData,
      profile: { ...formData.profile, [field]: value },
    });
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Funder Verification</CardTitle>
          <CardDescription>Step {step + 1} of {STEPS.length}: {STEPS[step]}</CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <Label>Profile Type</Label>
              <RadioGroup
                value={formData.profile.type}
                onValueChange={(value) => updateProfile('type', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="font-normal">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entity" id="entity" />
                  <Label htmlFor="entity" className="font-normal">Entity</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {formData.profile.type === 'individual' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.profile.first_name || ''}
                        onChange={(e) => updateProfile('first_name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.profile.last_name || ''}
                        onChange={(e) => updateProfile('last_name', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.profile.dob || ''}
                      onChange={(e) => updateProfile('dob', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.profile.nationality || ''}
                      onChange={(e) => updateProfile('nationality', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="residency_country">Country of Residence</Label>
                    <Input
                      id="residency_country"
                      value={formData.profile.residency_country || ''}
                      onChange={(e) => updateProfile('residency_country', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Upload ID Document</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Click to upload passport or national ID
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Upload Proof of Address</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Utility bill or bank statement (≤3 months)
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="legal_name">Legal Entity Name</Label>
                    <Input
                      id="legal_name"
                      value={formData.profile.legal_name || ''}
                      onChange={(e) => updateProfile('legal_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={formData.profile.registration_number || ''}
                      onChange={(e) => updateProfile('registration_number', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.profile.country || ''}
                      onChange={(e) => updateProfile('country', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Upload Company Registry</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Official company registration document
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="source_of_funds">Source of Funds</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="business_income">Business Income</SelectItem>
                    <SelectItem value="investment_returns">Investment Returns</SelectItem>
                    <SelectItem value="inheritance">Inheritance</SelectItem>
                    <SelectItem value="crypto_proceeds">Crypto Proceeds</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="source_of_wealth">Source of Wealth (Optional)</Label>
                <Textarea
                  id="source_of_wealth"
                  value={formData.profile.source_of_wealth || ''}
                  onChange={(e) => updateProfile('source_of_wealth', e.target.value)}
                  placeholder="Briefly describe..."
                />
              </div>
              <div>
                <Label htmlFor="tax_residency_country">Tax Residency Country</Label>
                <Input
                  id="tax_residency_country"
                  value={formData.profile.tax_residency_country || ''}
                  onChange={(e) => updateProfile('tax_residency_country', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tin">Tax Identification Number (Optional)</Label>
                <Input
                  id="tin"
                  value={formData.profile.tin || ''}
                  onChange={(e) => updateProfile('tin', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>AML Questions</Label>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="pep" />
                    <Label htmlFor="pep" className="font-normal text-sm">
                      I am not a Politically Exposed Person (PEP) or related to a PEP
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="sanctions" />
                    <Label htmlFor="sanctions" className="font-normal text-sm">
                      I am not aware of any sanctions or adverse media
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="own_funds" />
                    <Label htmlFor="own_funds" className="font-normal text-sm">
                      Funds will originate from my own account
                    </Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="iban">Bank Account IBAN</Label>
                <Input
                  id="iban"
                  value={formData.bankAccount?.iban || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount, iban: e.target.value },
                    })
                  }
                  placeholder="DE89370400440532013000"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox id="kyc_consent" required />
                  <Label htmlFor="kyc_consent" className="font-normal text-sm">
                    I consent to KYC/KYB verification and data processing
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="font-normal text-sm">
                    I agree to the Terms of Service
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="risk" required />
                  <Label htmlFor="risk" className="font-normal text-sm">
                    I acknowledge the investment risks and that this is a pilot program
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="electronic" required />
                  <Label htmlFor="electronic" className="font-normal text-sm">
                    I consent to electronic delivery of documents
                  </Label>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Your documents will be securely stored and hashed</li>
                  <li>Verification typically takes 1-2 business days</li>
                  <li>You'll receive email notifications about your status</li>
                  <li>All information is encrypted and GDPR compliant</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}