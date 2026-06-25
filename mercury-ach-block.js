  // Send ACH payment
  async sendPayment({ amount, memo, fromAccountId, toName, toRouting, toAccount }) {
    return this.request(`/payments`, "POST", {
      amount,
      memo,
      fromAccountId,
      recipient: {
        name: toName,
        routingNumber: toRouting,
        accountNumber: toAccount,
        type: "ach"
      }
    });
  }
