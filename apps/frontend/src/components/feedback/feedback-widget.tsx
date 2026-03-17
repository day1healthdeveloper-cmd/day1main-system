'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { FeedbackModal } from './feedback-modal';

interface FeedbackWidgetProps {
  pageName: string;
  userRole?: string;
}

export function FeedbackWidget({ pageName, userRole }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          title="Send Feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pageName={pageName}
        userRole={userRole}
      />
    </>
  );
}
