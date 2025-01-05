import React, { useState } from 'react';
import { User } from '../types';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { UserForm } from '../components/UserForm';
import { useAuthStore } from '../store/authStore';

export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const handleSubmit = async (userData: Partial<User>) => {
    try {
      if (editingUser?.id) {
        updateUser(editingUser.id, userData);
      } else {
        addUser(userData as Omit<User, 'id'>);
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  return (
    <div className="p-6 ml-64">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            setEditingUser({});
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{user.apiKey}</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingUser?.id ? 'Edit User' : 'Add User'}
            </h2>
            <UserForm
              user={editingUser || {}}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};