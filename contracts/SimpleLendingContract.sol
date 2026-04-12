// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleLendingContract {

    enum LoanState { Requested, Funded, Repaid, Defaulted }

    struct Loan {
        uint id;
        address payable borrower;
        address payable lender;
        uint requestedAmount;
        uint collateralAmount;
        uint repayAmount;
        uint amountRepaid;
        uint interestRate;
        uint duration;
        LoanState state;
        uint createdAt;
    }

    uint public nextLoanId = 1;

    mapping(uint => Loan) public loans;
    mapping(address => uint[]) private borrowerLoanIds;
    mapping(address => uint[]) private lenderLoanIds;
    mapping(address => uint) public creditScores;
    mapping(address => uint) public lenderXP;

    event LoanRequested(uint loanId, address borrower, uint amount);
    event LoanFunded(uint loanId, address lender);
    event LoanRepaid(uint loanId, uint amount);

    // ─── Request a loan with collateral ────────────────────────────────────
    // _amount: amount borrower wants (in wei)
    // _duration: loan term in seconds
    // msg.value: collateral (must be >= 50% of _amount)
    function requestLoan(uint _amount, uint _duration) external payable {
        require(_amount > 0, "Amount must be > 0");
        require(msg.value >= _amount / 2, "Collateral must be >= 50% of loan");
        require(_duration > 0, "Duration must be > 0");

        // 10% interest
        uint repay = _amount + (_amount * 10 / 100);

        uint id = nextLoanId++;
        loans[id] = Loan({
            id: id,
            borrower: payable(msg.sender),
            lender: payable(address(0)),
            requestedAmount: _amount,
            collateralAmount: msg.value,
            repayAmount: repay,
            amountRepaid: 0,
            interestRate: 10,
            duration: _duration,
            state: LoanState.Requested,
            createdAt: block.timestamp
        });

        borrowerLoanIds[msg.sender].push(id);

        // Initialize credit score for new users
        if (creditScores[msg.sender] == 0) {
            creditScores[msg.sender] = 50;
        }

        emit LoanRequested(id, msg.sender, _amount);
    }

    // ─── Lender funds a loan ────────────────────────────────────────────────
    function fundLoan(uint _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.state == LoanState.Requested, "Loan not available");
        require(msg.sender != loan.borrower, "Cannot fund own loan");
        require(msg.value == loan.requestedAmount, "Must send exact loan amount");

        loan.lender = payable(msg.sender);
        loan.state = LoanState.Funded;
        lenderLoanIds[msg.sender].push(_loanId);

        // Transfer requested amount to borrower
        loan.borrower.transfer(loan.requestedAmount);

        lenderXP[msg.sender] += 10;

        emit LoanFunded(_loanId, msg.sender);
    }

    // ─── Borrower repays (partial or full) ─────────────────────────────────
    function repayLoan(uint _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.state == LoanState.Funded, "Loan not active");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(msg.value > 0, "Send ETH to repay");

        loan.amountRepaid += msg.value;

        // Forward repayment to lender
        if (loan.lender != address(0)) {
            loan.lender.transfer(msg.value);
        }

        if (loan.amountRepaid >= loan.repayAmount) {
            loan.state = LoanState.Repaid;
            // Return collateral to borrower
            loan.borrower.transfer(loan.collateralAmount);
            // Boost credit score
            if (creditScores[loan.borrower] < 100) {
                creditScores[loan.borrower] += 10;
                if (creditScores[loan.borrower] > 100) {
                    creditScores[loan.borrower] = 100;
                }
            }
        }

        emit LoanRepaid(_loanId, msg.value);
    }

    // ─── Views ──────────────────────────────────────────────────────────────
    function getBorrowerLoans(address _borrower) external view returns (uint[] memory) {
        return borrowerLoanIds[_borrower];
    }

    function getLenderLoans(address _lender) external view returns (uint[] memory) {
        return lenderLoanIds[_lender];
    }

    function getCreditScore(address _user) external view returns (uint) {
        uint score = creditScores[_user];
        return score == 0 ? 50 : score;
    }

    function getContractBalance() external view returns (uint) {
        return address(this).balance;
    }
}
