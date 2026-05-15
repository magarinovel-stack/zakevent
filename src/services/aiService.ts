export const aiService = {
  async optimizeBudget(totalBudget: number, guests: number, category: string) {
    const res = await fetch("/api/ai/optimize-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalBudget, guests, category }),
    });
    if (!res.ok) throw new Error("AI optimization failed");
    return res.json();
  },

  detectFraud(booking: { totalAmount?: number; clientId?: string }) {
    if ((booking.totalAmount ?? 0) > 1000000) return { risk: "HIGH", reason: "Unusually high amount" };
    if (!booking.clientId) return { risk: "HIGH", reason: "Anonymous checkout attempt" };
    return { risk: "LOW", reason: "Safe transaction" };
  },
};
