export class AffectedBankTransactionsToImportInfo {
  constructor(
    public debitTransactions: string[],
    public creditTransactions: string[]
  ) {
  }

  public static debit(debitTransactions: string[]): AffectedBankTransactionsToImportInfo {
    return new AffectedBankTransactionsToImportInfo(debitTransactions, []);
  }

  public static credit(creditTransactions: string[]): AffectedBankTransactionsToImportInfo {
    return new AffectedBankTransactionsToImportInfo([], creditTransactions);
  }

  public static debitCredit(debitTransactions: string[], creditTransactions: string[]): AffectedBankTransactionsToImportInfo {
    return new AffectedBankTransactionsToImportInfo(debitTransactions, creditTransactions);
  }
}
