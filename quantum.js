const { BraketClient, CreateQuantumTaskCommand } = require("@aws-sdk/client-braket");

class NIAQuantumEngine {
  constructor() {
    this.client = new BraketClient({
      region: "us-east-1"
    });
  }

  async runCircuit(circuit) {
    const params = {
      action: JSON.stringify(circuit),
      deviceArn: "arn:aws:braket:::device/qpu/ionq/ionQdevice",
      outputS3Bucket: process.env.AWS_S3_BUCKET,
      outputS3KeyPrefix: "nia-quantum-results",
      shots: 100
    };

    const command = new CreateQuantumTaskCommand(params);
    const result = await this.client.send(command);

    return result;
  }
}

module.exports = NIAQuantumEngine;
