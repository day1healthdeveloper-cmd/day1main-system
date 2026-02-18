'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BenefitItem {
  name: string;
  limit: string;
  unlimited: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Basic Information
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [regime, setRegime] = useState<'insurance'>('insurance');

  // Pricing
  const [basePremium, setBasePremium] = useState('');
  const [childPremium, setChildPremium] = useState('');
  const [dependantPremium, setDependantPremium] = useState('');

  // Hospital Benefits
  const [hospitalCover, setHospitalCover] = useState('');
  const [hospitalUnlimited, setHospitalUnlimited] = useState(false);
  const [privateRoom, setPrivateRoom] = useState(false);
  const [privateRoomLimit, setPrivateRoomLimit] = useState('');

  // Ambulance Benefits
  const [ambulanceCover, setAmbulanceCover] = useState('');
  const [ambulanceUnlimited, setAmbulanceUnlimited] = useState(false);
  const [ambulanceTrips, setAmbulanceTrips] = useState('');

  // Additional Benefits
  const [benefits, setBenefits] = useState<BenefitItem[]>([
    { name: 'Maternity', limit: '', unlimited: false },
    { name: 'Cancer Cover', limit: '', unlimited: false },
    { name: 'Critical Illness', limit: '', unlimited: false },
    { name: 'Accident & Trauma', limit: '', unlimited: false },
    { name: 'Virtual Doctor', limit: '', unlimited: false },
    { name: 'Funeral Cover', limit: '', unlimited: false },
  ]);

  // Waiting Periods
  const [generalWaiting, setGeneralWaiting] = useState('3');
  const [maternityWaiting, setMaternityWaiting] = useState('12');
  const [preExistingWaiting, setPreExistingWaiting] = useState('12');

  // PMB Coverage
  const [pmbCovered, setPmbCovered] = useState(true);
  const [pmbLimit, setPmbLimit] = useState('');

  const handleBenefitChange = (index: number, field: 'limit' | 'unlimited', value: string | boolean) => {
    const newBenefits = [...benefits];
    if (field === 'unlimited') {
      newBenefits[index].unlimited = value as boolean;
      if (value) newBenefits[index].limit = '';
    } else {
      newBenefits[index].limit = value as string;
    }
    setBenefits(newBenefits);
  };

  const handleSave = async (status: 'draft' | 'pending_approval') => {
    setSaving(true);
    
    const productData = {
      // Basic Info
      name: productName,
      code: productCode,
      description,
      regime,
      status,
      
      // Pricing
      pricing: {
        base_premium: parseFloat(basePremium) || 0,
        child_premium: parseFloat(childPremium) || 0,
        dependant_premium: parseFloat(dependantPremium) || 0,
      },
      
      // Benefits
      benefits: {
        hospital: {
          cover_amount: hospitalUnlimited ? 'unlimited' : parseFloat(hospitalCover) || 0,
          private_room: privateRoom,
          private_room_limit: privateRoom ? (parseFloat(privateRoomLimit) || 0) : 0,
        },
        ambulance: {
          cover_amount: ambulanceUnlimited ? 'unlimited' : parseFloat(ambulanceCover) || 0,
          trips_per_year: parseInt(ambulanceTrips) || 0,
        },
        additional: benefits.map(b => ({
          name: b.name,
          limit: b.unlimited ? 'unlimited' : (parseFloat(b.limit) || 0),
        })),
        pmb: {
          covered: pmbCovered,
          limit: pmbLimit ? parseFloat(pmbLimit) : 'unlimited',
        },
      },
      
      // Waiting Periods
      waiting_periods: {
        general_months: parseInt(generalWaiting) || 0,
        maternity_months: parseInt(maternityWaiting) || 0,
        pre_existing_months: parseInt(preExistingWaiting) || 0,
      },
    };

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        alert('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
            <p className="text-gray-600 mt-1">Define a new insurance product with benefits and pricing</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Basic Information</CardTitle>
              <CardDescription>Enter the product name and basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Value Plus Hospital Plan"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="productCode">Product Code *</Label>
                <Input
                  id="productCode"
                  placeholder="e.g., VPH-001"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of the product"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label>Product Type</Label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mt-2">
                  <p className="text-sm text-blue-900">
                    <strong>Medical Insurance</strong> - Day1Health operates as a medical insurer regulated by the FSCA
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setStep(2)} disabled={!productName || !productCode}>
                  Next: Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Pricing Structure</CardTitle>
              <CardDescription>Set monthly premiums for different member types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePremium">Principal Member (Adult) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                    <Input
                      id="basePremium"
                      type="number"
                      className="pl-8"
                      placeholder="0.00"
                      value={basePremium}
                      onChange={(e) => setBasePremium(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dependantPremium">Adult Dependant</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                    <Input
                      id="dependantPremium"
                      type="number"
                      className="pl-8"
                      placeholder="0.00"
                      value={dependantPremium}
                      onChange={(e) => setDependantPremium(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="childPremium">Child (0-21 years)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                    <Input
                      id="childPremium"
                      type="number"
                      className="pl-8"
                      placeholder="0.00"
                      value={childPremium}
                      onChange={(e) => setChildPremium(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>Example Family:</strong> 2 Adults + 2 Children = R{((parseFloat(basePremium) || 0) + (parseFloat(dependantPremium) || 0) + (parseFloat(childPremium) || 0) * 2).toFixed(2)} per month
                </p>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!basePremium}>
                  Next: Benefits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Benefits */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Benefit Structure</CardTitle>
              <CardDescription>Define what the product covers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hospital Benefits */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Hospital Cover</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hospitalUnlimited}
                        onChange={(e) => setHospitalUnlimited(e.target.checked)}
                      />
                      Unlimited Hospital Cover
                    </label>
                  </div>
                  {!hospitalUnlimited && (
                    <div>
                      <Label>Annual Hospital Limit</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={hospitalCover}
                          onChange={(e) => setHospitalCover(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={privateRoom}
                        onChange={(e) => setPrivateRoom(e.target.checked)}
                      />
                      Private Room in Hospital
                    </label>
                  </div>
                  {privateRoom && (
                    <div>
                      <Label>Private Room Daily Limit</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={privateRoomLimit}
                          onChange={(e) => setPrivateRoomLimit(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ambulance Benefits */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Ambulance Cover</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={ambulanceUnlimited}
                        onChange={(e) => setAmbulanceUnlimited(e.target.checked)}
                      />
                      Unlimited Ambulance Cover
                    </label>
                  </div>
                  {!ambulanceUnlimited && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Per Trip Limit</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                          <Input
                            type="number"
                            className="pl-8"
                            placeholder="0.00"
                            value={ambulanceCover}
                            onChange={(e) => setAmbulanceCover(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Trips Per Year</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={ambulanceTrips}
                          onChange={(e) => setAmbulanceTrips(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Benefits */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Additional Benefits</h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-40">
                        <Label>{benefit.name}</Label>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={benefit.unlimited}
                          onChange={(e) => handleBenefitChange(index, 'unlimited', e.target.checked)}
                        />
                        Unlimited
                      </label>
                      {!benefit.unlimited && (
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                          <Input
                            type="number"
                            className="pl-8"
                            placeholder="0.00"
                            value={benefit.limit}
                            onChange={(e) => handleBenefitChange(index, 'limit', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PMB Coverage */}
              <div>
                <h3 className="font-semibold mb-3">Prescribed Minimum Benefits (PMB)</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-900">
                      <strong>Note:</strong> PMB coverage is optional for medical insurers. Medical schemes are required to cover PMBs, but as a medical insurer, you can choose whether to include PMB coverage in your products.
                    </p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pmbCovered}
                      onChange={(e) => setPmbCovered(e.target.checked)}
                    />
                    Include PMB Coverage (Optional)
                  </label>
                  {pmbCovered && (
                    <div>
                      <Label>PMB Annual Limit (leave empty for unlimited)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="Unlimited"
                          value={pmbLimit}
                          onChange={(e) => setPmbLimit(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>
                  Next: Waiting Periods
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Waiting Periods & Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Waiting Periods & Review</CardTitle>
              <CardDescription>Set waiting periods and review the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="generalWaiting">General Waiting Period (months)</Label>
                  <Input
                    id="generalWaiting"
                    type="number"
                    value={generalWaiting}
                    onChange={(e) => setGeneralWaiting(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="maternityWaiting">Maternity Waiting Period (months)</Label>
                  <Input
                    id="maternityWaiting"
                    type="number"
                    value={maternityWaiting}
                    onChange={(e) => setMaternityWaiting(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="preExistingWaiting">Pre-Existing Conditions (months)</Label>
                  <Input
                    id="preExistingWaiting"
                    type="number"
                    value={preExistingWaiting}
                    onChange={(e) => setPreExistingWaiting(e.target.value)}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border rounded-lg p-4 mt-6">
                <h3 className="font-semibold mb-3">Product Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {productName}</p>
                  <p><strong>Code:</strong> {productCode}</p>
                  <p><strong>Base Premium:</strong> R{basePremium}/month</p>
                  <p><strong>Hospital:</strong> {hospitalUnlimited ? 'Unlimited' : `R${hospitalCover}`}</p>
                  <p><strong>Ambulance:</strong> {ambulanceUnlimited ? 'Unlimited' : `R${ambulanceCover} per trip, ${ambulanceTrips} trips/year`}</p>
                  <p><strong>PMB:</strong> {pmbCovered ? 'Covered' : 'Not Covered'}</p>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSave('pending_approval')}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Submit for Approval'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
