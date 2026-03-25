/* ==========================================
   1. UTILITIES & DOM MAPPING
   ========================================== */
const $ = (id) => document.getElementById(id);

const UI = {
    marketing: $('marketingSiteWrapper'),
    dashboard: $('appDashboardWrapper'),
    balance: $('displayMasterBalance'),
    income: $('displayTotalIncome'),
    expense: $('displayTotalExpense'),
    remaining: $('displayRemainingBudget'),
    ledger: $('transactionLedgerList'),
    form: $('financialEntryForm'),
    desc: $('inputTransactionDesc'),
    amt: $('inputTransactionAmt'),
    // Note: removed `category` from here as we now have two separate ones
    salary: $('inputBaseSalary'),
    budget: $('inputMonthlyBudget'),
    search: $('searchTransactions'),
    ratioBar: $('expenseVisualBar'),
    ratioText: $('expenseRatioText'),
    greeting: $('greetingMessage'),
    dateDisplay: $('currentDateDisplay'),
    profileName: $('userProfileName'),
    avatarText: $('userAvatarText')
};

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

/* ==========================================
   2. STATE MANAGEMENT & LOCAL STORAGE
   ========================================== */
let txns = JSON.parse(localStorage.getItem('trackerPro_txns')) || [];
let userName = localStorage.getItem('trackerPro_userName') || 'Ghost';

// Initialize Inputs and Profile
UI.salary.value = localStorage.getItem('trackerPro_salary') || '';
UI.budget.value = localStorage.getItem('trackerPro_budget') || '';
UI.profileName.value = userName;
UI.avatarText.innerText = userName.charAt(0).toUpperCase();

const saveState = () => {
    localStorage.setItem('trackerPro_txns', JSON.stringify(txns));
    localStorage.setItem('trackerPro_salary', UI.salary.value);
    localStorage.setItem('trackerPro_budget', UI.budget.value);
};

/* ==========================================
   3. PROFILE EDITING & DYNAMIC GREETING
   ========================================== */
const updateGreeting = () => {
    const hour = new Date().getHours();
    let greet = "Good Evening";
    if (hour < 12) greet = "Good Morning";
    else if (hour < 17) greet = "Good Afternoon";
    
    UI.greeting.innerText = `${greet}, ${userName}`;
    UI.dateDisplay.innerText = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// When user types a new name, save it instantly
UI.profileName.addEventListener('input', (e) => {
    const newName = e.target.value.trim() || 'User';
    userName = newName;
    UI.avatarText.innerText = newName.charAt(0).toUpperCase();
    localStorage.setItem('trackerPro_userName', newName);
    updateGreeting();
});

// Remove focus when they hit enter
UI.profileName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        UI.profileName.blur(); 
    }
});


/* ==========================================
   4. SPA ROUTING
   ========================================== */
const toggleView = (isOpening) => {
    UI.marketing.classList.toggle('hiddenView', isOpening);
    UI.dashboard.classList.toggle('hiddenView', !isOpening);
    if (isOpening) updateGreeting();
};


/* ==========================================
   5. CORE FINANCIAL MATH & DOM UPDATES
   ========================================== */
const updateMetrics = () => {
    const budget = parseFloat(UI.budget.value) || 0;
    
    const inc = txns.filter(t => t.amt > 0).reduce((acc, val) => acc + val.amt, 0);
    const exp = txns.filter(t => t.amt < 0).reduce((acc, val) => acc + val.amt, 0);
    const bal = inc + exp; 

    UI.income.innerText = `+${formatINR(inc).replace('₹', '₹ ')}`;
    UI.expense.innerText = `-${formatINR(Math.abs(exp)).replace('₹', '₹ ')}`;
    UI.balance.innerText = formatINR(bal).replace('₹', '₹ ');
    
    const remaining = budget - Math.abs(exp);
    UI.remaining.innerText = formatINR(remaining).replace('₹', '₹ ');
    UI.remaining.style.color = remaining < 0 ? 'var(--color-expense)' : 'var(--color-text-primary)';

    if (inc > 0) {
        let ratio = Math.min((Math.abs(exp) / inc) * 100, 100);
        UI.ratioBar.style.width = `${ratio}%`;
        UI.ratioText.innerText = `${ratio.toFixed(1)}% of Income Spent`;
        UI.ratioBar.style.background = ratio > 80 ? 'var(--color-expense)' : '#F59E0B'; 
    } else {
        UI.ratioBar.style.width = `0%`;
        UI.ratioText.innerText = `0%`;
    }
};

const getCategoryIcon = (cat) => {
    const icons = { 'Food': '🍔', 'Transport': '🚗', 'Utilities': '⚡', 'Shopping': '🛍️', 'Salary': '💰', 'Freelance': '💻', 'Investments': '📈', 'Refund': '🔄', 'Other': '📌' };
    return icons[cat] || '📌';
};

const renderLedger = (filterText = '') => {
    UI.ledger.innerHTML = ''; 
    
    const filteredTxns = txns.filter(t => 
        t.desc.toLowerCase().includes(filterText.toLowerCase()) || 
        t.cat.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredTxns.sort((a, b) => b.id - a.id).forEach(t => {
        const li = document.createElement('li');
        li.className = `ledgerItem ${t.amt > 0 ? 'incomeItem' : 'expenseItem'}`;
        
        const dateStr = new Date(t.id).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        li.innerHTML = `
            <div class="catIcon">${getCategoryIcon(t.cat)}</div>
            <div class="ledgerItemDetails">
                <span class="ledgerItemDesc">${t.desc}</span>
                <span class="ledgerItemDate">${t.cat} • ${dateStr}</span>
            </div>
            <span class="ledgerItemValue">${t.amt > 0 ? '+' : '-'}${formatINR(Math.abs(t.amt))}</span>
            <button class="deleteBtn" onclick="deleteTransaction(${t.id})">🗑️</button>
        `;
        UI.ledger.appendChild(li);
    });
};

window.deleteTransaction = (id) => {
    txns = txns.filter(t => t.id !== id);
    saveState();
    updateMetrics();
    renderLedger(UI.search.value);
};


/* ==========================================
   6. EVENT LISTENERS & FEATURES
   ========================================== */
$('buttonLaunchDashboard').addEventListener('click', () => toggleView(true));
$('navLaunchDashboard').addEventListener('click', () => toggleView(true));
$('buttonCloseDashboard').addEventListener('click', () => toggleView(false));

UI.salary.addEventListener('input', saveState);
UI.budget.addEventListener('input', () => { updateMetrics(); saveState(); });

UI.search.addEventListener('input', (e) => renderLedger(e.target.value));

$('btnQuickSalary').addEventListener('click', () => {
    const salaryAmt = parseFloat(UI.salary.value);
    if (!salaryAmt || isNaN(salaryAmt)) return alert("Please enter a Base Salary in the sidebar first.");
    
    txns.push({ id: Date.now(), desc: 'Monthly Salary', amt: salaryAmt, cat: 'Salary' });
    saveState(); updateMetrics(); renderLedger();
});

$('btnClearData').addEventListener('click', () => {
    if (!confirm("Wipe all data? This cannot be undone.")) return;
    localStorage.removeItem('trackerPro_txns');
    localStorage.removeItem('trackerPro_salary');
    localStorage.removeItem('trackerPro_budget');
    txns = []; UI.salary.value = ''; UI.budget.value = ''; UI.search.value = '';
    updateMetrics(); renderLedger();
});

UI.form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const desc = UI.desc.value.trim();
    const rawAmt = Math.abs(parseFloat(UI.amt.value.trim()));
    
    // NAYA LOGIC: Read from the correct dropdown based on the active CSS Radio State
    const selectedType = document.querySelector('input[name="transactionType"]:checked').value;
    const cat = selectedType === 'expense' ? $('inputCategoryExpense').value : $('inputCategoryIncome').value;

    if (!desc || isNaN(rawAmt)) return alert("Please provide a valid description and amount.");

    const finalAmount = selectedType === 'expense' ? -rawAmt : rawAmt;

    txns.push({ id: Date.now(), desc, amt: finalAmount, cat });

    saveState();
    updateMetrics();
    renderLedger(UI.search.value); 

    UI.form.reset();
    UI.desc.focus();
});

/* ==========================================
   7. BOOTSTRAP
   ========================================== */
updateMetrics();
renderLedger();