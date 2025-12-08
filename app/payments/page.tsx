"use client";

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CartItem {
  id: string;
  name: string;
  amount: number;
  quantity: number;
}

export default function PaymentsPage() {
  const [playerInfo, setPlayerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customAmounts, setCustomAmounts] = useState({
    indoorPractice: '',
    t30League: '',
    t20League: ''
  });
  const [registrationSelected, setRegistrationSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const REGISTRATION_FEE = 50;

  const updateCart = () => {
    const items: CartItem[] = [];

    if (registrationSelected) {
      items.push({
        id: 'registration',
        name: 'Club Registration',
        amount: REGISTRATION_FEE,
        quantity: 1
      });
    }

    if (customAmounts.indoorPractice && parseFloat(customAmounts.indoorPractice) > 0) {
      items.push({
        id: 'indoor-practice',
        name: 'Indoor Practice',
        amount: parseFloat(customAmounts.indoorPractice),
        quantity: 1
      });
    }

    if (customAmounts.t30League && parseFloat(customAmounts.t30League) > 0) {
      items.push({
        id: 't30-league',
        name: 'T30 League Fee',
        amount: parseFloat(customAmounts.t30League),
        quantity: 1
      });
    }

    if (customAmounts.t20League && parseFloat(customAmounts.t20League) > 0) {
      items.push({
        id: 't20-league',
        name: 'T20 League Fee',
        amount: parseFloat(customAmounts.t20League),
        quantity: 1
      });
    }

    setCart(items);
  };

  const handleRegistrationToggle = () => {
    setRegistrationSelected(!registrationSelected);
    setTimeout(updateCart, 0);
  };

  const handleCustomAmountChange = (field: keyof typeof customAmounts, value: string) => {
    // Only allow numbers and decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    setCustomAmounts(prev => ({ ...prev, [field]: value }));
    setTimeout(updateCart, 0);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  const handleCheckout = async () => {
    if (!playerInfo.name || !playerInfo.email) {
      setError('Please enter your name and email');
      return;
    }

    if (cart.length === 0) {
      setError('Please select at least one payment item');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          customerInfo: playerInfo
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
              <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm text-gray-300">Secure Payments</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Club <span className="gradient-text">Payments</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Pay for registration, practice sessions, and league fees securely online
            </p>

            <div className="max-w-3xl mx-auto glass rounded-2xl p-6 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Secure</div>
                  <div className="text-sm text-gray-400">Powered by Stripe</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Instant</div>
                  <div className="text-sm text-gray-400">Receipt Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">NFP</div>
                  <div className="text-sm text-gray-400">Registered Non-Profit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Form Section */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Player Info & Payment Options */}
            <div className="lg:col-span-2 space-y-8">
              {/* Player Information */}
              <div className="glass rounded-2xl p-8 border-2 border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Player Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={playerInfo.name}
                      onChange={(e) => setPlayerInfo({ ...playerInfo, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={playerInfo.email}
                      onChange={(e) => setPlayerInfo({ ...playerInfo, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={playerInfo.phone}
                      onChange={(e) => setPlayerInfo({ ...playerInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="(519) 555-0123"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Categories */}
              <div className="glass rounded-2xl p-8 border-2 border-white/10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  Select Payment Items
                </h2>

                <div className="space-y-4">
                  {/* Club Registration */}
                  <div
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      registrationSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    onClick={handleRegistrationToggle}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          registrationSelected ? 'border-primary-500 bg-primary-500' : 'border-white/30'
                        }`}>
                          {registrationSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">Club Registration</h3>
                          <p className="text-sm text-gray-400">2026 Season membership</p>
                        </div>
                      </div>
                      <div className="text-xl font-bold gradient-text">${REGISTRATION_FEE}</div>
                    </div>
                  </div>

                  {/* Indoor Practice */}
                  <div className="p-4 rounded-xl border-2 border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Indoor Practice</h3>
                        <p className="text-sm text-gray-400">Enter amount shared in WhatsApp group</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">$</span>
                      <input
                        type="text"
                        value={customAmounts.indoorPractice}
                        onChange={(e) => handleCustomAmountChange('indoorPractice', e.target.value)}
                        onBlur={updateCart}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  {/* T30 League */}
                  <div className="p-4 rounded-xl border-2 border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">T30 League Fee</h3>
                        <p className="text-sm text-gray-400">30-over format league registration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">$</span>
                      <input
                        type="text"
                        value={customAmounts.t30League}
                        onChange={(e) => handleCustomAmountChange('t30League', e.target.value)}
                        onBlur={updateCart}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  {/* T20 League */}
                  <div className="p-4 rounded-xl border-2 border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">T20 League Fee</h3>
                        <p className="text-sm text-gray-400">20-over format league registration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">$</span>
                      <input
                        type="text"
                        value={customAmounts.t20League}
                        onChange={(e) => handleCustomAmountChange('t20League', e.target.value)}
                        onBlur={updateCart}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Cart Summary */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 border-2 border-primary-500/30 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Order Summary
                </h2>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">No items selected</p>
                    <p className="text-xs mt-1">Select payment items from the left</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-300">{item.name}</span>
                          <span className="font-semibold">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center py-4 border-t border-white/20">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold gradient-text">${cartTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || cart.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secured by Stripe
                </div>

                {/* Club Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-gray-500 text-center">
                    <strong>Challengers Cricket Club</strong><br />
                    Ontario NFP Corporation #1746974-8<br />
                    contact@challengerscc.ca
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                <span className="text-2xl font-bold gradient-text">1</span>
              </div>
              <h3 className="font-semibold mb-2">Select Items</h3>
              <p className="text-sm text-gray-400">Choose registration, practice fees, or league payments</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                <span className="text-2xl font-bold gradient-text">2</span>
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-400">Pay securely via Stripe with card or other methods</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                <span className="text-2xl font-bold gradient-text">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Receipt</h3>
              <p className="text-sm text-gray-400">Instant receipt with club details for your records</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">Is my payment secure?</h3>
              <p className="text-sm text-gray-400">Yes, all payments are processed through Stripe, a PCI-compliant payment processor used by millions of businesses worldwide.</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">Will I receive a receipt?</h3>
              <p className="text-sm text-gray-400">Yes, you will receive an email receipt from Stripe immediately after payment, plus a detailed receipt on our confirmation page.</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
              <p className="text-sm text-gray-400">We accept all major credit and debit cards including Visa, Mastercard, American Express, and more.</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">How do I know the correct amount for practice/league fees?</h3>
              <p className="text-sm text-gray-400">Fee amounts are shared by club management via WhatsApp group. If you&apos;re unsure, please contact us at contact@challengerscc.ca before paying.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
