import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { FadeIn } from '../../components/animations/FadeIn';
import { useDisputes } from '../../hooks/useDisputes';

export const DisputeCenter = () => {
  const { disputes, loading } = useDisputes();
  const [selectedDispute, setSelectedDispute] = React.useState<string | null>(null);

  const stats = [
    { label: 'Open Disputes', value: '23', icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'In Mediation', value: '15', icon: MessageSquare, color: 'bg-yellow-500' },
    { label: 'Resolved', value: '156', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Average Resolution Time', value: '48h', icon: Clock, color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Dispute Resolution Center</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Active Disputes</h2>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {/* Dispute list will be populated here */}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Dispute Details</h2>
              {selectedDispute ? (
                <div>
                  {/* Selected dispute details will be shown here */}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a dispute to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};