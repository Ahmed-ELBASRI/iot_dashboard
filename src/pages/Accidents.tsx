import React, { useEffect, useState } from 'react';
import { accidentService } from '../services/api';
import { commentService } from '../services/commentService';
import { Accident, Comment } from '../types';
import { useAuthStore } from '../store/authStore';
import { CommentModal } from '../components/CommentModal';
import { MessageSquare } from 'lucide-react';
import { calculateDuration } from '../utils/dateUtils';

export const Accidents = () => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [selectedAccidentId, setSelectedAccidentId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchAccidents = async () => {
      const data = await accidentService.getAccidents();
      setAccidents(data);
    };

    fetchAccidents();
    const interval = setInterval(fetchAccidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    if (!user) return;
    
    const updatedAccident = await accidentService.updateAccidentStatus(id, status, user.name);
    setAccidents(accidents.map((accident) =>
      accident.id === id ? updatedAccident : accident
    ));
  };

  const handleShowComments = async (accidentId: number) => {
    const accidentComments = await commentService.getComments(accidentId);
    setComments(accidentComments);
    setSelectedAccidentId(accidentId);
  };

  const handleAddComment = async (content: string) => {
    if (!user || !selectedAccidentId) return;
    
    const newComment = await commentService.addComment(
      selectedAccidentId,
      content,
      user.name
    );
    setComments([...comments, newComment]);
  };

  return (
    <div className="p-6 ml-64">
      <h1 className="text-2xl font-bold mb-6">Accidents</h1>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accident Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Start</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accidents.map((accident) => (
              <tr key={accident.id}>
                <td className="px-6 py-4 whitespace-nowrap">{accident.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${accident.status === 'up' ? 'bg-red-100 text-red-800' :
                      accident.status === 'being resolved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                    {accident.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(accident.accidentDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accident.resolutionStartDate ? 
                    new Date(accident.resolutionStartDate).toLocaleString() : 
                    '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accident.resolutionDate ? 
                    new Date(accident.resolutionDate).toLocaleString() : 
                    '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {calculateDuration(
                    accident.resolutionStartDate,
                    accident.resolutionDate
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accident.resolvedBy || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accident.temperature}°C
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    {accident.status === 'up' && (
                      <button
                        onClick={() => handleStatusChange(accident.id, 'being resolved')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Take Action
                      </button>
                    )}
                    {accident.status === 'being resolved' && (
                      <button
                        onClick={() => handleStatusChange(accident.id, 'resolved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleShowComments(accident.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <MessageSquare size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAccidentId && (
        <CommentModal
          accidentId={selectedAccidentId}
          comments={comments}
          onClose={() => setSelectedAccidentId(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};