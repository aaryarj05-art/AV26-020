import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'processed', 'clean_outbreak_data.parquet')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

class LSTMForecast:
    def __init__(self, disease, region):
        self.disease = disease
        self.region = region
        self.model = None
        self.scaler = MinMaxScaler()
        self.sequence_length = 12
        self.features = ['cases', 'rolling_7day_avg', 'rolling_30day_avg', 'week_of_year', 'is_monsoon_season']
        self.metrics = {}
        os.makedirs(MODEL_DIR, exist_ok=True)

    def _prepare_data(self):
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[(df['disease'] == self.disease) & (df['region'] == self.region)]
        df_filtered = df_filtered.sort_values('date')
        
        # Select features
        data = df_filtered[self.features].values
        
        # Scale data
        scaled_data = self.scaler.fit_transform(data)
        
        # Save scaler
        scaler_path = os.path.join(MODEL_DIR, f"scaler_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
        joblib.dump(self.scaler, scaler_path)
        
        return scaled_data

    def prepare_sequences(self, data):
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:(i + self.sequence_length)])
            y.append(data[i + self.sequence_length, 0]) # Target is 'cases' (index 0)
        return np.array(X), np.array(y)

    def build_model(self, input_shape):
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(32),
            Dropout(0.2),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        return model

    def fit(self, epochs=50, batch_size=16):
        print(f"Training LSTM for {self.disease} in {self.region}...")
        data = self._prepare_data()
        
        # Split into train/test
        train_size = int(len(data) * 0.8)
        train_data = data[:train_size]
        test_data = data[train_size:]
        
        X_train, y_train = self.prepare_sequences(train_data)
        X_test, y_test = self.prepare_sequences(test_data)
        
        if len(X_train) == 0:
            print("Not enough data to train LSTM.")
            return {}

        self.model = self.build_model((self.sequence_length, len(self.features)))
        
        early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.1,
            callbacks=[early_stopping],
            verbose=1 # Progress logging visible in terminal
        )
        
        # Evaluate
        self.evaluate(X_test, y_test)
        
        # Save model
        model_path = os.path.join(MODEL_DIR, f"lstm_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.h5")
        self.model.save(model_path)
        print(f"Model saved to {model_path}")
        
        return self.metrics

    def evaluate(self, X_test, y_test):
        if len(X_test) == 0:
            return
            
        predictions_scaled = self.model.predict(X_test)
        
        # Inverse transform to get real values
        # Create a dummy array for inverse scaling
        dummy = np.zeros((len(predictions_scaled), len(self.features)))
        dummy[:, 0] = predictions_scaled.flatten()
        inv_predictions = self.scaler.inverse_transform(dummy)[:, 0]
        
        dummy_y = np.zeros((len(y_test), len(self.features)))
        dummy_y[:, 0] = y_test
        inv_y_test = self.scaler.inverse_transform(dummy_y)[:, 0]
        
        rmse = np.sqrt(mean_squared_error(inv_y_test, inv_predictions))
        mae = mean_absolute_error(inv_y_test, inv_predictions)
        
        self.metrics = {
            "rmse": float(rmse),
            "mae": float(mae)
        }
        print(f"LSTM Evaluation - RMSE: {rmse:.2f}, MAE: {mae:.2f}")

    def predict(self, steps=12):
        model_path = os.path.join(MODEL_DIR, f"lstm_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.h5")
        scaler_path = os.path.join(MODEL_DIR, f"scaler_{self.disease.lower()}_{self.region.lower().replace(' ', '_')}.pkl")
        
        if self.model is None:
            if os.path.exists(model_path):
                self.model = load_model(model_path)
                self.scaler = joblib.load(scaler_path)
            else:
                raise ValueError("Model not fitted and no saved artifact found.")
        
        # Get last sequence from data
        df = pd.read_parquet(DATA_PATH)
        df_filtered = df[(df['disease'] == self.disease) & (df['region'] == self.region)]
        df_filtered = df_filtered.sort_values('date')
        
        last_data = df_filtered[self.features].values
        scaled_data = self.scaler.transform(last_data)
        
        current_sequence = scaled_data[-self.sequence_length:]
        
        forecast = []
        for _ in range(steps):
            # Predict next step
            pred_scaled = self.model.predict(current_sequence.reshape(1, self.sequence_length, len(self.features)), verbose=0)
            
            # Inverse transform to get actual case count
            dummy = np.zeros((1, len(self.features)))
            dummy[0, 0] = pred_scaled[0, 0]
            inv_pred = self.scaler.inverse_transform(dummy)[0, 0]
            forecast.append(inv_pred)
            
            # Update sequence for next prediction
            # In a real scenario, we'd need to forecast other features too (like rolling averages)
            # For this Phase, we'll just repeat the last values of other features for simplicity
            next_step_features = current_sequence[-1].copy()
            next_step_features[0] = pred_scaled[0, 0] # update cases
            
            current_sequence = np.append(current_sequence[1:], [next_step_features], axis=0)
            
        return {
            "forecast": [float(f) for f in forecast],
            "lower_bound": [float(f * 0.9) for f in forecast], # Synthetic bounds for LSTM
            "upper_bound": [float(f * 1.1) for f in forecast],
            "metrics": self.metrics
        }

if __name__ == "__main__":
    forecaster = LSTMForecast("Dengue", "Maharashtra")
    forecaster.fit(epochs=2) # quick test
    print(forecaster.predict(steps=4))
