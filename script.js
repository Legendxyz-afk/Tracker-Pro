/* ==========================================
   1. UTILITIES & DOM MAPPING
   ========================================== */
// Helper function to drastically reduce document.getElementById repetition
const $ = (id) => document.getElementById(id);

const UI = {
    marketing: $('marketingSiteWrapper'),
    dashboard: $('appDashboardWrapper'),
    balance: $('displayMasterBalance'),
    income: $('displayTotalIncome'),
    expense: $('displayTotalExpense'),
    ledger: $('transactionLedgerList'),
    form: $('financialEntryForm'),
    desc: $('inputTransactionDesc'),
    amt: $('inputTransactionAmt'),
    salary: $('inputBaseSalary')
};

/* ==========================================
   2. STATE MANAGEMENT & LOCAL STORAGE
   ========================================== */
let txns = JSON.parse(localStorage.getItem('trackerPro_txns')) || [];
UI.salary.value = localStorage.getItem('trackerPro_salary') || '';

const saveState = () => {
    localStorage.setItem('trackerPro_txns', JSON.stringify(txns));
    localStorage.setItem('trackerPro_salary', UI.salary.value);
};

/* ==========================================
   3. SPA ROUTING (VIEW CONTROLLER)
   ========================================== */
const toggleView = (isOpening) => {
    UI.marketing.classList.toggle('hiddenView', isOpening);
    UI.dashboard.classList.toggle('hiddenView', !isOpening);
    if (isOpening) UI.dashboard.classList.add('fadeAndSlideIn');
    window.scrollTo(0, 0);
};

/* ==========================================
   4. CORE FINANCIAL MATH & DOM UPDATES
   ========================================== */
const updateMetrics = () => {
    const baseSalary = parseFloat(UI.salary.value) || 0;
    const amounts = txns.map(t => t.amt);
    
    const inc = amounts.filter(a => a > 0).reduce((acc, val) => acc + val, 0) + baseSalary;
    const exp = amounts.filter(a => a < 0).reduce((acc, val) => acc + val, 0);
    const bal = amounts.reduce((acc, val) => acc + val, 0) + baseSalary;

    UI.income.innerText = `+₹${inc.toFixed(2)}`;
    UI.expense.innerText = `-₹${Math.abs(exp).toFixed(2)}`;
    UI.balance.innerText = `${bal < 0 ? '-' : ''}₹${Math.abs(bal).toFixed(2)}`;
};

const renderItem = ({ desc, amt }) => {
    const li = document.createElement('li');
    li.className = `ledgerItem ${amt > 0 ? 'incomeItem' : 'expenseItem'}`;
    li.innerHTML = `
        <div class="ledgerItemDetails">
            <span class="ledgerItemDesc">${desc}</span>
            <span class="ledgerItemDate">Just now</span>
        </div>
        <span class="ledgerItemValue">${amt > 0 ? '+' : '-'}₹${Math.abs(amt).toFixed(2)}</span>
    `;
    UI.ledger.prepend(li); // Adds to top of list
};

const triggerAnimation = (amt) => {
    const el = document.createElement('div');
    el.className = `animatedMoneyFloat ${amt > 0 ? 'floatIncomeText' : 'floatExpenseText'}`;
    el.textContent = `${amt > 0 ? '+' : '-'}₹${Math.abs(amt).toFixed(2)} ${amt > 0 ? '💵' : '💸'}`;
    
    document.querySelector('.masterBalanceSection').appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
};

/* ==========================================
   5. EVENT LISTENERS
   ========================================== */
// Navigation Events
$('buttonLaunchDashboard').addEventListener('click', () => toggleView(true));
$('navLaunchDashboard').addEventListener('click', () => toggleView(true));
$('buttonCloseDashboard').addEventListener('click', () => toggleView(false));

// Salary Input Event (Real-time update)
UI.salary.addEventListener('input', () => { updateMetrics(); saveState(); });

// Clear Data Event
$('btnClearData').addEventListener('click', () => {
    if (!confirm("Wipe all data? This cannot be undone.")) return;
    localStorage.clear();
    txns = [];
    UI.salary.value = '';
    UI.ledger.innerHTML = '';
    updateMetrics();
});

// Form Submission Event
UI.form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const desc = UI.desc.value.trim();
    // User hamesha positive number type karega (Math.abs ensures this)
    const rawAmt = Math.abs(parseFloat(UI.amt.value.trim()));

    if (!desc || isNaN(rawAmt)) return alert("Please provide a valid description and amount.");

    /* LOGIC: Check karo ki form me konsa radio button selected hai. 
       Agar 'expense' hai, toh rawAmt ko -1 se multiply kar do, warna positive rehne do. */
    const selectedType = document.querySelector('input[name="transactionType"]:checked').value;
    const finalAmount = selectedType === 'expense' ? -rawAmt : rawAmt;

    // Naye transaction object me final calculated amount save karo
    const newTxn = { desc, amt: finalAmount };
    txns.push(newTxn);

    renderItem(newTxn);
    updateMetrics();
    triggerAnimation(finalAmount);
    saveState();

    UI.form.reset();
    UI.desc.focus();
});

/* ==========================================
   6. BOOTSTRAP (Initialize on Load)
   ========================================== */
txns.forEach(renderItem);
updateMetrics();