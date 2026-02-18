'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SectionItem {
  id: string;
  title: string;
  content: string;
  display_order: number;
}

interface PolicySectionItemsProps {
  items: SectionItem[];
  onAdd: (data: { title: string; content: string }) => Promise<void>;
  onUpdate: (id: string, data: { title: string; content: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  sectionName: string;
}

export function PolicySectionItems({ items, onAdd, onUpdate, onDelete, sectionName }: PolicySectionItemsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  const handleEdit = (item: SectionItem) => {
    setEditingId(item.id);
    setFormData({ title: item.title, content: item.content });
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await onUpdate(editingId, formData);
      } else {
        await onAdd(formData);
      }
      setEditingId(null);
      setAddingNew(false);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete item');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setAddingNew(false);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{sectionName} ({items.length})</h3>
        <Button onClick={handleAddNew} disabled={addingNew || editingId !== null} size="sm">
          + Add Item
        </Button>
      </div>

      {addingNew && (
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold mb-3">Add New Item</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Temporary Total Disability"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the content..."
                rows={4}
                className="w-full px-3 py-2 border rounded mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4">
          {editingId === item.id ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-base font-semibold">{item.title}</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && !addingNew && (
        <p className="text-center text-gray-500 py-8">No items added yet. Click "Add Item" to get started.</p>
      )}
    </div>
  );
}
