"use client";

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  items: { name: string; amount: number }[];
  created: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPaymentDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/payment-details?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);
      } else {
        setError('Could not load payment details, but your payment was successful.');
      }
    } catch {
      setError('Could not load payment details, but your payment was successful.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId, fetchPaymentDetails]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Main Content */}
      <section className="section-padding pt-32 md:pt-40 print:pt-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading payment details...</p>
            </div>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-primary-500">
                  <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Payment <span className="gradient-text">Successful!</span>
                </h1>
                <p className="text-gray-400">
                  Thank you for your payment. A confirmation email has been sent to your email address.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="glass rounded-2xl p-8 border-2 border-primary-500/30" id="receipt">
                {/* Receipt Header */}
                <div className="text-center pb-6 border-b border-white/10 mb-6">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/ccc-logo.png"
                      alt="CCC Logo"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-bold">Challengers Cricket Club</h2>
                  <p className="text-sm text-gray-400">Ontario NFP Corporation #1746974-8</p>
                  <p className="text-sm text-gray-400">contact@challengerscc.ca | challengerscc.ca</p>
                </div>

                {/* Receipt Title */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-primary-400">PAYMENT RECEIPT</h3>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4 mb-6">
                  {sessionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Transaction ID:</span>
                      <span className="font-mono text-xs">{sessionId.slice(0, 20)}...</span>
                    </div>
                  )}
                  {paymentDetails && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Date:</span>
                        <span>{formatDate(paymentDetails.created)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Customer Name:</span>
                        <span>{paymentDetails.customerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Email:</span>
                        <span>{paymentDetails.customerEmail}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Items */}
                {paymentDetails?.items && paymentDetails.items.length > 0 && (
                  <div className="border-t border-white/10 pt-6 mb-6">
                    <h4 className="font-semibold mb-4">Payment Items</h4>
                    <div className="space-y-2">
                      {paymentDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.name}</span>
                          <span>${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Paid</span>
                    <span className="text-2xl font-bold gradient-text">
                      {paymentDetails
                        ? `$${(paymentDetails.amount / 100).toFixed(2)} ${paymentDetails.currency.toUpperCase()}`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-500">
                    This is an official receipt from Challengers Cricket Club.
                    <br />
                    For questions, contact us at contact@challengerscc.ca
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-lg bg-accent-500/20 border border-accent-500/30">
                  <p className="text-sm text-center text-accent-400">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 glass glass-hover rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Receipt
                </button>
                <Link
                  href="/"
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-center shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  Back to Home
                </Link>
              </div>

              {/* Social CTA */}
              <div className="mt-8 glass rounded-xl p-6 text-center print:hidden">
                <p className="text-gray-400 mb-4">Follow us for updates, match results, and events!</p>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://www.instagram.com/challengers.cc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-semibold text-sm hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                    </svg>
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/share/1Fk4YXFpoN/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-semibold text-sm hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .glass {
            background: white !important;
            border: 1px solid #ccc !important;
          }
          .gradient-text {
            background: none !important;
            -webkit-text-fill-color: #10b981 !important;
            color: #10b981 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
