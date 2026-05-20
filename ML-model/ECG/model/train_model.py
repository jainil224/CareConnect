import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# dataset load
data = pd.read_csv("dataset/heart.csv")

# features and target
X = data.drop("target", axis=1)
y = data["target"]

# split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# model
model = RandomForestClassifier()

# train model
model.fit(X_train, y_train)

# accuracy check
print("Model Accuracy:", model.score(X_test, y_test))

# save model
joblib.dump(model, "heart_model.pkl")

print("Model saved successfully")

# test sample
print("Testing multiple samples...")

samples = [
    [29,0,1,105,160,0,1,190,0,0,2,0,2],
    [45,1,2,120,200,0,1,150,0,1,1,0,2],
    [60,1,0,150,300,1,0,120,1,3,0,2,3]
]

for s in samples:
    print("Sample:", s)
    print("Prediction:", model.predict([s]))