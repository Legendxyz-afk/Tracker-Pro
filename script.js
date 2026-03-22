const displayMasterBalance = document.getElementById('displayMasterBalance');
const displayTotalIncome = document.getElementById('displayTotalIncome');
const displayTotalExpense = document.getElementById('displayTotalExpense');
const transactionLedgerList = document.getElementById('transactionLedgerList');
const financialEntryForm = document.getElementById('financialEntryForm');
const inputTransactionDesc = document.getElementById('inputTransactionDesc');
const inputTransactionAmt = document.getElementById('inputTransactionAmt');

/* ==========================================
   PHASE 1: ENTERPRISE LOGIC HOOKS
   ========================================== */

/*
  HOOK 1: UI Rendering
  Jab real data aayega, ye function naye <li class="ledgerItem"> create karke DOM me push karega.
*/
function renderLedgerItemToDOM(transactionData) {
    console.log("[System Hook] Injecting transaction to Ledger UI:", transactionData);
}

/*
  HOOK 2: Financial Math
  Transactions array parse karke Income, Expense, aur Master Balance calculate karega.
*/
function recalculateFinancialMetrics() {
    console.log("[System Hook] Recalculating Master Balance & Metrics...");
}

/*
  HOOK 3: Data Persistence
  State ko browser ke LocalStorage me save karega taaki page reload par data persist kare.
*/
function saveStateToLocal() {
    console.log("[System Hook] Committing current state to LocalStorage...");
}

/* ==========================================
   FORM HANDLING & VALIDATION
   ========================================== */

/*
  CORE HANDLER: Transaction Entry
  Jab user "Save Transaction" click karega, tab page refresh rokna aur data capture karna.
*/
function processTransactionEntry(event) {
    /* Form submission page ko reload na kare, isliye preventDefault zaroori hai. 
       Ye Single Page Application (SPA) architecture ka first rule hai. */
    event.preventDefault();

    // Inputs se extra whitespace remove kar rahe hain
    const descValue = inputTransactionDesc.value.trim();
    const amtValue = inputTransactionAmt.value.trim();

    // Strict Validation: Agar input blank hai toh early return kar jao.
    if (!descValue || !amtValue) {
        alert("Transaction validation failed: Missing description or amount.");
        return;
    }

    // Amount ko number type me convert kar rahe hain calculations ke liye
    const parsedAmount = parseFloat(amtValue);

    console.log("[Success] Data validated and ready for processing:", {
        description: descValue,
        amount: parsedAmount 
    });

    // Form submission ke baad UX maintain karne ke liye inputs clear kar do
    inputTransactionDesc.value = '';
    inputTransactionAmt.value = '';
    
    // UX improvement: Focus wapas description field pe set kar do next entry ke liye
    inputTransactionDesc.focus();
}

/* Event Listener ko form ke 'submit' event par bind kiya hai */
financialEntryForm.addEventListener('submit', processTransactionEntry);