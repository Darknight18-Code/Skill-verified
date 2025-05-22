import React from 'react';
import { motion } from 'framer-motion';
import { Users, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { FadeIn } from '../../components/animations/FadeIn';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState<'users' | 'gigs' | 'disputes' | 'certifications'>('users');

  const stats = [
    { label: 'Total Users', value: '15,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Gigs', value: '432', icon: Package, color: 'bg-yellow-500' },
    { label: 'Active Disputes', value: '23', icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Certified Users', value: '8,745', icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <FadeIn key={stat.label}>
              <motion.div
                className="bg-white rounded-lg shadow-md p-6"
                whileHover={{ y: -5 }}
              >
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'users', label: 'Users', icon: Users },
                { key: 'gigs', label: 'Gigs', icon: Package },
                { key: 'disputes', label: 'Disputes', icon: AlertTriangle },
                { key: 'certifications', label: 'Certifications', icon: CheckCircle },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Content will be implemented based on active tab */}
            <div className="text-center text-gray-500">
              Select a tab to view and manage content
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};