const displayMasterBalance = document.getElementById('displayMasterBalance');
const displayTotalIncome = document.getElementById('displayTotalIncome');
const displayTotalExpense = document.getElementById('displayTotalExpense');
const transactionLedgerList = document.getElementById('transactionLedgerList');
const financialEntryForm = document.getElementById('financialEntryForm');
const inputTransactionDesc = document.getElementById('inputTransactionDesc');
const inputTransactionAmt = document.getElementById('inputTransactionAmt');
const landingViewWrapper = document.getElementById('landingViewWrapper');
const marketingSiteWrapper = document.getElementById('marketingSiteWrapper');
const appDashboardWrapper = document.getElementById('appDashboardWrapper');
const buttonLaunchDashboard = document.getElementById('buttonLaunchDashboard');
const navLaunchDashboard = document.getElementById('navLaunchDashboard'); 
const buttonCloseDashboard = document.getElementById('buttonCloseDashboard');

/* ==========================================
   STATE MANAGEMENT (Single Source of Truth)
   ========================================== */
/* Ye array hamare application ka database act karega. 
   Sari calculations ishi array ke data par base hongi. */
let globalTransactionsArray = [];

/* ==========================================
   CORE LOGIC & ALGORITHMS
   ========================================== */
function openDashboardView() {
    // 1. Poori marketing site ko hide karo
    marketingSiteWrapper.classList.add('hiddenView');
    
    // 2. Dashboard ko show karo
    appDashboardWrapper.classList.remove('hiddenView');
    appDashboardWrapper.classList.add('fadeAndSlideIn');
    
    // UX Polish: Jab dashboard khule toh page ke top par scroll kar do
    window.scrollTo(0, 0);

    console.log("[System] Routed to Dashboard SPA.");
}

function closeDashboardView() {
    appDashboardWrapper.classList.add('hiddenView');
    appDashboardWrapper.classList.remove('fadeAndSlideIn');
    
    marketingSiteWrapper.classList.remove('hiddenView');
    marketingSiteWrapper.classList.add('fadeAndSlideIn');
    
    // Wapas aane par top par scroll karna achha practice hai
    window.scrollTo(0, 0);

    console.log("[System] Routed to Marketing Site.");
}

/* Event Listeners for Navigation */
buttonLaunchDashboard.addEventListener('click', openDashboardView);
navLaunchDashboard.addEventListener('click', openDashboardView); // Do buttons ab same action karte hain
buttonCloseDashboard.addEventListener('click', closeDashboardView);

/* ==========================================
   SMOOTH SCROLL FOR NAVBAR
   ========================================== */
/* Ye code ensure karega ki jab user nav links par click kare toh page smoothly glide kare */
document.querySelectorAll('.navItem').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

/* Event Listeners for Navigation */
buttonLaunchDashboard.addEventListener('click', openDashboardView);
buttonCloseDashboard.addEventListener('click', closeDashboardView);
/*
  FUNCTION 1: DOM me Transaction List Item Inject Karna
  Ye function ek naya <li> element banayega aur usko History UI me dikhayega.
*/
function renderLedgerItemToDOM(transactionObject) {
    // Naya list item create kar rahe hain
    const newListItemElement = document.createElement('li');
    
    // Amount check kar rahe hain taaki decide kar sakein ki class 'incomeItem' hogi ya 'expenseItem'
    const transactionTypeClass = transactionObject.transactionAmount > 0 ? 'incomeItem' : 'expenseItem';
    
    // Class assign ki (taaki CSS se green ya red color apply ho jaye)
    newListItemElement.classList.add('ledgerItem', transactionTypeClass);

    // Math.abs() use kiya taaki negative minus sign double na dikhe (-$ vs --$).
    const formattedAmountText = `${transactionObject.transactionAmount > 0 ? '+' : '-'}$${Math.abs(transactionObject.transactionAmount).toFixed(2)}`;

    // HTML structure ko dynamically build karke innerHTML me daal rahe hain
    newListItemElement.innerHTML = `
        <div class="ledgerItemDetails">
            <span class="ledgerItemDesc">${transactionObject.transactionDescription}</span>
            <span class="ledgerItemDate">Just now</span>
        </div>
        <span class="ledgerItemValue">${formattedAmountText}</span>
    `;

    // Final element ko list me sabse upar append kar rahe hain
    transactionLedgerList.appendChild(newListItemElement);
}

/*
  FUNCTION 2: Financial Math & Real-Time Balance Update
  Ye function array ko parse karke Income, Expense, aur Master Balance calculate karega.
*/
function recalculateFinancialMetrics() {
    // Array me se sirf amounts extract kar rahe hain ek naye array me using map()
    const allTransactionAmounts = globalTransactionsArray.map(txn => txn.transactionAmount);

    // 1. Calculate Total Income: Sirf positive values ko filter karke add (reduce) karo
    const totalIncomeValue = allTransactionAmounts
        .filter(amount => amount > 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // 2. Calculate Total Expense: Sirf negative values ko filter karke add (reduce) karo
    const totalExpenseValue = allTransactionAmounts
        .filter(amount => amount < 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // 3. Calculate Master Balance: Saari values ko directly add kar do
    const masterBalanceValue = allTransactionAmounts
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // 4. Update the DOM Elements with formatted strings (.toFixed(2) forces 2 decimal places)
    displayTotalIncome.innerText = `+$${totalIncomeValue.toFixed(2)}`;
    
    // Math.abs se negative sign hata rahe hain taaki display me '-$150' aae, '$-150' nahi
    displayTotalExpense.innerText = `-$${Math.abs(totalExpenseValue).toFixed(2)}`;
    
    // Agar overall balance negative ho gaya toh sign adjust karna padega
    const balanceSignIndicator = masterBalanceValue < 0 ? '-' : '';
    displayMasterBalance.innerText = `${balanceSignIndicator}$${Math.abs(masterBalanceValue).toFixed(2)}`;
}

/* ==========================================
   FORM HANDLING & VALIDATION
   ========================================== */
function triggerMoneyAnimation(transactionAmount) {
    const masterBalanceContainer = document.querySelector('.masterBalanceSection');
    
    // Step 1: Element Create karo
    const floatingAnimationElement = document.createElement('div');
    floatingAnimationElement.classList.add('animatedMoneyFloat');

    // Step 2: Amount check karke direction aur text decide karo
    if (transactionAmount > 0) {
        floatingAnimationElement.textContent = `+$${transactionAmount.toFixed(2)} 💵`;
        floatingAnimationElement.classList.add('floatIncomeText');
    } else {
        // Expense ke liye negative sign hata kar handle kar rahe hain taaki neat dikhe
        floatingAnimationElement.textContent = `-$${Math.abs(transactionAmount).toFixed(2)} 💸`;
        floatingAnimationElement.classList.add('floatExpenseText');
    }

    // Step 3: DOM me inject karo
    masterBalanceContainer.appendChild(floatingAnimationElement);

    // Step 4: Garbage Collection (Destroy element after animation)
    // CSS animation 1.2 seconds ki hai, toh hum 1200ms baad isko DOM se uda denge
    setTimeout(() => {
        floatingAnimationElement.remove();
    }, 1200);
}
function processTransactionEntry(event) {
    // Form submission page ko reload na kare
    event.preventDefault();

    const descValue = inputTransactionDesc.value.trim();
    const amtValue = inputTransactionDesc.value.trim(); // Wait, dry run spotted a bug here! Let's fix it instantly.
    
    // Correction: Amount input se leni hai, description se nahi.
    const actualAmtValue = inputTransactionAmt.value.trim(); 

    if (!descValue || !actualAmtValue) {
        alert("Transaction validation failed: Missing description or amount.");
        return;
    }

    // Step 1: Naya transaction object create karo
    const newTransactionObject = {
        transactionId: Math.floor(Math.random() * 1000000), // Ek unique ID generate ki
        transactionDescription: descValue,
        transactionAmount: parseFloat(actualAmtValue) // String ko decimal number me convert kiya
    };

    // Step 2: Object ko global state array me push karo
    globalTransactionsArray.push(newTransactionObject);

    // Step 3: UI update functions ko call karo
    renderLedgerItemToDOM(newTransactionObject);
    recalculateFinancialMetrics();
    triggerMoneyAnimation(newTransactionObject.transactionAmount);
    // Step 4: Form clear karo
    inputTransactionDesc.value = '';
    inputTransactionAmt.value = '';
    inputTransactionDesc.focus();
}

/* Event Listener setup */
financialEntryForm.addEventListener('submit', processTransactionEntry);