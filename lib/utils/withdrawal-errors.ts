// lib/utils/withdrawal-errors.ts
export function getWithdrawalErrorMessage(stripeError: string): string {
  const errorLower = stripeError.toLowerCase();

  if (errorLower.includes("insufficient")) {
    return "Withdrawal temporarily unavailable. Please try again later.";
  }

  if (
    errorLower.includes("invalid_bank_account") ||
    errorLower.includes("invalid account")
  ) {
    return "There's an issue with your bank account. Please verify your details.";
  }

  if (errorLower.includes("account_closed") || errorLower.includes("closed")) {
    return "The linked bank account appears to be closed. Please update your payout method.";
  }

  if (errorLower.includes("debit_not_authorized")) {
    return "Bank transfer was not authorized. Please contact your bank.";
  }

  if (
    errorLower.includes("could not be found") ||
    errorLower.includes("no connected")
  ) {
    return "Payout account not found. Please reconnect your bank account.";
  }

  if (
    errorLower.includes("not enabled") ||
    errorLower.includes("complete onboarding")
  ) {
    return "Your payout account setup is incomplete. Please complete verification.";
  }

  return "Withdrawal failed. Please try again or contact support.";
}
