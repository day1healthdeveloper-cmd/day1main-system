'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PaymentGroup {
  id: string;
  group_code: string;
  group_name: string;
  group_type: string;
  company_name: string;
  company_registration?: string;
  vat_number?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  bank_name?: string;
  account_number?: string;
  branch_code?: string;
  account_holder_name?: string;
  account_type?: string;
  collection_method: string;
  collection_day?: number;
  collection_frequency: string;
  status: string;
  total_members: number;
  total_monthly_premium: number;
  notes?: string;
}

export default function GroupSetupPage() {
  const [groups, setGroups] = useState<PaymentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PaymentGroup | null>(null);
  const [formData, setFormData] = useState<Partial<PaymentGroup>>({
    group_type: 'debit_order_group',
    collection_method: 'group_debit_order',
    collection_frequency: 'monthly',
    status: 'active',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/admin/payment-groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingGroup 
        ? `/api/admin/payment-groups/${editingGroup.id}`
        : '/api/admin/payment-groups';
      
      const response = await fetch(url, {
        method: editingGroup ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchGroups();
        setShowForm(false);
        setEditingGroup(null);
        setFormData({
          group_type: 'debit_order_group',
          collection_method: 'group_debit_order',
          collection_frequency: 'monthly',
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleEdit = (group: PaymentGroup) => {
    setEditingGroup(group);
    setFormData(group);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const response = await fetch(`/api/admin/payment-groups/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Group Setup</h1>
          <p className="text-gray-600 mt-1">Configure payment groups and company information</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add New Group
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</CardTitle>
            <CardDescription>Configure company group details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Group Code *</Label>
                  <Input
                    required
                    value={formData.group_code || ''}
                    onChange={(e) => setFormData({ ...formData, group_code: e.target.value })}
                    placeholder="e.g., DAY1-GRP01"
                  />
                </div>
                <div>
                  <Label>Group Name *</Label>
                  <Input
                    required
                    value={formData.group_name || ''}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    placeholder="e.g., Day1 Health Group 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Group Type *</Label>
                  <Select
                    value={formData.group_type}
                    onValueChange={(value) => setFormData({ ...formData, group_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit_order_group">Debit Order Group</SelectItem>
                      <SelectItem value="eft_group">EFT Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Collection Method *</Label>
                  <Select
                    value={formData.collection_method}
                    onValueChange={(value) => setFormData({ ...formData, collection_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group_debit_order">Group Debit Order</SelectItem>
                      <SelectItem value="individual_eft">Individual EFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    required
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={formData.company_registration || ''}
                    onChange={(e) => setFormData({ ...formData, company_registration: e.target.value })}
                  />
                </div>
                <div>
                  <Label>VAT Number</Label>
                  <Input
                    value={formData.vat_number || ''}
                    onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              {formData.collection_method === 'group_debit_order' && (
                <>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={formData.bank_name || ''}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        value={formData.account_number || ''}
                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Branch Code</Label>
                      <Input
                        value={formData.branch_code || ''}
                        onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Account Holder</Label>
                      <Input
                        value={formData.account_holder_name || ''}
                        onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Collection Day</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.collection_day || ''}
                    onChange={(e) => setFormData({ ...formData, collection_day: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Collection Frequency</Label>
                  <Select
                    value={formData.collection_frequency}
                    onValueChange={(value) => setFormData({ ...formData, collection_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Group</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGroup(null);
                    setFormData({
                      group_type: 'debit_order_group',
                      collection_method: 'group_debit_order',
                      collection_frequency: 'monthly',
                      status: 'active',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{group.group_name}</CardTitle>
                  <CardDescription>
                    {group.company_name} • {group.group_code}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(group)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(group.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{group.group_type === 'debit_order_group' ? 'Debit Order' : 'EFT'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Collection Method</p>
                  <p className="font-medium">{group.collection_method === 'group_debit_order' ? 'Group Debit Order' : 'Individual EFT'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Members</p>
                  <p className="font-medium">{group.total_members}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Premium</p>
                  <p className="font-medium">R{group.total_monthly_premium.toFixed(2)}</p>
                </div>
              </div>
              {group.bank_name && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Banking Details</p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Bank</p>
                      <p className="font-medium">{group.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Account</p>
                      <p className="font-medium">{group.account_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Branch</p>
                      <p className="font-medium">{group.branch_code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Collection Day</p>
                      <p className="font-medium">Day {group.collection_day}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
