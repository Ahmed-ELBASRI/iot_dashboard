import { Comment } from '../types';

// Mock data store
let comments: Comment[] = [];
let nextId = 1;

export const commentService = {
  getComments: async (accidentId: number): Promise<Comment[]> => {
    return comments.filter(comment => comment.accidentId === accidentId);
  },

  addComment: async (accidentId: number, content: string, userName: string): Promise<Comment> => {
    const newComment: Comment = {
      id: nextId++,
      accidentId,
      content,
      userName,
      timestamp: new Date().toISOString(),
    };
    comments.push(newComment);
    return newComment;
  },
};