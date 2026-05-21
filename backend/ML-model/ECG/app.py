from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import warnings

# Suppress sklearn version mismatch warnings (model is stable across minor versions)
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

app = Flask(__name__)

# Allow cross-origin requests from any frontend origin (dev + Docker)
CORS(app)

# Load trained scikit-learn model once at startup
model = joblib.load("heart_model.pkl")

# Exact feature names the model was trained with (must match DataFrame columns)
FEATURE_NAMES = [
    'age', 'sex', 'cp', 'trestbps', 'chol',
    'fbs', 'restecg', 'thalach', 'exang',
    'oldpeak', 'slope', 'ca', 'thal'
]


# ── Health check ──────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "model": "loaded",
        "model_type": type(model).__name__,
        "features_expected": FEATURE_NAMES
    }), 200


# ── Homepage ──────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return render_template("index.html")


# ── Prediction API ────────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({"error": "Request body must be valid JSON."}), 400

        # Validate all features are present and numeric
        missing = [f for f in FEATURE_NAMES if f not in data]
        if missing:
            return jsonify({
                "error": f"Missing required features: {missing}"
            }), 400

        non_numeric = []
        for f in FEATURE_NAMES:
            try:
                float(data[f])
            except (TypeError, ValueError):
                non_numeric.append(f)

        if non_numeric:
            return jsonify({
                "error": f"Non-numeric values for features: {non_numeric}"
            }), 400

        # Build a named DataFrame — critical for models fitted with feature names
        feature_dict = {f: [float(data[f])] for f in FEATURE_NAMES}
        features_df = pd.DataFrame(feature_dict)

        prediction = model.predict(features_df)[0]
        probability = model.predict_proba(features_df)[0]

        # NOTE: In this training dataset, class labels are INVERTED:
        #   target=0 → heart disease PRESENT
        #   target=1 → no heart disease
        # So probability[0] = P(disease), probability[1] = P(no disease)
        risk_percent    = round(float(probability[0]) * 100, 2)
        no_risk_percent = round(float(probability[1]) * 100, 2)

        result = "High Risk of Heart Disease" if int(prediction) == 0 else "Normal"

        return jsonify({
            "prediction": result,
            "risk_probability": f"{risk_percent}%",
            "confidence": {
                "no_disease": no_risk_percent,
                "disease": risk_percent
            },
            "raw_prediction": int(prediction)
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Internal server error during prediction.",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)