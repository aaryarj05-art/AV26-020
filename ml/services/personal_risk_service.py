import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')

class PersonalRiskService:
    def __init__(self):
        os.makedirs(MODEL_DIR, exist_ok=True)
        self.models = {}
        self._initialize_models()

    def _initialize_models(self):
        conditions = ['diabetes', 'heart', 'stroke']
        for cond in conditions:
            path = os.path.join(MODEL_DIR, f"personal_risk_{cond}.pkl")
            if os.path.exists(path):
                self.models[cond] = joblib.load(path)
            else:
                self.train_and_save_all()
                break

    def train_and_save_all(self):
        print("🧬 Training Personal Risk Models...")
        self._train_diabetes()
        self._train_heart()
        self._train_stroke()
        print("✅ Personal Risk Models trained and saved.")

    def _train_diabetes(self):
        # Features: age, BMI, glucose_level, blood_pressure, skin_thickness, insulin, family_history (0/1), physical_activity
        n = 1000
        np.random.seed(42)
        X = pd.DataFrame({
            'age': np.random.randint(20, 80, n),
            'bmi': np.random.uniform(18, 45, n),
            'glucose': np.random.randint(70, 200, n),
            'bp': np.random.randint(60, 140, n),
            'skin': np.random.randint(0, 50, n),
            'insulin': np.random.randint(0, 300, n),
            'family': np.random.randint(0, 2, n),
            'activity': np.random.randint(0, 2, n)
        })
        # Simple risk logic for synthetic labels
        risk = (X['glucose'] > 140).astype(int) + (X['bmi'] > 30).astype(int) + (X['family'] == 1).astype(int)
        y = (risk >= 2).astype(int)
        
        model = LogisticRegression(max_iter=1000)
        model.fit(X, y)
        joblib.dump(model, os.path.join(MODEL_DIR, "personal_risk_diabetes.pkl"))
        self.models['diabetes'] = model

    def _train_heart(self):
        # Features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
        n = 1000
        X = pd.DataFrame({
            'age': np.random.randint(30, 80, n),
            'sex': np.random.randint(0, 2, n),
            'cp': np.random.randint(0, 4, n),
            'trestbps': np.random.randint(90, 180, n),
            'chol': np.random.randint(150, 400, n),
            'fbs': np.random.randint(0, 2, n),
            'restecg': np.random.randint(0, 3, n),
            'thalach': np.random.randint(80, 200, n),
            'exang': np.random.randint(0, 2, n),
            'oldpeak': np.random.uniform(0, 6, n),
            'slope': np.random.randint(0, 3, n),
            'ca': np.random.randint(0, 5, n),
            'thal': np.random.randint(0, 4, n)
        })
        risk = (X['trestbps'] > 140).astype(int) + (X['chol'] > 240).astype(int) + (X['cp'] > 0).astype(int)
        y = (risk >= 2).astype(int)
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)
        joblib.dump(model, os.path.join(MODEL_DIR, "personal_risk_heart.pkl"))
        self.models['heart'] = model

    def _train_stroke(self):
        # Features: age, hypertension, heart_disease, ever_married, work_type, residence_type, avg_glucose_level, BMI, smoking_status
        n = 1000
        X = pd.DataFrame({
            'age': np.random.randint(20, 90, n),
            'hypertension': np.random.randint(0, 2, n),
            'heart_disease': np.random.randint(0, 2, n),
            'ever_married': np.random.randint(0, 2, n),
            'work_type': np.random.randint(0, 4, n),
            'residence_type': np.random.randint(0, 2, n),
            'avg_glucose_level': np.random.randint(60, 250, n),
            'bmi': np.random.uniform(18, 50, n),
            'smoking_status': np.random.randint(0, 4, n)
        })
        risk = (X['age'] > 60).astype(int) + (X['hypertension'] == 1).astype(int) + (X['avg_glucose_level'] > 150).astype(int)
        y = (risk >= 2).astype(int)
        
        model = GradientBoostingClassifier(random_state=42)
        model.fit(X, y)
        joblib.dump(model, os.path.join(MODEL_DIR, "personal_risk_stroke.pkl"))
        self.models['stroke'] = model

    def predict_diabetes(self, data):
        # expects: age, bmi, glucose, bp, skin, insulin, family, activity
        features = ['age', 'bmi', 'glucose', 'bp', 'skin', 'insulin', 'family', 'activity']
        df = pd.DataFrame([data])[features]
        prob = self.models['diabetes'].predict_proba(df)[0][1]
        return self._format_result(prob)

    def predict_heart(self, data):
        # expects: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
        features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        df = pd.DataFrame([data])[features]
        prob = self.models['heart'].predict_proba(df)[0][1]
        
        # Risk factors (simplified: variables with highest values relative to norm)
        factors = []
        if data.get('trestbps', 0) > 130: factors.append("Hypertension")
        if data.get('chol', 0) > 200: factors.append("High Cholesterol")
        if data.get('fbs', 0) == 1: factors.append("High Blood Sugar")
        
        return {**self._format_result(prob), "top_risk_factors": factors[:3]}

    def predict_stroke(self, data):
        # expects: age, hypertension, heart_disease, ever_married, work_type, residence_type, avg_glucose_level, bmi, smoking_status
        features = ['age', 'hypertension', 'heart_disease', 'ever_married', 'work_type', 'residence_type', 'avg_glucose_level', 'bmi', 'smoking_status']
        df = pd.DataFrame([data])[features]
        prob = self.models['stroke'].predict_proba(df)[0][1]
        return self._format_result(prob)

    def _format_result(self, prob):
        cat = "Low"
        if prob > 0.7: cat = "High"
        elif prob > 0.3: cat = "Moderate"
        return {
            "risk_probability": round(float(prob), 3),
            "risk_category": cat
        }

    def predict_all(self, user_profile):
        """
        user_profile: combined health profile
        """
        # Map profile to specific model inputs
        results = {
            "diabetes": self.predict_diabetes({
                "age": user_profile.get('age', 40),
                "bmi": user_profile.get('bmi', 25),
                "glucose": user_profile.get('glucose', 100),
                "bp": user_profile.get('bp_systolic', 120),
                "skin": 20, # default
                "insulin": 80, # default
                "family": user_profile.get('family_diabetes', 0),
                "activity": user_profile.get('active', 1)
            }),
            "heart": self.predict_heart({
                "age": user_profile.get('age', 40),
                "sex": 1 if user_profile.get('sex') == 'male' else 0,
                "cp": user_profile.get('chest_pain', 0),
                "trestbps": user_profile.get('bp_systolic', 120),
                "chol": user_profile.get('cholesterol', 180),
                "fbs": 1 if user_profile.get('glucose', 100) > 126 else 0,
                "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 1.0, "slope": 1, "ca": 0, "thal": 2
            }),
            "stroke": self.predict_stroke({
                "age": user_profile.get('age', 40),
                "hypertension": 1 if user_profile.get('bp_systolic', 120) > 140 else 0,
                "heart_disease": user_profile.get('heart_disease_history', 0),
                "ever_married": 1, "work_type": 2, "residence_type": 1,
                "avg_glucose_level": user_profile.get('glucose', 100),
                "bmi": user_profile.get('bmi', 25),
                "smoking_status": user_profile.get('smoking', 0)
            })
        }
        return results

if __name__ == "__main__":
    service = PersonalRiskService()
    test_user = {"age": 65, "bmi": 32, "glucose": 150, "bp_systolic": 145, "family_diabetes": 1}
    print(service.predict_all(test_user))
