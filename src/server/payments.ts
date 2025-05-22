import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
import { Payment } from './models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });

// Create Payment Intent (manual capture)
router.post("/create-payment-intent", async (req, res) => {
  const { amount, currency = "usd", metadata } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ["card"],
      capture_method: "manual",
      metadata,
    });
    // Update or create payment in DB
    await Payment.findOneAndUpdate(
      { paymentId: metadata?.paymentId },
      { $set: { status: 'pending', paymentIntentId: paymentIntent.id } },
      { upsert: true }
    );
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Capture Payment Intent (release funds)
router.post("/capture-payment-intent", async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    // Update DB status
    await Payment.findOneAndUpdate(
      { paymentIntentId },
      { $set: { status: 'released' } }
    );
    res.json({ success: true, paymentIntent });
  } catch (err) {
    res.status(500).json({ error: "Failed to capture payment intent" });
  }
});

// Refund/Cancel Payment Intent
router.post("/refund-payment-intent", async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    await Payment.findOneAndUpdate(
      { paymentIntentId },
      { $set: { status: 'refunded' } }
    );
    res.json({ success: true, paymentIntent });
  } catch (err) {
    res.status(500).json({ error: "Failed to refund/cancel payment intent" });
  }
});

// Get all payments (for dashboard)
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

export default router;
