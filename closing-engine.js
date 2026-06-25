#!/usr/bin/env node
class ClosingEngine {
  constructor(mercury, governess, properties, ledger) {
    this.mercury = mercury
    this.governess = governess
    this.properties = properties
    this.ledger = ledger
    this.closings = []
  }

  async closeDeal(deal, titleCompanyEmail) {
    console.log(`\n🏛️ INITIATING CLOSING: ${deal.address}`)
    
    console.log(`\nStep 1: Depositing assignment fee to title company`)
    const assignmentFeeResult = await this.mercury.createTransfer(
      titleCompanyEmail,
      deal.estimatedFee,
      `Assignment fee: ${deal.address}`
    )

    if (!assignmentFeeResult.success && !assignmentFeeResult.data) {
      console.log(`❌ Assignment wire failed`)
      return { success: false, error: 'Wire failed' }
    }

    console.log(`\nStep 2: Recording assignment fee in ledger`)
    try {
      this.ledger.addRevenue(deal.estimatedFee, `Wholesale assignment: ${deal.address}`)
      console.log(`✅ Assignment fee recorded: $${deal.estimatedFee.toLocaleString()}`)
    } catch (err) {
      console.log(`❌ Ledger recording failed: ${err.message}`)
    }

    console.log(`\nStep 3: Triggering Governess capital deployment`)
    const allProperties = this.properties.getAllProperties()
    let deploymentResult = null

    for (const prop of allProperties) {
      const decision = this.governess.deploy(prop)
      if (decision.status === 'EXECUTED') {
        deploymentResult = decision
        break
      }
    }

    if (deploymentResult && deploymentResult.status === 'EXECUTED') {
      console.log(`\nStep 4: Wiring down payment to property lender`)
      const lenderEmail = 'loans@realestate-company.com'
      
      await this.mercury.createTransfer(
        lenderEmail,
        deploymentResult.analysis.downPayment,
        `Down payment: ${deploymentResult.analysis.address}`
      )
    }

    const closing = {
      timestamp: new Date().toISOString(),
      dealAddress: deal.address,
      assignmentFee: deal.estimatedFee,
      assignmentFeeWired: assignmentFeeResult.success || assignmentFeeResult.data,
      deploymentExecuted: deploymentResult?.status === 'EXECUTED',
      deployedProperty: deploymentResult?.analysis.address,
      deployedAmount: deploymentResult?.analysis.downPayment,
      status: 'COMPLETED'
    }

    this.closings.push(closing)

    console.log(`\n✅ CLOSING COMPLETE: ${deal.address}`)
    console.log(`   Assignment Fee: $${deal.estimatedFee.toLocaleString()}`)
    if (deploymentResult?.status === 'EXECUTED') {
      console.log(`   Property Deployed: ${deploymentResult.analysis.address}`)
      console.log(`   Down Payment Wired: $${deploymentResult.analysis.downPayment.toLocaleString()}`)
      console.log(`   Monthly Income: $${deploymentResult.analysis.monthlyRent.toLocaleString()}`)
    }

    return closing
  }

  getClosings() {
    return this.closings
  }
}

module.exports = ClosingEngine
