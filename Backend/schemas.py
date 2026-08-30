from pydantic import BaseModel, Field
from typing import List, Literal

class GoalItem(BaseModel):
    id: str
    title: str = Field(min_length=1, max_length=100)
    target_amount: float = Field(gt=0)
    current_amount: float = Field(ge=0)
    monthly_contribution: float = Field(ge=0)
    target_date: str

class ExpenseItem(BaseModel):
    id: str
    name: str = Field(min_length=1, max_length=100)
    category: Literal["Needs", "Wants", "Savings"]
    amount: float = Field(ge=0)

class InvestmentData(BaseModel):
    initial_deposit: float = Field(default=1000.0, ge=0)
    monthly_contribution: float = Field(default=200.0, ge=0)
    time_horizon_years: int = Field(default=10, ge=1, le=100)
    expected_return_rate: float = Field(default=7.0, ge=-100, le=100)

class UserBudgetSchema(BaseModel):
    user_id: str
    monthly_income: float = Field(default=0.0, ge=0)
    expenses: List[ExpenseItem] = Field(default_factory=list)
    goals: List[GoalItem] = Field(default_factory=list)
    investment: InvestmentData = Field(default_factory=InvestmentData)


class UserCredentials(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(min_length=8, max_length=128)