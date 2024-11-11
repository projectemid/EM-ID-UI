from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Paths to JSON files
DEVICE_DEFINITIONS_FILE = os.path.join(os.path.dirname(__file__), 'deviceDefinitions.json')
RECENT_EVENTS_FILE = os.path.join(os.path.dirname(__file__), 'recentEvents.json')

# Helper functions
def read_json(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r') as f:
        return json.load(f)

def write_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# Routes for Device Definitions
@app.route('/api/devices', methods=['GET', 'PUT'])
def manage_devices():
    if request.method == 'GET':
        devices = read_json(DEVICE_DEFINITIONS_FILE)
        return jsonify(devices), 200

    elif request.method == 'PUT':
        if not request.json:
            abort(400, description="No data provided")
        devices = request.json
        write_json(DEVICE_DEFINITIONS_FILE, devices)
        return jsonify({"message": "Device definitions updated successfully."}), 200

# Routes for Recent Events
@app.route('/api/events', methods=['GET', 'POST'])
def manage_events():
    if request.method == 'GET':
        events = read_json(RECENT_EVENTS_FILE)
        return jsonify(events), 200

    elif request.method == 'POST':
        if not request.json:
            abort(400, description="No data provided")
        event = request.json

        # Validate event structure
        if not all(k in event for k in ("time", "deviceId", "action")):
            abort(400, description="Missing fields in event data.")

        # Append timestamp if not provided
        if 'time' not in event or not event['time']:
            event['time'] = datetime.now().strftime("%I:%M %p")

        events = read_json(RECENT_EVENTS_FILE)
        events.append(event)
        write_json(RECENT_EVENTS_FILE, events)
        return jsonify({"message": "Event added successfully."}), 201

# Error Handling
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request", "message": error.description}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": "Resource not found."}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
