def calculate_balance_projection(burn_rate, strikes, months):
    """
    Calculate balance projection based on monthly burn rate and strikes.
    
    Parameters:
    burn_rate (float): Monthly burn rate.
    strikes (int): Number of strikes that can generate income.
    months (int): Time period for projection in months.
    
    Returns:
    float: Projected balance after the given number of months.
    """
    income_from_strikes = strikes * 1000  # Example income from each strike
    total_income = income_from_strikes * months
    total_expense = burn_rate * months
    projected_balance = total_income - total_expense
    return projected_balance
