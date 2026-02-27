// ─────────────────────────────────────────────────────────────────
//  Hyperswitch API Service
//  Pure functions — each returns a Promise, no side effects
//  Real API: https://sandbox.hyperswitch.io
// ─────────────────────────────────────────────────────────────────
const fetch = require('node-fetch');

const BASE_URL = process.env.HYPERSWITCH_BASE_URL || 'https://sandbox.hyperswitch.io';
const API_KEY  = process.env.HYPERSWITCH_API_KEY  || '';

// ── Pure helper: build request headers ──
const makeHeaders = () => ({
  'Content-Type': 'application/json',
  'api-key': API_KEY,
});

// ── Pure helper: handle API response ──
const parseResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) throw Object.assign(new Error(json.error?.message || 'Hyperswitch API error'), { status: res.status, body: json });
  return json;
};

// ── CREATE PAYMENT ──
// Creates a payment intent on Hyperswitch sandbox
const createPayment = ({ amount, currency = 'INR', description, customerId, metadata = {} }) =>
  fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({
      amount,                       // in paise (₹100 = 10000)
      currency,
      description,
      customer_id: customerId,
      metadata,
      confirm: false,               // confirm separately
      capture_method: 'automatic',
    }),
  }).then(parseResponse);

// ── CONFIRM PAYMENT ──
// Confirms with payment method data (card/UPI)
const confirmPayment = ({ paymentId, paymentMethod, paymentMethodData }) =>
  fetch(`${BASE_URL}/payments/${paymentId}/confirm`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({
      payment_method: paymentMethod,       // 'card' | 'upi' | 'wallet'
      payment_method_data: paymentMethodData,
      customer_acceptance: {
        acceptance_type: 'online',
        accepted_at: new Date().toISOString(),
        online: { ip_address: '127.0.0.1', user_agent: 'PayOS/1.0' },
      },
    }),
  }).then(parseResponse);

// ── GET PAYMENT STATUS ──
const getPayment = (paymentId) =>
  fetch(`${BASE_URL}/payments/${paymentId}`, {
    headers: makeHeaders(),
  }).then(parseResponse);

// ── LIST PAYMENTS ──
// Returns last N payments for analytics + reconciliation
const listPayments = ({ limit = 20, offset = 0 } = {}) =>
  fetch(`${BASE_URL}/payments/list?limit=${limit}&offset=${offset}`, {
    headers: makeHeaders(),
  }).then(parseResponse);

// ── CREATE REFUND ──
const createRefund = ({ paymentId, amount, reason = 'customer_request' }) =>
  fetch(`${BASE_URL}/refunds`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ payment_id: paymentId, amount, reason }),
  }).then(parseResponse);

// ── LIST REFUNDS ──
const listRefunds = ({ paymentId } = {}) =>
  fetch(`${BASE_URL}/refunds/list${paymentId ? `?payment_id=${paymentId}` : ''}`, {
    headers: makeHeaders(),
  }).then(parseResponse);

// ── GET PAYMENT METHODS ──
const getPaymentMethods = () =>
  fetch(`${BASE_URL}/payment_methods`, {
    headers: makeHeaders(),
  }).then(parseResponse);

module.exports = {
  createPayment,
  confirmPayment,
  getPayment,
  listPayments,
  createRefund,
  listRefunds,
  getPaymentMethods,
};
