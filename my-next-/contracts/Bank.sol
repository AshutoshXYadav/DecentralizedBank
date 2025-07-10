// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecentralizedBank {
    // Existing mappings
    mapping(address => uint256) public balances;
    mapping(address => Transaction[]) public history;

    // New lending functionality
    struct Loan {
        uint256 id;
        address borrower;
        uint256 bitcoinCollateral; // Amount of Bitcoin collateral (in satoshis)
        uint256 loanAmount;        // Amount borrowed in ETH
        uint256 interestRate;      // Annual interest rate (basis points)
        uint256 startTime;
        uint256 dueDate;
        bool isActive;
        bool isLiquidated;
    }

    struct BitcoinPosition {
        uint256 totalCollateral;   // Total Bitcoin collateral
        uint256 totalLoans;        // Total outstanding loans
        uint256 liquidationThreshold; // Collateral ratio threshold
    }

    // Lending mappings
    mapping(address => BitcoinPosition) public bitcoinPositions;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    
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

    // Transaction history: deposit, withdraw, transfer, loan operations
    enum TxType { Deposit, Withdraw, TransferOut, TransferIn, LoanCreated, LoanRepaid, LoanLiquidated, CollateralAdded, CollateralRemoved }

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
     * @param bitcoinAmount Amount of Bitcoin in satoshis
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
     * @param bitcoinAmount Amount of Bitcoin to remove in satoshis
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
     * @param bitcoinCollateral Amount of Bitcoin collateral in satoshis
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
        uint256 collateralValue = (bitcoinCollateral * 50 * 1e18) / 1e8; // Convert satoshis to ETH value
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
