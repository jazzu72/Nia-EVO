#!/usr/bin/env node
class FacebookDeals {
  constructor(pageAccessToken) {
    this.pageAccessToken = pageAccessToken
    this.baseURL = 'https://graph.instagram.com/v18.0'
    this.deals = []
    this.leads = []
  }

  async postToGroup(groupId, message) {
    if (!this.pageAccessToken) {
      console.log('⚠️  Facebook token not configured - simulating post')
      return { success: true, simulated: true, message }
    }

    try {
      const response = await fetch(`${this.baseURL}/${groupId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, access_token: this.pageAccessToken })
      })

      const data = await response.json()
      if (response.ok) {
        console.log(`\n✅ POSTED TO FACEBOOK GROUP ${groupId}`)
        console.log(`   Message: ${message}`)
        return { success: true, postId: data.id }
      } else {
        return { success: false, error: data.error.message }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async listGroupMessages(groupId) {
    if (!this.pageAccessToken) {
      console.log('⚠️  Facebook token not configured - simulating inbox')
      return this.simulateMessages()
    }

    try {
      const response = await fetch(
        `${this.baseURL}/${groupId}/feed?fields=from,message,created_time&access_token=${this.pageAccessToken}`
      )
      const data = await response.json()
      return data.data || []
    } catch (err) {
      return []
    }
  }

  simulateMessages() {
    return [
      { from: 'Seller 1', message: 'Do you buy houses?', created_time: new Date().toISOString() },
      { from: 'Seller 2', message: 'I need to sell quickly', created_time: new Date().toISOString() },
      { from: 'Seller 3', message: 'House needs work, can you help?', created_time: new Date().toISOString() }
    ]
  }

  addDeal(address, arv, sellerContact) {
    const deal = {
      id: Math.random().toString(36).substring(7),
      address,
      arv,
      offer: arv * 0.60,
      estimatedFee: (arv - arv * 0.60) * 0.10,
      sellerContact,
      status: 'LEAD',
      timestamp: new Date().toISOString()
    }

    this.deals.push(deal)
    console.log(`\n📍 DEAL CAPTURED: ${address}`)
    console.log(`   ARV: $${arv.toLocaleString()}`)
    console.log(`   Offer: $${deal.offer.toLocaleString()}`)
    console.log(`   Estimated Fee: $${deal.estimatedFee.toLocaleString()}`)

    return deal
  }

  getDeals(status = null) {
    if (status) return this.deals.filter(d => d.status === status)
    return this.deals
  }
}

module.exports = FacebookDeals
