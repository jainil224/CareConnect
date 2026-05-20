import urllib.request
import json
import time

base = 'http://127.0.0.1:5000'

def post_predict(patient):
    payload = json.dumps(patient).encode()
    req = urllib.request.Request(
        base + '/predict', data=payload,
        headers={'Content-Type': 'application/json'}, method='POST')
    res = urllib.request.urlopen(req, timeout=6)
    return json.loads(res.read())

time.sleep(2)

# Health check
res = urllib.request.urlopen(base + '/health', timeout=5)
h = json.loads(res.read())
print("=== HEALTH CHECK ===")
print("  status:", h['status'])
print("  model:", h['model_type'])
print()

# Test 1: Low-risk patient — female, 45, normal thal, no vessel disease
# cp=2 (non-anginal), thal=1 (normal), ca=0, low oldpeak, no exang
low_risk = {
    'age': 45, 'sex': 0, 'cp': 2, 'trestbps': 118,
    'chol': 195, 'fbs': 0, 'restecg': 0, 'thalach': 148,
    'exang': 0, 'oldpeak': 0.3, 'slope': 2, 'ca': 0, 'thal': 1
}
r1 = post_predict(low_risk)
print("=== TEST 1: Low-risk patient (F,45, non-anginal, thal=normal, ca=0) ===")
print("  prediction      :", r1['prediction'])
print("  risk_probability:", r1['risk_probability'])
print("  confidence      :", r1['confidence'])
print("  raw_prediction  :", r1['raw_prediction'], "(0=no disease, 1=disease)")
print()

# Test 2: High-risk patient — male, 62, asymptomatic, 3-vessel, reversible defect
# cp=0 (asymptomatic), ca=3, thal=3 (reversible defect), high oldpeak, exang=1
high_risk = {
    'age': 62, 'sex': 1, 'cp': 0, 'trestbps': 150,
    'chol': 260, 'fbs': 1, 'restecg': 1, 'thalach': 105,
    'exang': 1, 'oldpeak': 2.5, 'slope': 0, 'ca': 3, 'thal': 3
}
r2 = post_predict(high_risk)
print("=== TEST 2: High-risk patient (M,62, asymptomatic, 3-vessel, rev.defect) ===")
print("  prediction      :", r2['prediction'])
print("  risk_probability:", r2['risk_probability'])
print("  confidence      :", r2['confidence'])
print("  raw_prediction  :", r2['raw_prediction'], "(0=no disease, 1=disease)")
print()

# Test 3: Borderline patient
borderline = {
    'age': 55, 'sex': 1, 'cp': 1, 'trestbps': 130,
    'chol': 238, 'fbs': 0, 'restecg': 0, 'thalach': 125,
    'exang': 0, 'oldpeak': 1.2, 'slope': 1, 'ca': 1, 'thal': 2
}
r3 = post_predict(borderline)
print("=== TEST 3: Borderline patient (M,55, atypical angina, 1-vessel) ===")
print("  prediction      :", r3['prediction'])
print("  risk_probability:", r3['risk_probability'])
print("  raw_prediction  :", r3['raw_prediction'])
print()

# Test 4: Validation — missing fields → expect HTTP 400
try:
    payload = json.dumps({'age': 50, 'sex': 1}).encode()
    req = urllib.request.Request(
        base + '/predict', data=payload,
        headers={'Content-Type': 'application/json'}, method='POST')
    urllib.request.urlopen(req, timeout=5)
    print("TEST 4 FAILED — should have returned 400")
except urllib.error.HTTPError as e:
    err = json.loads(e.read())
    print("=== TEST 4: Validation (missing fields) ===")
    print("  HTTP status:", e.code, "(expected 400)")
    print("  error msg  :", err['error'][:90])
    print()

print("=== ALL TESTS COMPLETE ===")
