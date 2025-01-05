import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Comment } from '../types';

interface CommentModalProps {
  accidentId: number;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (comment: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  comments,
  onClose,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Comments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-md border-gray-300 shadow-sm px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};