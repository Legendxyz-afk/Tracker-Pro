const marketingSiteWrapper = document.getElementById('marketingSiteWrapper');
const appDashboardWrapper = document.getElementById('appDashboardWrapper');
const displayMasterBalance = document.getElementById('displayMasterBalance');
const displayTotalIncome = document.getElementById('displayTotalIncome');
const displayTotalExpense = document.getElementById('displayTotalExpense');
const transactionLedgerList = document.getElementById('transactionLedgerList');
const financialEntryForm = document.getElementById('financialEntryForm');
const inputTransactionDesc = document.getElementById('inputTransactionDesc');
const inputTransactionAmt = document.getElementById('inputTransactionAmt');

let globalTransactionsArray = [];

/* ==========================================
   1. ULTRA-LEAN VIEW CONTROLLER (SPA ROUTING)
   ========================================== */
/* Ek single compressed function dono open/close states ko handle kar raha hai using classList.toggle */
const toggleDashboardView = (isOpening) => {
    marketingSiteWrapper.classList.toggle('hiddenView', isOpening);
    appDashboardWrapper.classList.toggle('hiddenView', !isOpening);
    
    if (isOpening) appDashboardWrapper.classList.add('fadeAndSlideIn');
    window.scrollTo(0, 0); // Reset scroll position
};

document.getElementById('buttonLaunchDashboard').addEventListener('click', () => toggleDashboardView(true));
document.getElementById('navLaunchDashboard').addEventListener('click', () => toggleDashboardView(true));
document.getElementById('buttonCloseDashboard').addEventListener('click', () => toggleDashboardView(false));

/* ==========================================
   2. EVENT-DRIVEN MICRO-ANIMATION
   ========================================== */
function triggerMoneyAnimation(amount) {
    const el = document.createElement('div');
    
    // Ternary operators se multiple if-else lines ko ek single string assignment me compress kiya
    el.className = `animatedMoneyFloat ${amount > 0 ? 'floatIncomeText' : 'floatExpenseText'}`;
    el.textContent = `${amount > 0 ? '+' : '-'}$${Math.abs(amount).toFixed(2)} ${amount > 0 ? '💵' : '💸'}`;
    
    document.querySelector('.masterBalanceSection').appendChild(el);

    /* JS setTimeout use karne ki jagah native CSS event 'animationend' sun rahe hain. 
       Jaise hi CSS animation khatam hogi, element automatically delete ho jayega. 
       { once: true } ensures memory leak na ho. */
    el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* ==========================================
   3. CORE FINANCIAL LOGIC & UI UPDATES
   ========================================== */
function renderLedgerItemToDOM(txn) {
    const li = document.createElement('li');
    li.classList.add('ledgerItem', txn.transactionAmount > 0 ? 'incomeItem' : 'expenseItem');
    
    li.innerHTML = `
        <div class="ledgerItemDetails">
            <span class="ledgerItemDesc">${txn.transactionDescription}</span>
            <span class="ledgerItemDate">Just now</span>
        </div>
        <span class="ledgerItemValue">${txn.transactionAmount > 0 ? '+' : '-'}$${Math.abs(txn.transactionAmount).toFixed(2)}</span>
    `;
    transactionLedgerList.prepend(li); // .prepend() naye item ko list me sabse upar dalta hai
}

function recalculateFinancialMetrics() {
    const amounts = globalTransactionsArray.map(t => t.transactionAmount);
    
    const income = amounts.filter(a => a > 0).reduce((acc, val) => acc + val, 0);
    const expense = amounts.filter(a => a < 0).reduce((acc, val) => acc + val, 0);
    const balance = amounts.reduce((acc, val) => acc + val, 0);

    displayTotalIncome.innerText = `+$${income.toFixed(2)}`;
    displayTotalExpense.innerText = `-$${Math.abs(expense).toFixed(2)}`;
    displayMasterBalance.innerText = `${balance < 0 ? '-' : ''}$${Math.abs(balance).toFixed(2)}`;
}

/* ==========================================
   4. FORM HANDLING
   ========================================== */
financialEntryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const desc = inputTransactionDesc.value.trim();
    const amt = parseFloat(inputTransactionAmt.value.trim());

    if (!desc || isNaN(amt)) return alert("Please provide a valid description and amount.");

    const newTxn = { transactionDescription: desc, transactionAmount: amt };
    globalTransactionsArray.push(newTxn);

    renderLedgerItemToDOM(newTxn);
    recalculateFinancialMetrics();
    triggerMoneyAnimation(amt);

    financialEntryForm.reset(); // manual value='' ki jagah native HTML reset method
    inputTransactionDesc.focus();
});