'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';

interface PaymentGroup {
  id: string;
  group_code: string;
  group_name: string;
  group_type: string;
  company_name: string;
  collection_method: string;
  collection_day?: number;
  status: string;
  total_members: number;
  total_monthly_premium: number;
}

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  id_number?: string;
  date_of_birth?: string;
  monthly_premium: number;
  employee_number?: string;
  payment_group_id?: string;
  collection_method: string;
  phone?: string;
  email?: string;
}


export default function ManageGroupsPage() {
  const { addToast } = useToast();
  const [groups, setGroups] = useState<PaymentGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PaymentGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    member_number: '',
    first_name: '',
    last_name: '',
    id_number: '',
    commence_date: '',
    monthly_premium: '',
    employee_number: '',
    phone: '',
    email: '',
  });

  const getNextCollectionDate = (collectionDates: string[] | null | undefined): string => {
    if (!collectionDates || collectionDates.length !== 12) {
      return 'N/A';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter out empty dates and convert to Date objects with their month index
    const validDates = collectionDates
      .map((dateStr, monthIndex) => {
        if (!dateStr || dateStr === '') return null;
        const date = new Date(dateStr);
        return { date, monthIndex };
      })
      .filter(item => item !== null) as { date: Date; monthIndex: number }[];

    if (validDates.length === 0) {
      return 'N/A';
    }

    // Find the next date that's today or in the future
    const nextDate = validDates.find(item => item.date >= today);
    
    if (nextDate) {
      return nextDate.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }

    // If all dates have passed this year, return the first date of next year
    const firstDate = validDates[0];
    const nextYearDate = new Date(firstDate.date);
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    
    return nextYearDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/operations/payment-groups');
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

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/operations/payment-groups/${groupId}/members`);
      if (response.ok) {
        const data = await response.json();
        setGroupMembers(data);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const createAndAddMember = async () => {
    if (!selectedGroup) return;
    
    try {
      const url = editingMember 
        ? `/api/operations/members/${editingMember.id}`
        : '/api/operations/members';
      
      const method = editingMember ? 'PUT' : 'POST';

      const createResponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMemberData,
          monthly_premium: parseFloat(newMemberData.monthly_premium),
          payment_group_id: selectedGroup.id,
          collection_method: selectedGroup.collection_method,
        }),
      });

      if (createResponse.ok) {
        setShowAddMemberForm(false);
        setEditingMember(null);
        setNewMemberData({
          member_number: '',
          first_name: '',
          last_name: '',
          id_number: '',
          commence_date: '',
          monthly_premium: '',
          employee_number: '',
        });
        await fetchGroupMembers(selectedGroup.id);
        await fetchGroups();
        addToast({
          title: 'Success!',
          description: editingMember ? 'Member updated successfully.' : 'Member added successfully to the group.',
          type: 'success',
        });
      } else {
        const errorData = await createResponse.json();
        addToast({
          title: 'Error',
          description: errorData.details || errorData.error || 'Failed to save member',
          type: 'error',
          duration: 5000,
        });
        console.error('Full error:', errorData);
      }
    } catch (error) {
      console.error('Error saving member:', error);
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        type: 'error',
      });
    }
  };

  const removeMemberFromGroup = async (memberId: string) => {
    if (!selectedGroup) return;
    if (!confirm('Remove this member from the group?')) return;

    try {
      const response = await fetch(`/api/operations/payment-groups/${selectedGroup.id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGroupMembers(selectedGroup.id);
        await fetchGroups();
        addToast({
          title: 'Member Removed',
          description: 'Member has been removed from the group.',
          type: 'success',
        });
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to remove member from group',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error removing member from group:', error);
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        type: 'error',
      });
    }
  };

  const sendEFTNotifications = async (groupId: string) => {
    if (!confirm('Send EFT payment notifications to all members in this group?')) return;

    try {
      const response = await fetch(`/api/operations/payment-groups/${groupId}/notify`, {
        method: 'POST',
      });

      if (response.ok) {
        addToast({
          title: 'Notifications Sent',
          description: 'EFT payment notifications have been sent to all group members.',
          type: 'success',
        });
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to send notifications',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        type: 'error',
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedGroup) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('groupId', selectedGroup.id);
      formData.append('collectionMethod', selectedGroup.collection_method);

      const response = await fetch('/api/operations/members/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        addToast({
          title: 'Upload Successful',
          description: `${result.inserted} members uploaded successfully${result.errors ? `. ${result.errors.length} rows had errors.` : ''}`,
          type: 'success',
          duration: 5000,
        });
        await fetchGroupMembers(selectedGroup.id);
        await fetchGroups();
      } else {
        addToast({
          title: 'Upload Failed',
          description: result.details || result.error || 'Failed to upload members',
          type: 'error',
          duration: 7000,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred during upload',
        type: 'error',
      });
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (filterMethod === 'all') return true;
    return group.collection_method === filterMethod;
  });

  const searchFilteredGroups = filteredGroups.filter((group) => {
    if (!groupSearchTerm) return true;
    return group.group_name.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
           group.company_name.toLowerCase().includes(groupSearchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <SidebarLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Groups ({groups.length})</h1>
          <p className="text-gray-600 mt-1">Daily operations and member management for payment groups</p>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant={filterMethod === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterMethod('all')}
          >
            All Groups ({groups.length})
          </Button>
          <Button
            variant={filterMethod === 'group_debit_order' ? 'default' : 'outline'}
            onClick={() => setFilterMethod('group_debit_order')}
          >
            Group Debit Order ({groups.filter(g => g.collection_method === 'group_debit_order').length})
          </Button>
          <Button
            variant={filterMethod === 'individual_eft' ? 'default' : 'outline'}
            onClick={() => setFilterMethod('individual_eft')}
          >
            Individual EFT ({groups.filter(g => g.collection_method === 'individual_eft').length})
          </Button>
        </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Member Management</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          {filterMethod !== 'group_debit_order' && (
            <TabsTrigger value="notifications">EFT POP Verification</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {searchFilteredGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.group_name}</CardTitle>
                  <CardDescription>{group.company_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Collection Method</p>
                      <p className="font-medium">
                        {group.collection_method === 'group_debit_order'
                          ? 'Group Debit Order'
                          : 'Individual EFT'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Members</p>
                      <p className="font-medium">{group.total_members}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Premium</p>
                      <p className="font-medium">R{group.total_monthly_premium.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Collection Day</p>
                      {group.collection_method === 'group_debit_order' ? (
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-blue-600">
                            {getNextCollectionDate((group as any).collection_dates)}
                          </p>
                          <button
                            onClick={() => window.location.href = `/operations/collection-calendar?group=${group.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            📅 Manage Dates
                          </button>
                        </div>
                      ) : (
                        <p className="font-medium">Day {group.collection_day || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium capitalize">{group.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {!selectedGroup ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Select a Group
                  {searchFilteredGroups.length > 0 && (
                    <span className="text-gray-500 font-normal text-base ml-2">
                      • Total Members: {searchFilteredGroups.reduce((sum, g) => sum + g.total_members, 0)}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Choose a group to manage members</CardDescription>
                <div className="mt-4">
                  <Input
                    placeholder="Search groups by name..."
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {searchFilteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{group.group_name}</p>
                        <p className="text-sm text-gray-500">
                          {group.collection_method === 'group_debit_order'
                            ? 'Group Debit Order'
                            : 'Individual EFT'} • {group.total_members} members
                          {group.collection_method === 'group_debit_order' && (
                            <span className="font-semibold text-gray-700"> • Total: R{group.total_monthly_premium.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedGroup(group)}
                        >
                          View Members
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedGroup.group_name}</h2>
                  <p className="text-gray-600">
                    {selectedGroup.collection_method === 'group_debit_order'
                      ? 'Group Debit Order'
                      : 'Individual EFT'} • {groupMembers.length} members
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedGroup(null);
                      setShowAddMemberForm(false);
                      setGroupSearchTerm('');
                    }}
                  >
                    ← Back to Groups
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Group Members ({groupMembers.length})</CardTitle>
                      <CardDescription>Current members in this group</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleBulkUpload}
                          className="hidden"
                          id="bulk-upload-input"
                          disabled={uploadingFile}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('bulk-upload-input')?.click()}
                          disabled={uploadingFile}
                        >
                          {uploadingFile ? 'Uploading...' : '📤 Bulk Upload Excel'}
                        </Button>
                      </div>
                      <Button onClick={() => setShowAddMemberForm(!showAddMemberForm)}>
                        {showAddMemberForm ? 'Cancel' : '+ Add New Member'}
                      </Button>
                    </div>
                  </div>
                  
                  {showAddMemberForm && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                      <h3 className="font-medium mb-4">
                        {editingMember ? `Edit Member: ${editingMember.first_name} ${editingMember.last_name}` : `Add New Member to ${selectedGroup.group_name}`}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Member Number *</Label>
                          <Input
                            value={newMemberData.member_number}
                            onChange={(e) => setNewMemberData({...newMemberData, member_number: e.target.value})}
                            placeholder="e.g., DAY17010275"
                          />
                        </div>
                        <div>
                          <Label>First Name *</Label>
                          <Input
                            value={newMemberData.first_name}
                            onChange={(e) => setNewMemberData({...newMemberData, first_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Last Name *</Label>
                          <Input
                            value={newMemberData.last_name}
                            onChange={(e) => setNewMemberData({...newMemberData, last_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>ID Number *</Label>
                          <Input
                            value={newMemberData.id_number}
                            onChange={(e) => setNewMemberData({...newMemberData, id_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            value={(newMemberData as any).phone || ''}
                            onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value} as any)}
                            placeholder="e.g., 0821234567"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={(newMemberData as any).email || ''}
                            onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value} as any)}
                            placeholder="e.g., member@example.com"
                          />
                        </div>
                        <div>
                          <Label>Commence Date *</Label>
                          <Input
                            type="date"
                            value={newMemberData.commence_date}
                            onChange={(e) => setNewMemberData({...newMemberData, commence_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Monthly Premium *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={newMemberData.monthly_premium}
                            onChange={(e) => setNewMemberData({...newMemberData, monthly_premium: e.target.value})}
                            placeholder="e.g., 1796.00"
                          />
                        </div>
                        <div>
                          <Label>Employee Number</Label>
                          <Input
                            value={newMemberData.employee_number}
                            onChange={(e) => setNewMemberData({...newMemberData, employee_number: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={createAndAddMember}>
                          {editingMember ? 'Update Member' : 'Save Member'}
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowAddMemberForm(false);
                          setEditingMember(null);
                          setNewMemberData({
                            member_number: '',
                            first_name: '',
                            last_name: '',
                            id_number: '',
                            commence_date: '',
                            monthly_premium: '',
                            employee_number: '',
                          });
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {groupMembers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 text-sm font-medium">Member Number</th>
                            <th className="text-left p-3 text-sm font-medium">Name</th>
                            <th className="text-left p-3 text-sm font-medium">Surname</th>
                            <th className="text-left p-3 text-sm font-medium">ID Number</th>
                            <th className="text-left p-3 text-sm font-medium">Phone</th>
                            <th className="text-left p-3 text-sm font-medium">Email</th>
                            <th className="text-left p-3 text-sm font-medium">Commence Date</th>
                            <th className="text-left p-3 text-sm font-medium">Premium</th>
                            <th className="text-left p-3 text-sm font-medium">Employee Nr</th>
                            <th className="text-left p-3 text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupMembers.map((member) => (
                            <tr key={member.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 text-sm">{member.member_number}</td>
                              <td className="p-3 text-sm">{member.first_name}</td>
                              <td className="p-3 text-sm">{member.last_name}</td>
                              <td className="p-3 text-sm">{member.id_number || '-'}</td>
                              <td className="p-3 text-sm">{member.phone || '-'}</td>
                              <td className="p-3 text-sm">{member.email || '-'}</td>
                              <td className="p-3 text-sm">{member.date_of_birth || '-'}</td>
                              <td className="p-3 text-sm">R{member.monthly_premium}</td>
                              <td className="p-3 text-sm">{member.employee_number || '-'}</td>
                              <td className="p-3 text-sm">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMember(member);
                                      setNewMemberData({
                                        member_number: member.member_number,
                                        first_name: member.first_name,
                                        last_name: member.last_name,
                                        id_number: member.id_number || '',
                                        commence_date: member.date_of_birth || '',
                                        monthly_premium: member.monthly_premium.toString(),
                                        employee_number: member.employee_number || '',
                                      });
                                      setShowAddMemberForm(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeMemberFromGroup(member.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No members in this group yet.</p>
                      <p className="text-sm mt-1">Click "Add New Member" to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Group payment transactions and history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Payment history coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>
                EFT Payment Notifications 
                {searchFilteredGroups.filter(g => g.collection_method === 'individual_eft').length > 0 && (
                  <span className="text-gray-500 font-normal text-base ml-2">
                    • Total Members: {searchFilteredGroups
                      .filter(g => g.collection_method === 'individual_eft')
                      .reduce((sum, g) => sum + g.total_members, 0)}
                  </span>
                )}
              </CardTitle>
              <CardDescription>Send and track EFT payment reminders</CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search groups by name..."
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {searchFilteredGroups
                  .filter(g => g.collection_method === 'individual_eft')
                  .map((group) => (
                    <div
                      key={group.id}
                      className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{group.group_name}</p>
                        <p className="text-sm text-gray-500">
                          {group.total_members} members • R{group.total_monthly_premium.toFixed(2)} total premium
                        </p>
                      </div>
                    </div>
                  ))}
                {searchFilteredGroups.filter(g => g.collection_method === 'individual_eft').length === 0 && (
                  <p className="text-gray-500 text-center py-8">No EFT groups found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </SidebarLayout>
  );
}
