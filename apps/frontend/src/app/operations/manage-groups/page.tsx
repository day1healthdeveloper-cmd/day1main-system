'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  monthly_premium: number;
  payment_group_id?: string;
  collection_method: string;
}

export default function ManageGroupsPage() {
  const [groups, setGroups] = useState<PaymentGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PaymentGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id);
      fetchAvailableMembers();
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

  const fetchAvailableMembers = async () => {
    try {
      const response = await fetch('/api/operations/members?no_group=true');
      if (response.ok) {
        const data = await response.json();
        setAvailableMembers(data);
      }
    } catch (error) {
      console.error('Error fetching available members:', error);
    }
  };

  const addMemberToGroup = async (memberId: string) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`/api/operations/payment-groups/${selectedGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId }),
      });

      if (response.ok) {
        await fetchGroupMembers(selectedGroup.id);
        await fetchAvailableMembers();
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error adding member to group:', error);
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
        await fetchAvailableMembers();
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error removing member from group:', error);
    }
  };

  const sendEFTNotifications = async (groupId: string) => {
    if (!confirm('Send EFT payment notifications to all members in this group?')) return;

    try {
      const response = await fetch(`/api/operations/payment-groups/${groupId}/notify`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Notifications sent successfully!');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const filteredMembers = availableMembers.filter(
    (member) =>
      member.member_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Groups</h1>
        <p className="text-gray-600 mt-1">Daily operations and member management for payment groups</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Member Management</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="notifications">EFT Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGroup(group)}
                      >
                        Manage Members
                      </Button>
                      {group.collection_method === 'individual_eft' && (
                        <Button
                          size="sm"
                          onClick={() => sendEFTNotifications(group.id)}
                        >
                          Send Notifications
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium">
                        {group.group_type === 'debit_order_group' ? 'Debit Order' : 'EFT'}
                      </p>
                    </div>
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
          {selectedGroup ? (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Group Members ({groupMembers.length})</CardTitle>
                  <CardDescription>{selectedGroup.group_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.member_number} • R{member.monthly_premium}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMemberFromGroup(member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Members</CardTitle>
                  <CardDescription>Members not assigned to any group</CardDescription>
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.member_number} • R{member.monthly_premium}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addMemberToGroup(member.id)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Select a group from the Overview tab to manage members
              </CardContent>
            </Card>
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
              <CardTitle>EFT Payment Notifications</CardTitle>
              <CardDescription>Send and track EFT payment reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Notification management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
