import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentDetails {
  paymentId: string;
  amount: number;
  currency: string;
  metadata: {
    gigTitle: string;
    packageName: string;
    deliveryTime: number;
    revisions: number;
  };
  status: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripeEscrowPaymentProps {
  payment: PaymentDetails;
}

import { useNavigate } from "react-router-dom";

const StripeEscrowPayment: React.FC<StripeEscrowPaymentProps> = ({ payment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setStatus("Creating payment intent...");
    try {
      // Create payment intent on backend
      const res = await axios.post("/api/payments/create-payment-intent", {
        amount: payment.amount + payment.amount * 0.055 + 2, // Total
        currency: payment.currency || "usd",
        metadata: { paymentId: payment.paymentId },
      });
      const { clientSecret } = res.data;
      setStatus("Authorizing payment...");
      // Confirm card payment
      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements!.getElement(CardElement)!,
        },
      });
      if (result?.error) {
        setError(result.error.message || "Payment failed");
        setStatus("");
      } else if (result?.paymentIntent?.status === "requires_capture") {
        setSucceeded(true);
        setStatus("Payment authorized and held in escrow!");
        setShowSuccessModal(true);
      } else {
        setError("Unexpected payment status");
        setStatus("");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create payment intent");
      setStatus("");
    }
    setProcessing(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardElement className="p-2 border rounded" />
        <button
          type="submit"
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          disabled={!stripe || processing || succeeded}
        >
          {processing ? "Processing..." : succeeded ? "Payment Authorized" : "Pay Now (Escrow)"}
        </button>
        {status && <div className="text-green-600 mt-2">{status}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      {showSuccessModal && (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <div style={{background: 'white', borderRadius: 8, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', minWidth: 320, textAlign: 'center'}}>
          <div style={{fontSize: 22, fontWeight: 600, marginBottom: 12, color: '#22c55e'}}>Payment Successful!</div>
          <div style={{marginBottom: 24}}>Your payment is now held in escrow.</div>
          <button
            style={{background: '#6366f1', color: 'white', border: 'none', borderRadius: 6, padding: '10px 28px', fontSize: 16, fontWeight: 500, cursor: 'pointer'}}
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
      )}
    </>
  );
};

export const Checkout = () => {
  const { paymentId } = useParams();
  const { user, isLoaded } = useUser();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await axios.get(`/api/payments/${paymentId}`);
        setPayment(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Payment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-indigo-600">
            <h1 className="text-xl font-semibold text-white">Checkout</h1>
          </div>

          {/* Payment Details */}
          <div className="p-6 space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gig</span>
                  <span className="text-gray-900 font-medium">{payment.metadata.gigTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="text-gray-900 font-medium">{payment.metadata.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Time</span>
                  <span className="text-gray-900 font-medium">{payment.metadata.deliveryTime} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revisions</span>
                  <span className="text-gray-900 font-medium">{payment.metadata.revisions}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="text-gray-900">${(payment.amount * 0.055).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="text-gray-900">$2.00</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-lg font-medium text-gray-900">
                  ${(payment.amount + payment.amount * 0.055 + 2).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            {/* Stripe Payment Form */}
            <Elements stripe={stripePromise}>
              <StripeEscrowPayment payment={payment} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}; 