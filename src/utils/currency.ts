// Currency formatting utility - configured for Indian Rupees (INR)

export const formatCurrency = (value: number, maximumFractionDigits: number = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(value);
};

export const getCurrencySymbol = () => '₹';
