export const formatThousandsDollars = (n: number) =>
  `$${(n * 1000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
