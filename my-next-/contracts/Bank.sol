// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract DecentralizedBank is AutomationCompatibleInterface {
    // Existing mappings
    mapping(address => uint256) public balances;
    mapping(address => Transaction[]) public history;

    // New lending functionality
    struct Loan {
        uint256 id;
        address borrower;
        uint256 bitcoinCollateral; // Amount of Bitcoin collateral (in BTC * 10^8)
        uint256 loanAmount;        // Amount borrowed in ETH
        uint256 interestRate;      // Annual interest rate (basis points)
        uint256 startTime;
        uint256 dueDate;
        bool isActive;
        bool isLiquidated;
    }

    struct BitcoinPosition {
        uint256 totalCollateral;   // Total Bitcoin collateral (in BTC * 10^8)
        uint256 totalLoans;        // Total outstanding loans
        uint256 liquidationThreshold; // Collateral ratio threshold
    }

    // New scheduled payment functionality
    struct ScheduledPayment {
        uint256 id;
        address sender;
        address recipient;
        uint256 amount;
        uint256 frequency;         // Frequency in seconds (daily, weekly, monthly)
        uint256 nextPaymentTime;
        uint256 totalPayments;
        uint256 paymentsMade;
        bool isActive;
        string description;
    }

    // Lending mappings
    mapping(address => BitcoinPosition) public bitcoinPositions;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    
    // Scheduled payment mappings
    mapping(uint256 => ScheduledPayment) public scheduledPayments;
    mapping(address => uint256[]) public userScheduledPayments;
    uint256 public totalScheduledPayments;
    
    // Global state
    uint256 public totalLoans;
    uint256 public totalBitcoinCollateral;
    uint256 public constant LIQUIDATION_THRESHOLD = 150; // 150% collateral ratio
    uint256 public constant MIN_COLLATERAL_RATIO = 200;  // 200% minimum
    uint256 public constant BASE_INTEREST_RATE = 500;    // 5% annual rate

    // Events
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event Transferred(address indexed from, address indexed to, uint256 amount);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 bitcoinCollateral, uint256 loanAmount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanLiquidated(uint256 indexed loanId, address indexed borrower, uint256 collateralSeized);
    event BitcoinCollateralAdded(address indexed user, uint256 amount);
    event BitcoinCollateralRemoved(address indexed user, uint256 amount);
    
    // New scheduled payment events
    event ScheduledPaymentCreated(uint256 indexed paymentId, address indexed sender, address indexed recipient, uint256 amount, uint256 frequency);
    event ScheduledPaymentExecuted(uint256 indexed paymentId, address indexed sender, address indexed recipient, uint256 amount);
    event ScheduledPaymentCancelled(uint256 indexed paymentId, address indexed sender);
    event ScheduledPaymentUpdated(uint256 indexed paymentId, address indexed sender, uint256 newAmount, uint256 newFrequency);

    // Transaction history: deposit, withdraw, transfer, loan operations, scheduled payments
    enum TxType { 
        Deposit, 
        Withdraw, 
        TransferOut, 
        TransferIn, 
        LoanCreated, 
        LoanRepaid, 
        LoanLiquidated, 
        CollateralAdded, 
        CollateralRemoved,
        ScheduledPaymentCreated,
        ScheduledPaymentExecuted,
        ScheduledPaymentCancelled
    }

    struct Transaction {
        TxType txType;
        address counterparty;  // who you sent to / received from
        uint256 amount;
        uint256 timestamp;
        string description;    // Additional context for loan operations
    }

    // Existing functions remain the same
    function deposit() external payable {
        require(msg.value > 0, "Must deposit more than 0");
        balances[msg.sender] += msg.value;
        history[msg.sender].push(Transaction(TxType.Deposit, address(0), msg.value, block.timestamp, "ETH Deposit"));
        emit Deposited(msg.sender, msg.value, balances[msg.sender]);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Must withdraw more than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        history[msg.sender].push(Transaction(TxType.Withdraw, address(0), amount, block.timestamp, "ETH Withdrawal"));
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }

    function transfer(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(to).transfer(amount);
        history[msg.sender].push(Transaction(TxType.TransferOut, to, amount, block.timestamp, "ETH Transfer Out"));
        history[to].push(Transaction(TxType.TransferIn, msg.sender, amount, block.timestamp, "ETH Transfer In"));
        emit Transferred(msg.sender, to, amount);
    }

    // New Bitcoin lending functions

    /**
     * @dev Add Bitcoin collateral to user's position
     * @param bitcoinAmount Amount of Bitcoin in BTC * 10^8 (e.g., 1 BTC = 100000000)
     */
    function addBitcoinCollateral(uint256 bitcoinAmount) external {
        require(bitcoinAmount > 0, "Must add collateral");
        
        BitcoinPosition storage position = bitcoinPositions[msg.sender];
        position.totalCollateral += bitcoinAmount;
        totalBitcoinCollateral += bitcoinAmount;
        
        history[msg.sender].push(Transaction(
            TxType.CollateralAdded, 
            address(0), 
            bitcoinAmount, 
            block.timestamp, 
            "Bitcoin Collateral Added"
        ));
        
        emit BitcoinCollateralAdded(msg.sender, bitcoinAmount);
    }

    /**
     * @dev Remove Bitcoin collateral (only if no active loans)
     * @param bitcoinAmount Amount of Bitcoin to remove in BTC * 10^8
     */
    function removeBitcoinCollateral(uint256 bitcoinAmount) external {
        require(bitcoinAmount > 0, "Must specify amount");
        
        BitcoinPosition storage position = bitcoinPositions[msg.sender];
        require(position.totalCollateral >= bitcoinAmount, "Insufficient collateral");
        require(position.totalLoans == 0, "Cannot remove collateral with active loans");
        
        position.totalCollateral -= bitcoinAmount;
        totalBitcoinCollateral -= bitcoinAmount;
        
        history[msg.sender].push(Transaction(
            TxType.CollateralRemoved, 
            address(0), 
            bitcoinAmount, 
            block.timestamp, 
            "Bitcoin Collateral Removed"
        ));
        
        emit BitcoinCollateralRemoved(msg.sender, bitcoinAmount);
    }

    /**
     * @dev Create a new loan backed by Bitcoin collateral
     * @param bitcoinCollateral Amount of Bitcoin collateral in BTC * 10^8
     * @param loanAmount Amount to borrow in ETH
     * @param loanDuration Duration of loan in days
     */
    function createLoan(uint256 bitcoinCollateral, uint256 loanAmount, uint256 loanDuration) external {
        require(bitcoinCollateral > 0, "Must provide collateral");
        require(loanAmount > 0, "Must specify loan amount");
        require(loanDuration > 0, "Must specify loan duration");
        
        // Check if user has enough Bitcoin collateral
        BitcoinPosition storage position = bitcoinPositions[msg.sender];
        require(position.totalCollateral >= bitcoinCollateral, "Insufficient Bitcoin collateral");
        
        // Calculate collateral ratio (assuming 1 BTC = 50 ETH for demo)
        uint256 collateralValue = (bitcoinCollateral * 50 * 1e18) / 1e8; // Convert BTC * 10^8 to ETH value
        uint256 collateralRatio = (collateralValue * 100) / loanAmount;
        require(collateralRatio >= MIN_COLLATERAL_RATIO, "Insufficient collateral ratio");
        
        // Create loan
        uint256 loanId = totalLoans++;
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            bitcoinCollateral: bitcoinCollateral,
            loanAmount: loanAmount,
            interestRate: BASE_INTEREST_RATE,
            startTime: block.timestamp,
            dueDate: block.timestamp + (loanDuration * 1 days),
            isActive: true,
            isLiquidated: false
        });
        
        // Update user's position
        position.totalLoans += loanAmount;
        userLoans[msg.sender].push(loanId);
        
        // Transfer loan amount to borrower
        balances[msg.sender] += loanAmount;
        
        // Record transaction
        history[msg.sender].push(Transaction(
            TxType.LoanCreated, 
            address(0), 
            loanAmount, 
            block.timestamp, 
            string(abi.encodePacked("Loan Created - ID: ", uint2str(loanId)))
        ));
        
        emit LoanCreated(loanId, msg.sender, bitcoinCollateral, loanAmount);
    }

    /**
     * @dev Repay a loan
     * @param loanId ID of the loan to repay
     */
    function repayLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not the loan borrower");
        require(loan.isActive, "Loan is not active");
        require(!loan.isLiquidated, "Loan is liquidated");
        require(msg.value >= loan.loanAmount, "Insufficient repayment amount");
        
        // Calculate interest (simple interest)
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.loanAmount * loan.interestRate * timeElapsed) / (365 days * 10000);
        uint256 totalRepayment = loan.loanAmount + interest;
        
        require(msg.value >= totalRepayment, "Insufficient repayment including interest");
        
        // Update loan status
        loan.isActive = false;
        
        // Update user's position
        BitcoinPosition storage position = bitcoinPositions[msg.sender];
        position.totalLoans -= loan.loanAmount;
        
        // Record transaction
        history[msg.sender].push(Transaction(
            TxType.LoanRepaid, 
            address(0), 
            totalRepayment, 
            block.timestamp, 
            string(abi.encodePacked("Loan Repaid - ID: ", uint2str(loanId)))
        ));
        
        emit LoanRepaid(loanId, msg.sender, totalRepayment);
    }

    /**
     * @dev Liquidate a loan if collateral ratio falls below threshold
     * @param loanId ID of the loan to liquidate
     */
    function liquidateLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        require(!loan.isLiquidated, "Loan already liquidated");
        
        // Check if loan is overdue or collateral ratio is too low
        bool isOverdue = block.timestamp > loan.dueDate;
        bool isUnderCollateralized = getCollateralRatio(loanId) < LIQUIDATION_THRESHOLD;
        
        require(isOverdue || isUnderCollateralized, "Loan does not meet liquidation criteria");
        
        // Liquidate the loan
        loan.isLiquidated = true;
        loan.isActive = false;
        
        // Seize collateral (in a real implementation, this would transfer Bitcoin)
        BitcoinPosition storage position = bitcoinPositions[loan.borrower];
        position.totalCollateral -= loan.bitcoinCollateral;
        position.totalLoans -= loan.loanAmount;
        totalBitcoinCollateral -= loan.bitcoinCollateral;
        
        // Record transaction
        history[loan.borrower].push(Transaction(
            TxType.LoanLiquidated, 
            address(0), 
            loan.bitcoinCollateral, 
            block.timestamp, 
            string(abi.encodePacked("Loan Liquidated - ID: ", uint2str(loanId)))
        ));
        
        emit LoanLiquidated(loanId, loan.borrower, loan.bitcoinCollateral);
    }

    // View functions
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function getHistory(address user) external view returns (Transaction[] memory) {
        return history[user];
    }

    function getBitcoinPosition(address user) external view returns (BitcoinPosition memory) {
        return bitcoinPositions[user];
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }

    function getCollateralRatio(uint256 loanId) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        if (loan.loanAmount == 0) return 0;
        
        // Calculate collateral value (assuming 1 BTC = 50 ETH for demo)
        uint256 collateralValue = (loan.bitcoinCollateral * 50 * 1e18) / 1e8;
        return (collateralValue * 100) / loan.loanAmount;
    }

    function getTotalLoans() external view returns (uint256) {
        return totalLoans;
    }

    function getTotalBitcoinCollateral() external view returns (uint256) {
        return totalBitcoinCollateral;
    }

    /**
     * @dev Calculate the total repayment amount for a loan (principal + interest)
     * @param loanId ID of the loan
     * @return totalRepayment Total amount to repay including interest
     */
    function getRepaymentAmount(uint256 loanId) external view returns (uint256 totalRepayment) {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan is not active");
        
        // Calculate interest (simple interest)
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.loanAmount * loan.interestRate * timeElapsed) / (365 days * 10000);
        totalRepayment = loan.loanAmount + interest;
    }

    // Scheduled Payment Functions

    /**
     * @dev Create a new scheduled payment
     * @param recipient Address to send payments to
     * @param amount Amount to send in each payment
     * @param frequency Frequency in seconds (86400 for daily, 604800 for weekly, 2592000 for monthly)
     * @param totalPayments Total number of payments to make (0 for unlimited)
     * @param description Description of the scheduled payment
     */
    function createScheduledPayment(
        address recipient,
        uint256 amount,
        uint256 frequency,
        uint256 totalPayments,
        string memory description
    ) external {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(frequency >= 3600, "Frequency must be at least 1 hour");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        uint256 paymentId = totalScheduledPayments++;
        scheduledPayments[paymentId] = ScheduledPayment({
            id: paymentId,
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            frequency: frequency,
            nextPaymentTime: block.timestamp + frequency,
            totalPayments: totalPayments,
            paymentsMade: 0,
            isActive: true,
            description: description
        });
        
        userScheduledPayments[msg.sender].push(paymentId);
        
        // Record transaction
        history[msg.sender].push(Transaction(
            TxType.ScheduledPaymentCreated,
            recipient,
            amount,
            block.timestamp,
            string(abi.encodePacked("Scheduled Payment Created - ID: ", uint2str(paymentId)))
        ));
        
        emit ScheduledPaymentCreated(paymentId, msg.sender, recipient, amount, frequency);
    }

    /**
     * @dev Execute a scheduled payment (can be called by anyone)
     * @param paymentId ID of the scheduled payment to execute
     */
    function executeScheduledPayment(uint256 paymentId) external {
        ScheduledPayment storage payment = scheduledPayments[paymentId];
        require(payment.isActive, "Payment is not active");
        require(block.timestamp >= payment.nextPaymentTime, "Payment time not reached");
        require(balances[payment.sender] >= payment.amount, "Insufficient balance");
        
        // Check if payment limit reached
        if (payment.totalPayments > 0) {
            require(payment.paymentsMade < payment.totalPayments, "Payment limit reached");
        }
        
        // Transfer the payment
        balances[payment.sender] -= payment.amount;
        balances[payment.recipient] += payment.amount;
        
        // Update payment status
        payment.paymentsMade++;
        payment.nextPaymentTime = block.timestamp + payment.frequency;
        
        // Check if payment should be deactivated
        if (payment.totalPayments > 0 && payment.paymentsMade >= payment.totalPayments) {
            payment.isActive = false;
        }
        
        // Record transactions
        history[payment.sender].push(Transaction(
            TxType.ScheduledPaymentExecuted,
            payment.recipient,
            payment.amount,
            block.timestamp,
            string(abi.encodePacked("Scheduled Payment Executed - ID: ", uint2str(paymentId)))
        ));
        
        history[payment.recipient].push(Transaction(
            TxType.TransferIn,
            payment.sender,
            payment.amount,
            block.timestamp,
            string(abi.encodePacked("Scheduled Payment Received - ID: ", uint2str(paymentId)))
        ));
        
        emit ScheduledPaymentExecuted(paymentId, payment.sender, payment.recipient, payment.amount);
    }

    /**
     * @dev Cancel a scheduled payment
     * @param paymentId ID of the scheduled payment to cancel
     */
    function cancelScheduledPayment(uint256 paymentId) external {
        ScheduledPayment storage payment = scheduledPayments[paymentId];
        require(payment.sender == msg.sender, "Not the payment sender");
        require(payment.isActive, "Payment is not active");
        
        payment.isActive = false;
        
        // Record transaction
        history[msg.sender].push(Transaction(
            TxType.ScheduledPaymentCancelled,
            payment.recipient,
            0,
            block.timestamp,
            string(abi.encodePacked("Scheduled Payment Cancelled - ID: ", uint2str(paymentId)))
        ));
        
        emit ScheduledPaymentCancelled(paymentId, msg.sender);
    }

    /**
     * @dev Update a scheduled payment
     * @param paymentId ID of the scheduled payment to update
     * @param newAmount New amount for each payment
     * @param newFrequency New frequency in seconds
     */
    function updateScheduledPayment(uint256 paymentId, uint256 newAmount, uint256 newFrequency) external {
        ScheduledPayment storage payment = scheduledPayments[paymentId];
        require(payment.sender == msg.sender, "Not the payment sender");
        require(payment.isActive, "Payment is not active");
        require(newAmount > 0, "Amount must be greater than 0");
        require(newFrequency >= 3600, "Frequency must be at least 1 hour");
        
        payment.amount = newAmount;
        payment.frequency = newFrequency;
        
        emit ScheduledPaymentUpdated(paymentId, msg.sender, newAmount, newFrequency);
    }

    /**
     * @dev Get all scheduled payments for a user
     * @param user Address of the user
     * @return Array of scheduled payment IDs
     */
    function getUserScheduledPayments(address user) external view returns (uint256[] memory) {
        return userScheduledPayments[user];
    }

    /**
     * @dev Get a scheduled payment by ID
     * @param paymentId ID of the scheduled payment
     * @return Scheduled payment details
     */
    function getScheduledPayment(uint256 paymentId) external view returns (ScheduledPayment memory) {
        return scheduledPayments[paymentId];
    }

    /**
     * @dev Get all scheduled payments that are ready to be executed
     * @return Array of payment IDs ready for execution
     */
    function getReadyScheduledPayments() public view returns (uint256[] memory) {
        uint256[] memory readyPayments = new uint256[](totalScheduledPayments);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalScheduledPayments; i++) {
            ScheduledPayment storage payment = scheduledPayments[i];
            if (payment.isActive && 
                block.timestamp >= payment.nextPaymentTime && 
                balances[payment.sender] >= payment.amount) {
                readyPayments[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = readyPayments[i];
        }
        
        return result;
    }

    /**
     * @dev Get total number of scheduled payments
     * @return Total count of scheduled payments
     */
    function getTotalScheduledPayments() external view returns (uint256) {
        return totalScheduledPayments;
    }

    // Chainlink Keepers Functions for True Automation

    /**
     * @dev Check if any scheduled payments are ready for execution
     * This function is called by Chainlink Keepers to determine if upkeep is needed
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory readyPaymentIds = getReadyScheduledPayments();
        upkeepNeeded = readyPaymentIds.length > 0;
        performData = abi.encode(readyPaymentIds);
    }

    /**
     * @dev Execute all ready scheduled payments
     * This function is called by Chainlink Keepers when upkeep is needed
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory readyPaymentIds = abi.decode(performData, (uint256[]));
        
        for (uint256 i = 0; i < readyPaymentIds.length; i++) {
            uint256 paymentId = readyPaymentIds[i];
            ScheduledPayment storage payment = scheduledPayments[paymentId];
            
            // Double-check conditions before executing
            if (payment.isActive && 
                block.timestamp >= payment.nextPaymentTime && 
                balances[payment.sender] >= payment.amount) {
                
                // Execute the payment
                _executeScheduledPayment(paymentId);
            }
        }
    }

    /**
     * @dev Internal function to execute a scheduled payment
     * @param paymentId ID of the scheduled payment to execute
     */
    function _executeScheduledPayment(uint256 paymentId) internal {
        ScheduledPayment storage payment = scheduledPayments[paymentId];
        
        // Transfer the payment
        balances[payment.sender] -= payment.amount;
        balances[payment.recipient] += payment.amount;
        
        // Update payment status
        payment.paymentsMade++;
        payment.nextPaymentTime = block.timestamp + payment.frequency;
        
        // Check if payment should be deactivated
        if (payment.totalPayments > 0 && payment.paymentsMade >= payment.totalPayments) {
            payment.isActive = false;
        }
        
        // Record transactions
        history[payment.sender].push(Transaction(
            TxType.ScheduledPaymentExecuted,
            payment.recipient,
            payment.amount,
            block.timestamp,
            string(abi.encodePacked("Automated Payment Executed - ID: ", uint2str(paymentId)))
        ));
        
        history[payment.recipient].push(Transaction(
            TxType.TransferIn,
            payment.sender,
            payment.amount,
            block.timestamp,
            string(abi.encodePacked("Automated Payment Received - ID: ", uint2str(paymentId)))
        ));
        
        emit ScheduledPaymentExecuted(paymentId, payment.sender, payment.recipient, payment.amount);
    }

    /**
     * @dev Register this contract with Chainlink Keepers
     * Call this after deploying the contract
     */
    function registerWithKeepers() external {
        // This function can be used to register the contract with Chainlink Keepers
        // The actual registration happens off-chain through Chainlink's UI
        emit ScheduledPaymentCreated(0, msg.sender, address(0), 0, 0);
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
