import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Webhook signature verification logic (extracted for testing)
function verifyWebhookSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

// Price calculation: base + service fee (10%)
function calculateTotalPrice(basePrice: number): { base: number; serviceFee: number; total: number } {
  const serviceFee = Math.round(basePrice * 0.1);
  return { base: basePrice, serviceFee, total: basePrice + serviceFee };
}

// Commission formula: platform takes 10% of total amount
function calculateCommission(totalAmount: number): number {
  return Math.round(totalAmount * 0.1);
}

describe("Webhook Signature Verification", () => {
  const secret = "test_webhook_secret_123";

  it("accepts valid signature", () => {
    const body = Buffer.from(JSON.stringify({ type: "checkout.paid", id: "123" }));
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rejects invalid signature", () => {
    const body = Buffer.from(JSON.stringify({ type: "checkout.paid", id: "123" }));
    const fakeSignature = crypto.createHmac("sha256", "wrong_secret").update(body).digest("hex");
    expect(verifyWebhookSignature(body, fakeSignature, secret)).toBe(false);
  });

  it("rejects tampered body", () => {
    const body = Buffer.from(JSON.stringify({ type: "checkout.paid", id: "123" }));
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const tampered = Buffer.from(JSON.stringify({ type: "checkout.paid", id: "456" }));
    expect(verifyWebhookSignature(tampered, signature, secret)).toBe(false);
  });
});

describe("Price Calculation", () => {
  it("calculates 10% service fee", () => {
    const result = calculateTotalPrice(10000);
    expect(result.base).toBe(10000);
    expect(result.serviceFee).toBe(1000);
    expect(result.total).toBe(11000);
  });

  it("handles minimum amount (100 DA)", () => {
    const result = calculateTotalPrice(100);
    expect(result.serviceFee).toBe(10);
    expect(result.total).toBe(110);
  });

  it("rounds service fee", () => {
    const result = calculateTotalPrice(333);
    expect(result.serviceFee).toBe(33);
    expect(result.total).toBe(366);
  });
});

describe("Commission Formula", () => {
  it("takes 10% commission", () => {
    expect(calculateCommission(100000)).toBe(10000);
  });

  it("rounds commission", () => {
    expect(calculateCommission(1555)).toBe(156);
  });

  it("handles zero", () => {
    expect(calculateCommission(0)).toBe(0);
  });
});
