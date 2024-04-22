document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.navigation a');
    const wrapper = document.querySelector('.wrapper');
    const addIncomeSection = document.querySelector('.wrapper2.add-income')
    const addExpenseSection = document.querySelector('.wrapper2.add-expense');
    const dashboard = document.querySelector('.wrapper3.dashboard');


    navLinks[1].addEventListener('click', ()=> {
        addIncomeSection.classList.add('active-section');
        addExpenseSection.classList.remove('active-section');
        dashboard.classList.remove('active-section');
        localStorage.setItem('lastActiveSection', 'addIncomeSection');
    });

    navLinks[2].addEventListener('click', ()=> {
        addExpenseSection.classList.add('active-section');
        addIncomeSection.classList.remove('active-section');
        dashboard.classList.remove('active-section');
        localStorage.setItem('lastActiveSection', 'addExpenseSection');
    });

    navLinks[0].addEventListener('click', ()=> {
        location.reload();
        dashboard.classList.add('active-section');
        addIncomeSection.classList.remove('active-section');
        addExpenseSection.classList.remove('active-section');
        localStorage.setItem('lastActiveSection', 'dashboard');
        updateTotalAmount();
        createCharts();
    });

    function updateTotalAmount() { 
        let data = localStorage.getItem('financeData');
        let financeData = data ? JSON.parse(data) : [];

        let totalIncome = 0;
        let totalExpense = 0;

        financeData.forEach(item => {
            if (item.Type === 'Income') {
                totalIncome += Number(item.Income);
            } else if (item.Type === 'Expense') {
                totalExpense += Number(item.Amount);
            }
        });

        let totalAmount = totalIncome - totalExpense;

        document.getElementById('total-amount').textContent = totalAmount;
        createCharts();
    }

    document.querySelector('.btn2').addEventListener('click', function() {
        let income = document.getElementById('income-amount').value;
        let source = document.getElementById('income-from').value;
        let date = document.getElementById('income-date').value;

        let newIncome = {
            Type: 'Income',
            Income: income,
            Source: source,
            Date: date
        };

        let data = localStorage.getItem('financeData');
        let financeData = data ? JSON.parse(data) : [];
        financeData.push(newIncome);
        localStorage.setItem('financeData', JSON.stringify(financeData));

        document.getElementById('income-amount').value = '';
        document.getElementById('income-from').value = '';
        document.getElementById('income-date').value = '';
        updateTotalAmount();
        createCharts();  // create or update the charts
    });

    document.querySelector('.btn3').addEventListener('click', function() {
        let expense = document.getElementById('expense-amount').value;
        let source = document.getElementById('expense-from').value;
        let date = document.getElementById('expense-date').value;

        let newExpense = {
            Type: 'Expense',
            Amount: expense,
            Source: source,
            Date: date
        };

        let data = localStorage.getItem('financeData');
        let financeData = data ? JSON.parse(data) : [];
        financeData.push(newExpense);
        localStorage.setItem('financeData', JSON.stringify(financeData));

        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-from').value = '';
        document.getElementById('expense-date').value = '';
        updateTotalAmount();
    });

    document.querySelector('.btnDownload').addEventListener('click', function() {
        let data = localStorage.getItem('financeData');
        if (!data) {
            alert('No data to download');
            return;
        }
        let incomeData = data ? JSON.parse(data) : [];

        let date = new Date();
        let filename = 'financeData-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '.json';

        let blob = new Blob([JSON.stringify(incomeData, null, 2)], {type: "application/json"});
        let url = URL.createObjectURL(blob);

        let link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    });

    document.querySelector('.btnUpload').addEventListener('click', function() {
        document.getElementById('json-upload').click();
    });

    document.getElementById('json-upload').addEventListener('change', function(e) {
        let file = e.target.files[0];

        if (file) {
            let reader = new FileReader();

            reader.onload = function(e) {
                let contents = e.target.result;
                let data = JSON.parse(contents);

                localStorage.setItem('financeData', JSON.stringify(data));
                updateTotalAmount();
                createCharts();  // create or update the charts
            };

            reader.readAsText(file);
        }
    });

    window.onload = function() {
        let data = localStorage.getItem('financeData');
        let financeData = data ? JSON.parse(data) : [];

        let totalIncome = 0;
        let totalExpense = 0;

        financeData.forEach(item => {
            if (item.Type === 'Income') {
                totalIncome += Number(item.Income);
            } else if (item.Type === 'Expense') {
                totalExpense += Number(item.Amount);
            }
        });

        let balance = totalIncome - totalExpense;

        document.getElementById('total-amount').textContent = balance;

        let lastActiveSection = localStorage.getItem('lastActiveSection');
        if (lastActiveSection) {
            document.querySelector('.' + lastActiveSection).classList.add('active-section');
        }

        createCharts();  // create or update the charts
    };

    function createCharts() {
        let data = localStorage.getItem('financeData');
        let financeData = data ? JSON.parse(data) : [];

        let totalIncome = 0;
        let totalExpense = 0;

        financeData.forEach(item => {
            if (item.Type === 'Income') {
                totalIncome += Number(item.Income);
            } else if (item.Type === 'Expense') {
                totalExpense += Number(item.Amount);
            }
        });

        const incomeSources = {};
        const expenseSources = {};

        financeData.forEach(item => {
            if (item.Type === 'Income') {
                if (incomeSources[item.Source]) {
                    incomeSources[item.Source] += Number(item.Income);
                } else {
                    incomeSources[item.Source] = Number(item.Income);
                }
            } else if (item.Type === 'Expense') {
                if (expenseSources[item.Source]) {
                    expenseSources[item.Source] += Number(item.Amount);
                } else {
                    expenseSources[item.Source] = Number(item.Amount);
                }
            }
        });

        const incomeData = {
            labels: Object.keys(incomeSources),
            datasets: [{
                data: Object.values(incomeSources),
                backgroundColor: generateColors(Object.keys(incomeSources).length)
            }]
        };

        const expenseData = {
            labels: Object.keys(expenseSources),
            datasets: [{
                data: Object.values(expenseSources),
                backgroundColor: generateColors(Object.keys(expenseSources).length)
            }]
        };

        const incomeChartCtx = document.getElementById('income-chart').getContext('2d');
        new Chart(incomeChartCtx, {
            type: 'doughnut',
            data: incomeData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 15,
                                style: 'bold',
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Income Chart',
                        color: '#fff',
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 15,
                            style: 'bold',
                        }
                    }
                }
            }
        });

        const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
        new Chart(expenseChartCtx, {
            type: 'doughnut',
            data: expenseData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 15,
                                style: 'bold',
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Expense Chart',
                        color: '#fff',
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 15,
                            style: 'bold',
                        }
                    }
                }
            }
        });
    }

    function generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(getRandomColor());
        }
        return colors;
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});