export class AffectedBankTransactionsToImportInfo {
  constructor(
    public debitTransactions: number[],
    public creditTransactions: number[]
  ) {
  }

  public static debit(debitTransactions: number[]): AffectedBankTransactionsToImportInfo {
    return new AffectedBankTransactionsToImportInfo(debitTransactions, []);
  }

  public static credit(creditTransactions: number[]): AffectedBankTransactionsToImportInfo {
    return new AffectedBankTransactionsToImportInfo([], creditTransactions);
  }

  public static debitCredit(debitTransactions: number[], creditTransactions: number[]): AffectedBankTransactionsToImportInfo {
    return new AffectedBankTransactionsToImportInfo(debitTransactions, creditTransactions);
  }
}
