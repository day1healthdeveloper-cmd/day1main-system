'use client';

import { useEffect, useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Feedback {
  id: string;
  status: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  pageName: string;
  userRole: string;
  submittedAt: string;
  submittedBy: string;
  developerComments: Array<{
    comment: string;
    timestamp: string;
    author: string;
  }>;
  updatedAt: string;
}

export default function FeedbackManagementPage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    'in-progress': 0,
    completed: 0,
    archived: 0,
  });

  useEffect(() => {
    fetchFeedback();
    fetchCounts();
  }, [statusFilter]);

  const fetchCounts = async () => {
    try {
      const statuses = ['pending', 'in-progress', 'completed', 'archived'];
      const countPromises = statuses.map(async (status) => {
        const response = await fetch(`/api/feedback/list?status=${status}`);
        const data = await response.json();
        return { status, count: data.feedback?.length || 0 };
      });
      
      const results = await Promise.all(countPromises);
      const newCounts = results.reduce((acc, { status, count }) => {
        acc[status as keyof typeof counts] = count;
        return acc;
      }, {} as typeof counts);
      
      setCounts(newCounts);
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feedback/list?status=${statusFilter}`);
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/feedback/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          status: newStatus,
          currentStatus: statusFilter,
        }),
      });

      if (response.ok) {
        fetchFeedback();
        fetchCounts();
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Failed to update feedback:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedFeedback || !comment.trim()) return;

    try {
      setUpdating(true);
      const response = await fetch('/api/feedback/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: selectedFeedback.id,
          comment: comment.trim(),
          currentStatus: statusFilter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFeedback(data.feedback);
        setComment('');
        fetchFeedback();
        fetchCounts();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      bug: 'bg-red-100 text-red-800',
      feature: 'bg-blue-100 text-blue-800',
      layout: 'bg-purple-100 text-purple-800',
      filter: 'bg-green-100 text-green-800',
      rule: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    const icons: Record<string, string> = {
      bug: '🐛',
      feature: '✨',
      layout: '🎨',
      filter: '🔍',
      rule: '📋',
      other: '💡',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[category]}`}>
        {icons[category]} {category}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-1">Review and manage user feedback</p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b">
          {['pending', 'in-progress', 'completed', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setSelectedFeedback(null);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                statusFilter === status
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.replace('-', ' ').toUpperCase()} ({counts[status as keyof typeof counts]})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Feedback List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {statusFilter.replace('-', ' ').toUpperCase()} ({feedback.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-600">Loading...</div>
                ) : feedback.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No feedback found</div>
                ) : (
                  <div className="space-y-3">
                    {feedback.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFeedback(item)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedFeedback?.id === item.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryBadge(item.category)}
                          <span className="text-xs text-gray-500">{item.pageName}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(item.submittedAt).toLocaleString()} • {item.userRole}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feedback Details */}
          <div>
            {selectedFeedback ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{selectedFeedback.title}</CardTitle>
                    <button
                      onClick={() => setSelectedFeedback(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="flex gap-2">
                    {getCategoryBadge(selectedFeedback.category)}
                    {getPriorityBadge(selectedFeedback.priority)}
                  </div>

                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Page:</span> {selectedFeedback.pageName}</p>
                    <p><span className="font-medium">Role:</span> {selectedFeedback.userRole}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(selectedFeedback.submittedAt).toLocaleString()}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedFeedback.description}
                    </p>
                  </div>

                  {/* Comments */}
                  {selectedFeedback.developerComments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Developer Comments</h4>
                      <div className="space-y-2">
                        {selectedFeedback.developerComments.map((c, i) => (
                          <div key={i} className="bg-blue-50 p-3 rounded text-sm">
                            <p className="text-gray-700">{c.comment}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {c.author} • {new Date(c.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Add Comment</h4>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a developer comment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!comment.trim() || updating}
                      size="sm"
                      className="mt-2"
                    >
                      Add Comment
                    </Button>
                  </div>

                  {/* Status Actions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                    <div className="flex gap-2 flex-wrap">
                      {statusFilter !== 'in-progress' && (
                        <Button
                          onClick={() => handleUpdateStatus(selectedFeedback.id, 'in-progress')}
                          disabled={updating}
                          size="sm"
                          variant="outline"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {statusFilter !== 'completed' && (
                        <Button
                          onClick={() => handleUpdateStatus(selectedFeedback.id, 'completed')}
                          disabled={updating}
                          size="sm"
                          variant="outline"
                        >
                          Mark Completed
                        </Button>
                      )}
                      {statusFilter !== 'archived' && (
                        <Button
                          onClick={() => handleUpdateStatus(selectedFeedback.id, 'archived')}
                          disabled={updating}
                          size="sm"
                          variant="outline"
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Select a feedback item to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
