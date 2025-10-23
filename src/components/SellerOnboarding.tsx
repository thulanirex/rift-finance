import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Upload, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Business Profile', 'Beneficial Owners', 'Documents', 'Review & Submit'];

export function SellerOnboarding() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [organization, setOrganization] = useState({
    legal_name: '',
    trading_name: '',
    legal_form: '',
    registration_number: '',
    registration_country: '',
    date_of_incorporation: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: '',
    website: '',
    email: '',
    phone: '',
    vat_number: '',
    eori_number: '',
    iban: '',
  });

  const [beneficialOwners, setBeneficialOwners] = useState<any[]>([
    {
      first_name: '',
      last_name: '',
      dob: '',
      nationality: '',
      country_of_residence: '',
      role: 'ubo',
    },
  ]);

  const [orgDocuments, setOrgDocuments] = useState<any[]>([]);
  const [consents, setConsents] = useState({
    accurate: false,
    gdpr: false,
  });

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create organization in MySQL backend
      console.log('Creating organization:', organization.legal_name);
      
      const orgData = await apiClient.organizations.create({
        name: organization.legal_name,
        type: 'seller',
        registration_number: organization.registration_number,
        country: organization.registration_country,
      });
      
      console.log('✅ Organization created:', orgData.id);
      
      // Update user with org_id
      await apiClient.users.update(user.id, {
        orgId: orgData.id,
      });
      
      console.log('✅ User updated with org_id');
      
      toast({
        title: 'Onboarding Completed',
        description: 'Your organization has been created successfully',
      });

      // Refresh user data to get new org_id
      await refreshUser();
      
      navigate('/dashboard/seller?kyb=submitted');
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBeneficialOwner = () => {
    setBeneficialOwners([
      ...beneficialOwners,
      {
        first_name: '',
        last_name: '',
        dob: '',
        nationality: '',
        country_of_residence: '',
        role: 'ubo',
      },
    ]);
  };

  const removeBeneficialOwner = (index: number) => {
    setBeneficialOwners(beneficialOwners.filter((_, i) => i !== index));
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Seller Verification</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legal_name">Legal Name *</Label>
                  <Input
                    id="legal_name"
                    value={organization.legal_name}
                    onChange={(e) =>
                      setOrganization({ ...organization, legal_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="trading_name">Trading Name</Label>
                  <Input
                    id="trading_name"
                    value={organization.trading_name}
                    onChange={(e) =>
                      setOrganization({ ...organization, trading_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legal_form">Legal Form *</Label>
                  <Select
                    value={organization.legal_form}
                    onValueChange={(value) =>
                      setOrganization({ ...organization, legal_form: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ltd">Limited Company (Ltd)</SelectItem>
                      <SelectItem value="llp">Limited Liability Partnership (LLP)</SelectItem>
                      <SelectItem value="plc">Public Limited Company (PLC)</SelectItem>
                      <SelectItem value="sole_prop">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registration_number">Registration Number *</Label>
                  <Input
                    id="registration_number"
                    value={organization.registration_number}
                    onChange={(e) =>
                      setOrganization({ ...organization, registration_number: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="registration_country">Registration Country *</Label>
                  <Input
                    id="registration_country"
                    value={organization.registration_country}
                    onChange={(e) =>
                      setOrganization({ ...organization, registration_country: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_incorporation">Date of Incorporation *</Label>
                  <Input
                    id="date_of_incorporation"
                    type="date"
                    value={organization.date_of_incorporation}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        date_of_incorporation: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vat_number">VAT Number</Label>
                  <Input
                    id="vat_number"
                    value={organization.vat_number}
                    onChange={(e) =>
                      setOrganization({ ...organization, vat_number: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Registered Address *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    placeholder="Address Line 1"
                    value={organization.address_line1}
                    onChange={(e) =>
                      setOrganization({ ...organization, address_line1: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Address Line 2"
                    value={organization.address_line2}
                    onChange={(e) =>
                      setOrganization({ ...organization, address_line2: e.target.value })
                    }
                  />
                  <Input
                    placeholder="City"
                    value={organization.city}
                    onChange={(e) =>
                      setOrganization({ ...organization, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Postal Code"
                    value={organization.postal_code}
                    onChange={(e) =>
                      setOrganization({ ...organization, postal_code: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Country"
                    value={organization.country}
                    onChange={(e) =>
                      setOrganization({ ...organization, country: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={organization.email}
                    onChange={(e) =>
                      setOrganization({ ...organization, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={organization.phone}
                    onChange={(e) =>
                      setOrganization({ ...organization, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Beneficial Owners / Directors</Label>
                <Button size="sm" onClick={addBeneficialOwner}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Person
                </Button>
              </div>
              {beneficialOwners.map((owner, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">Person {index + 1}</CardTitle>
                      {beneficialOwners.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBeneficialOwner(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>First Name *</Label>
                        <Input
                          value={owner.first_name}
                          onChange={(e) => {
                            const updated = [...beneficialOwners];
                            updated[index].first_name = e.target.value;
                            setBeneficialOwners(updated);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input
                          value={owner.last_name}
                          onChange={(e) => {
                            const updated = [...beneficialOwners];
                            updated[index].last_name = e.target.value;
                            setBeneficialOwners(updated);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Date of Birth *</Label>
                        <Input
                          type="date"
                          value={owner.dob}
                          onChange={(e) => {
                            const updated = [...beneficialOwners];
                            updated[index].dob = e.target.value;
                            setBeneficialOwners(updated);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <Label>Nationality *</Label>
                        <Input
                          value={owner.nationality}
                          onChange={(e) => {
                            const updated = [...beneficialOwners];
                            updated[index].nationality = e.target.value;
                            setBeneficialOwners(updated);
                          }}
                          required
                        />
                      </div>
                      <div>
                        <Label>Residence *</Label>
                        <Input
                          value={owner.country_of_residence}
                          onChange={(e) => {
                            const updated = [...beneficialOwners];
                            updated[index].country_of_residence = e.target.value;
                            setBeneficialOwners(updated);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <Select
                        value={owner.role}
                        onValueChange={(value) => {
                          const updated = [...beneficialOwners];
                          updated[index].role = value;
                          setBeneficialOwners(updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ubo">Ultimate Beneficial Owner</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="signatory">Authorized Signatory</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-3 text-center">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload ID + Proof of Address
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Company Documents *</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'certificate_of_incorporation', label: 'Certificate of Incorporation' },
                  { type: 'shareholders_register', label: 'Shareholders Register' },
                  { type: 'directors_register', label: 'Directors Register' },
                  { type: 'vat_certificate', label: 'VAT Certificate' },
                  { type: 'utility_bill', label: 'Utility Bill' },
                  { type: 'bank_statement', label: 'Bank Statement' },
                ].map((doc) => (
                  <div key={doc.type} className="border-2 border-dashed rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">{doc.label}</p>
                    <div className="text-center">
                      <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                * Required: Certificate of Incorporation, Shareholders Register, Proof of Address
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h3 className="font-semibold">Summary</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Company:</strong> {organization.legal_name}</p>
                  <p><strong>Registration:</strong> {organization.registration_number}</p>
                  <p><strong>Country:</strong> {organization.registration_country}</p>
                  <p><strong>Beneficial Owners:</strong> {beneficialOwners.length}</p>
                  <p><strong>Documents:</strong> {orgDocuments.length} uploaded</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="accurate"
                    checked={consents.accurate}
                    onCheckedChange={(checked) =>
                      setConsents({ ...consents, accurate: !!checked })
                    }
                    required
                  />
                  <Label htmlFor="accurate" className="font-normal text-sm">
                    I confirm that all information provided is accurate and complete
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="gdpr"
                    checked={consents.gdpr}
                    onCheckedChange={(checked) =>
                      setConsents({ ...consents, gdpr: !!checked })
                    }
                    required
                  />
                  <Label htmlFor="gdpr" className="font-normal text-sm">
                    I consent to data processing as per GDPR regulations
                  </Label>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Your documents will be securely stored and verified</li>
                  <li>Automated compliance checks will run (VAT, sanctions, etc.)</li>
                  <li>An operator will review your application within 1-2 business days</li>
                  <li>You'll receive email updates about your status</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !consents.accurate || !consents.gdpr}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}