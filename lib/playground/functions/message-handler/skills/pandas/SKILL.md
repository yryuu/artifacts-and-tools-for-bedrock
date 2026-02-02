---
name: pandas
description: "Expert data manipulation, analysis, and visualization using the pandas library. Best practices for efficient data processing, handling missing values, time-series analysis, and creating high-quality plots with Japanese character support."
---

# Pandas Data Analysis Skill

## Overview
This skill provides expert-level instructions for data manipulation and analysis using the pandas library. It emphasizes efficiency, code clarity, and robust data handling.

## Core Best Practices

### Efficient Data Loading
Always optimize data loading based on the file type and size.
```python
import pandas as pd

# Load CSV with specific encoding if needed
df = pd.read_csv('data.csv', encoding='utf-8')

# Load Excel with specific sheet
df = pd.read_excel('data.xlsx', sheet_name='Sales')

# Optimize memory for large files
df = pd.read_csv('large_data.csv', chunksize=10000)
```

### Data Inspection
Quickly understand the structure and quality of your data.
```python
print(df.shape)
print(df.columns)
print(df.dtypes)
print(df.isnull().sum())
print(df.head())
```

### Visualization with Japanese Support
When creating plots, prioritize readability. Use `japanize_matplotlib` to ensure Japanese characters are rendered correctly.
```python
import matplotlib.pyplot as plt
import japanize_matplotlib
import seaborn as sns

# Set style
sns.set(font="IPAexGothic") # Or other Japanese fonts if available

# Create a plot
plt.figure(figsize=(10, 6))
df.groupby('Category')['Sales'].sum().plot(kind='bar')
plt.title('カテゴリー別売上')
plt.xlabel('カテゴリー')
plt.ylabel('売上')
plt.savefig('sales_chart.png')
```

### Data Cleansing
Handle missing values and duplicates systematically.
```python
# Fill missing values
df['Column'] = df['Column'].fillna(0)

# Drop duplicates
df = df.drop_duplicates()

# Type conversion
df['Date'] = pd.to_datetime(df['Date'])
```

### Advanced Grouping and Aggregation
Use `groupby` for deep insights.
```python
# Multiple aggregations
summary = df.groupby('Region').agg({
    'Sales': ['sum', 'mean'],
    'Profit': 'sum'
})
```

## Environment Considerations (Lambda)
- **Memory**: Be mindful of the 1024MB limit. Avoid creating many large copies of DataFrames. Use `inplace=True` where possible.
- **Warm Starts**: The `/tmp` directory is shared across warm starts. Clear temporary files if not needed, or use them for session persistence if intentional.
