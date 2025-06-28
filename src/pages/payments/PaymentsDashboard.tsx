import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FadeIn } from '../../components/animations/FadeIn';
export const PaymentsDashboard = () => {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPayment, setSelectedPayment] = React.useState<string | null>(null);
  const [refundStatus, setRefundStatus] = React.useState<{[id: string]: string}>({});

  React.useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/payments/all');
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        setPayments([]);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const stats = [
    { label: 'Total Processed', value: '$125,432', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Pending', value: '$12,543', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Released', value: '$98,765', icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'Refunded', value: '$3,456', icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Payments Dashboard</h1>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments && payments.length > 0 ? payments.map((payment: any) => (
                    <tr key={payment.paymentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.paymentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(payment.createdAt || Date.now()).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.status === 'pending' && payment.paymentIntentId && (
                          <>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                              onClick={async () => {
                                await fetch('/api/payments/capture-payment-intent', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ paymentIntentId: payment.paymentIntentId })
                                });
                                window.location.reload();
                              }}
                            >
                              Release Funds
                            </button>
                            <button
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              onClick={async () => {
                                setRefundStatus(s => ({...s, [payment.paymentId]: 'Processing...'}));
                                await fetch('/api/payments/refund-payment-intent', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ paymentIntentId: payment.paymentIntentId })
                                });
                                setRefundStatus(s => ({...s, [payment.paymentId]: 'Refunded'}));
                                window.location.reload();
                              }}
                              disabled={refundStatus[payment.paymentId] === 'Processing...'}
                            >
                              {refundStatus[payment.paymentId] === 'Processing...' ? 'Refunding...' : 'Refund'}
                            </button>
                          </>
                        )}
                        {payment.status === 'released' && (
                          <>
                            <span className="text-green-600 font-semibold">Released</span>
                            <button
                              className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              onClick={async () => {
                                setRefundStatus(s => ({...s, [payment.paymentId]: 'Processing...'}));
                                await fetch('/api/payments/refund-payment-intent', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ paymentIntentId: payment.paymentIntentId })
                                });
                                setRefundStatus(s => ({...s, [payment.paymentId]: 'Refunded'}));
                                window.location.reload();
                              }}
                              disabled={refundStatus[payment.paymentId] === 'Processing...'}
                            >
                              {refundStatus[payment.paymentId] === 'Processing...' ? 'Refunding...' : 'Refund'}
                            </button>
                          </>
                        )}
                        {payment.status === 'refunded' && (
                          <span className="text-red-600 font-semibold">Refunded</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};