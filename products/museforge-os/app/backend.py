from flask import Flask, jsonify, request
import os

app = Flask(__name__, static_folder="../web", static_url_path="/")

@app.route("/api/health")
def health():
    return jsonify({"ok": True, "service": "museforge-os", "status": "operational", "architecture": "Flask x Quantum Core"})

@app.route("/api/process-music", methods=["POST"])
def process_music():
    data = request.json or {}
    return jsonify({"status": "success", "message": "Quantum audio enhancement applied", "track": data.get("track", "Unknown")})

@app.route("/api/discover")
def discover():
    return jsonify({
        "recommendations": [
            {"id": "q-01", "title": "Quantum Jazz Fusion", "artist": "House of Jazzu Ensemble", "match": "99.4%"}
        ]
    })

@app.route("/api/artist/register", methods=["POST"])
def register_artist():
    data = request.json or {}
    return jsonify({"status": "registered", "artist": data.get("name", "Unknown"), "verified_origin": "Blockchain Immutable Ledger"})

@app.route("/api/royalties/<artist_id>")
def royalties(artist_id):
    return jsonify({"artist_id": artist_id, "earned_tokens": 1250.75, "currency": "JAZZU-Q"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3320))
    app.run(host="0.0.0.0", port=port)
