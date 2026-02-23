'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface PaymentGroup {
  id: string;
  group_name: string;
  company_name: string;
  total_members: number;
  total_monthly_premium: number;
  collection_dates?: string[];
}

export default function CollectionCalendarPage() {
  const { addToast } = useToast();
  const [groups, setGroups] = useState<PaymentGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PaymentGroup | null>(null);
  const [collectionDates, setCollectionDates] = useState<string[]>(Array(12).fill(''));
  const [loading, setLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());
  const [applyToAllFlags, setApplyToAllFlags] = useState<boolean[]>(Array(12).fill(false));

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Check if group ID is in URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('group');
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        handleGroupSelect(group);
      }
    }
  }, [groups]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/operations/payment-groups');
      if (response.ok) {
        const data = await response.json();
        const debitOrderGroups = data.filter((g: any) => g.collection_method === 'group_debit_order');
        setGroups(debitOrderGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (group: PaymentGroup) => {
    setSelectedGroup(group);
    // Always fetch fresh data from the API
    try {
      const response = await fetch(`/api/operations/payment-groups/${group.id}/collection-dates`);
      if (response.ok) {
        const { collection_dates } = await response.json();
        setCollectionDates(collection_dates && collection_dates.length > 0 ? collection_dates : Array(12).fill(''));
      } else {
        setCollectionDates(Array(12).fill(''));
      }
    } catch (error) {
      console.error('Error fetching collection dates:', error);
      setCollectionDates(Array(12).fill(''));
    }
  };

  const handleDateChange = (monthIndex: number, date: string) => {
    const newDates = [...collectionDates];
    newDates[monthIndex] = date;
    setCollectionDates(newDates);
  };

  const handleSaveDates = async () => {
    if (!selectedGroup) return;

    // Check if we have any dates to apply to all groups
    const monthsToApply = applyToAllFlags
      .map((flag, index) => flag ? index : -1)
      .filter(index => index !== -1);

    // If applying to all groups, validate those specific months have dates
    if (monthsToApply.length > 0) {
      const missingApplyToAllDates = monthsToApply.filter(monthIndex => !collectionDates[monthIndex]);
      if (missingApplyToAllDates.length > 0) {
        addToast({
          title: 'Missing Dates',
          description: `Please set dates for all months marked "Apply to all"`,
          type: 'error',
        });
        return;
      }
    }

    try {
      // First save dates for the current group
      const response = await fetch(`/api/operations/payment-groups/${selectedGroup.id}/collection-dates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_dates: collectionDates }),
      });

      if (!response.ok) {
        addToast({
          title: 'Error',
          description: 'Failed to save collection dates',
          type: 'error',
        });
        return;
      }

      // Then apply to all groups for months where checkbox is checked
      if (monthsToApply.length > 0) {
        let successCount = 0;
        let errorCount = 0;

        for (const group of groups) {
          if (group.id === selectedGroup.id) continue; // Skip current group

          // Fetch existing dates for this group
          const fetchResponse = await fetch(`/api/operations/payment-groups/${group.id}/collection-dates`);
          const { collection_dates } = await fetchResponse.json();
          
          // Update only the months with checkbox checked
          const updatedDates = [...(collection_dates || Array(12).fill(''))];
          monthsToApply.forEach(monthIndex => {
            updatedDates[monthIndex] = collectionDates[monthIndex];
          });

          // Save updated dates
          const saveResponse = await fetch(`/api/operations/payment-groups/${group.id}/collection-dates`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collection_dates: updatedDates }),
          });

          if (saveResponse.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        addToast({
          title: 'Dates Saved',
          description: `Saved for ${selectedGroup.group_name} and applied to ${successCount} other group${successCount !== 1 ? 's' : ''}`,
          type: 'success',
          duration: 5000,
        });
      } else {
        addToast({
          title: 'Dates Saved',
          description: `Collection dates for ${selectedGroup.group_name} have been saved.`,
          type: 'success',
        });
      }

      await fetchGroups();
      // Reset apply to all flags
      setApplyToAllFlags(Array(12).fill(false));
    } catch (error) {
      console.error('Error saving dates:', error);
      addToast({
        title: 'Error',
        description: 'An unexpected error occurred',
        type: 'error',
      });
    }
  };

  const toggleApplyToAll = (monthIndex: number) => {
    const newFlags = [...applyToAllFlags];
    newFlags[monthIndex] = !newFlags[monthIndex];
    setApplyToAllFlags(newFlags);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const renderMonthCalendar = (monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthIndex, currentYear);
    const firstDay = getFirstDayOfMonth(monthIndex, currentYear);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, monthIndex, day);
      const dateString = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = collectionDates[monthIndex] === dateString;
      const isWeekendDay = isWeekend(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateChange(monthIndex, dateString)}
          className={`h-8 text-sm rounded transition-all ${
            isSelected
              ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400'
              : isWeekendDay
              ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              : 'hover:bg-blue-50 hover:border-blue-300 border border-transparent'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collection Dates Calendar</h1>
            <p className="text-gray-600 mt-2">Set 12 collection dates per year for each Group Debit Order group</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/operations/manage-groups'}
          >
            ← Back to Group Debits
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Group Debit Order Groups</CardTitle>
              <CardDescription>Select a group to manage collection dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{group.group_name}</p>
                    <p className="text-sm text-gray-500">{group.total_members} members</p>
                    <p className="text-sm text-green-600">R{group.total_monthly_premium.toFixed(2)}</p>
                    {group.collection_dates && group.collection_dates.length === 12 && (
                      <p className="text-xs text-green-600 mt-1">✓ Dates configured</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle>
                      {selectedGroup ? `${selectedGroup.group_name} - ${currentYear}` : 'Select a Group'}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {selectedGroup
                      ? 'Set collection date for each month (system will handle weekends/holidays)'
                      : 'Choose a group from the list to set collection dates'}
                  </CardDescription>
                </div>
                {selectedGroup && (
                  <Button onClick={handleSaveDates}>
                    Save Dates
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedGroup ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthNames.map((month, index) => (
                    <div key={month} className="border rounded-lg p-4 bg-gray-50">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{month}</h3>
                            <p className="text-sm text-gray-600">{currentYear}</p>
                          </div>
                          {collectionDates[index] && (
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 hover:text-gray-900" style={{ marginTop: '18px' }}>
                              <input
                                type="checkbox"
                                checked={applyToAllFlags[index]}
                                onChange={() => toggleApplyToAll(index)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="whitespace-nowrap">Apply to all</span>
                            </label>
                          )}
                        </div>
                        {collectionDates[index] && (
                          <p className="text-xs text-blue-600">
                            Selected: {new Date(collectionDates[index]).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Day headers */}
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="text-xs font-medium text-gray-500 text-center h-6 flex items-center justify-center">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar days */}
                        {renderMonthCalendar(index)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveDates} size="lg">
                    Save Dates
                  </Button>
                </div>
              </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Select a group to configure collection dates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ How Collection Dates Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Set one collection date for each month (12 dates per year)</p>
              <p>• The system will automatically handle weekends and public holidays</p>
              <p>• If a collection date falls on a weekend, it will be moved to the next business day</p>
              <p>• If a collection date falls on a public holiday, it will be moved to the next business day</p>
              <p>• The system will submit debit orders to Netcash 3 business days before the collection date</p>
              <p>• You can update dates at any time, but changes only affect future collections</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
