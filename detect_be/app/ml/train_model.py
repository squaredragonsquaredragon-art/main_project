"""
Train an Isolation Forest model on synthetic login data
and save to model.pkl for use by anomaly_detector.py.
Run once: python -m app.ml.train_model
"""
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

np.random.seed(42)

# Normal logins: daytime, known IP ranges, few failures
n_normal = 2000
normal_ip = np.random.randint(1_000_000, 3_000_000_000, size=(n_normal, 1))
normal_hour = np.random.choice(range(6, 23), size=(n_normal, 1))
normal_failures = np.zeros((n_normal, 1))
normal_recent_ips = np.random.randint(1, 5, size=(n_normal, 1))
normal_unusual = np.zeros((n_normal, 1))

X_normal = np.hstack([normal_ip, normal_hour, normal_failures, normal_recent_ips, normal_unusual])

# Anomalous logins: night-time, new IPs, many failures
n_anom = 200
anom_ip = np.random.randint(3_000_000_000, 4_000_000_000, size=(n_anom, 1))
anom_hour = np.random.choice(range(1, 5), size=(n_anom, 1))
anom_failures = np.random.randint(5, 20, size=(n_anom, 1))
anom_recent_ips = np.zeros((n_anom, 1))
anom_unusual = np.ones((n_anom, 1))

X_anom = np.hstack([anom_ip, anom_hour, anom_failures, anom_recent_ips, anom_unusual])

X = np.vstack([X_normal, X_anom])

model = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
model.fit(X)

joblib.dump(model, MODEL_PATH)
print(f"Model saved to {MODEL_PATH}")
