
import os
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression, LogisticRegression
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Database Connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'doodhly')
    )

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "analytics_engine"}), 200

@app.route('/predict/consumption', methods=['POST'])
def predict_consumption():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Fetch last 90 days of delivery data
        query = """
            SELECT dd.date, s.quantity 
            FROM daily_deliveries dd
            JOIN subscriptions s ON dd.subscription_id = s.id
            WHERE dd.user_id = %s 
            AND dd.status IN ('DELIVERED', 'OUT_FOR_DELIVERY')
            AND dd.date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            ORDER BY dd.date ASC
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()
        
        if not results or len(results) < 5:
            return jsonify({"user_id": user_id, "predicted_liters": 0, "status": "insufficient_data"}), 200
            
        df = pd.DataFrame(results)
        df['date'] = pd.to_datetime(df['date'])
        df['day_ordinal'] = df['date'].apply(lambda x: x.toordinal())
        
        # Linear Regression
        X = df[['day_ordinal']]
        y = df['quantity']
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next 30 days
        last_day = df['day_ordinal'].max()
        future_days = [[last_day + i] for i in range(1, 31)]
        predictions = model.predict(future_days)
        
        total_predicted = sum([max(0, p) for p in predictions]) # Ensure no negative consumption
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "user_id": user_id,
            "predicted_liters": round(total_predicted, 2),
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/churn', methods=['POST'])
def predict_churn():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Simple heuristic for now: 
        # 1. Calculate pause frequency in last 60 days
        # 2. Check if recent consumption is trending down significantly
        
        # For this demo, let's use a simplified logical score
        # In a real scenario, this would load a trained model from a pickle file
        
        # Check active pauses
        cursor.execute("SELECT count(*) as count FROM subscriptions WHERE user_id = %s AND status = 'PAUSED'", (user_id,))
        pause_count = cursor.fetchone()['count']
        
        # Check missed deliveries
        cursor.execute("""
            SELECT count(*) as count 
            FROM daily_deliveries 
            WHERE user_id = %s 
            AND status = 'MISSED' 
            AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        """, (user_id,))
        missed_count = cursor.fetchone()['count']
        
        churn_prob = 0.1
        if pause_count > 0: churn_prob += 0.4
        if missed_count > 2: churn_prob += 0.3
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "user_id": user_id,
            "churn_probability": min(0.99, churn_prob),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, host='0.0.0.0')
