document.getElementById('expense-form').addEventListener('submit', addExpense);
document.addEventListener('DOMContentLoaded', getExpenses);
document.addEventListener('DOMContentLoaded', getAnalysis);

function addExpense(event) {
    event.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value || new Date().toISOString().split('T')[0];

    if (name && amount && category) {
        const expense = { name, amount: parseFloat(amount).toFixed(2), category, date };

        fetch('/add_expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            getExpenses();
            getAnalysis();
            clearForm();
        })
        .catch(error => console.error('Error:', error));
    }
}

function getExpenses() {
    fetch('/get_expenses')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#expenses-table tbody');
            tableBody.innerHTML = '';

            data.forEach(expense => {
                const row = document.createElement('tr');
                
                const nameCell = document.createElement('td');
                nameCell.textContent = expense.name;
                row.appendChild(nameCell);
                
                const amountCell = document.createElement('td');
                amountCell.textContent = `$${expense.amount}`;
                row.appendChild(amountCell);

                const categoryCell = document.createElement('td');
                categoryCell.textContent = expense.category;
                row.appendChild(categoryCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = expense.date;
                row.appendChild(dateCell);
                
                const actionCell = document.createElement('td');
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.onclick = () => removeExpense(expense.id);
                actionCell.appendChild(removeButton);
                row.appendChild(actionCell);

                tableBody.appendChild(row);
            });

            updateTotal();
        })
        .catch(error => console.error('Error:', error));
}

function removeExpense(id) {
    fetch(`/delete_expense/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            getExpenses();
            getAnalysis();
        })
        .catch(error => console.error('Error:', error));
}

function updateTotal() {
    const amounts = document.querySelectorAll('#expenses-table tbody tr td:nth-child(2)');
    let total = 0;

    amounts.forEach(amount => {
        total += parseFloat(amount.textContent.replace('$', ''));
    });

    document.getElementById('total-amount').textContent = total.toFixed(2);
}

function getAnalysis() {
    fetch('/get_analysis')
        .then(response => response.json())
        .then(data => {
            const analysisList = document.getElementById('analysis-list');
            analysisList.innerHTML = '';

            for (const [category, total] of Object.entries(data)) {
                const listItem = document.createElement('li');
                listItem.textContent = `${category}: $${total.toFixed(2)}`;
                analysisList.appendChild(listItem);
            }
        })
        .catch(error => console.error('Error:', error));
}

function clearForm() {
    document.getElementById('expense-name').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-date').value = '';
}
