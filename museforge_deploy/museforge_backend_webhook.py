import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    data = request.json
    print(f"📥 Received: {data}")
    return jsonify({"status": "received", "data": data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)

