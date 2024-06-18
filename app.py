import os
from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime

app = Flask(__name__)

def init_db():
    if os.path.exists('database.db'):
        os.remove('database.db')
    
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
              CREATE TABLE IF NOT EXISTS expenses
              (id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              amount REAL NOT NULL,
              category TEXT NOT NULL,
              date TEXT NOT NULL)
              ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.json
    name = data['name']
    amount = data['amount']
    category = data['category']
    date = data['date'] if 'date' in data else datetime.now().strftime('%Y-%m-%d')

    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)",
              (name, amount, category, date))
    conn.commit()
    conn.close()

    return jsonify({"message": "Expense added successfully!"})

@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT * FROM expenses ORDER BY date DESC")
    expenses = c.fetchall()
    conn.close()
    
    expenses_list = [{"id": row[0], "name": row[1], "amount": row[2], "category": row[3], "date": row[4]} for row in expenses]
    return jsonify(expenses_list)

@app.route('/delete_expense/<int:id>', methods=['DELETE'])
def delete_expense(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("DELETE FROM expenses WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Expense deleted successfully!"})

@app.route('/get_analysis', methods=['GET'])
def get_analysis():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT category, SUM(amount) FROM expenses GROUP BY category")
    analysis = c.fetchall()
    conn.close()
    
    analysis_dict = {row[0]: row[1] for row in analysis}
    return jsonify(analysis_dict)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
