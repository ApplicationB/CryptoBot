from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

# Endpoint to get portfolio data
@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    # Example data
    data = {
        'tokens': ['ETH', 'BTC', 'DAI'],
        'values': [10, 5, 15]
    }
    return jsonify(data)

# Endpoint to get transaction log
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    # Read the CSV file
    df = pd.read_csv('transactions.csv')
    return df.to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True)
