import pandas as pd
import datetime

def process():
    df = pd.read_csv('data/final_final_data.csv')
    
    # 1. Extract the numeric week
    df['week_number'] = df['week_of_outbreak'].astype(str).str.extract(r'(\d+)').astype(float)
    
    # Group by year and week_number
    unique_combos = df[['year', 'week_number']].drop_duplicates().dropna()
    
    invalid_combinations = []
    
    for _, row in unique_combos.iterrows():
        y = int(row['year'])
        w = int(row['week_number'])
        
        # Try to parse ISO year and week
        try:
            # We construct the Monday of the given ISO year and ISO week.
            # %G is ISO year, %V is ISO week, %u=1 is Monday
            # Wait, if we use %G, we are treating `y` as ISO year.
            # Let's test if python allows parsing W53 if the ISO year doesn't have 53 weeks.
            # As seen earlier, 2016-W53-1 parses as 2017-01-02 without error, but then isocalendar()[0] is 2017.
            d = datetime.datetime.strptime(f'{y}-W{w:02d}-1', '%G-W%V-%u').date()
            
            # Now validate against the strict rules required by the user
            if d.year != y:
                invalid_combinations.append((y, w, f"Canonical Monday ({d}) is in Gregorian year {d.year}, violating Date.year == year ({y})"))
            elif d.isocalendar()[0] != y:
                invalid_combinations.append((y, w, f"Canonical Monday ({d}) has ISO year {d.isocalendar()[0]}, violating Date.isocalendar().year == year ({y})"))
            elif d.isocalendar()[1] != w:
                invalid_combinations.append((y, w, f"Canonical Monday ({d}) has ISO week {d.isocalendar()[1]}, violating Date.isocalendar().week == week_number ({w})"))
            elif d.weekday() != 0:
                invalid_combinations.append((y, w, f"Canonical Date ({d}) is not a Monday"))
                
        except ValueError as e:
            invalid_combinations.append((y, w, f"Invalid ISO week definition: {e}"))
            
    if invalid_combinations:
        print("================================================")
        print("INVALID YEAR/WEEK COMBINATIONS REPORT")
        print("================================================")
        for y, w, reason in invalid_combinations:
            affected = len(df[(df['year'] == y) & (df['week_number'] == w)])
            print(f"Year: {y}, Week: {w}")
            print(f"Affected rows: {affected}")
            print(f"Reason: {reason}")
            print("-" * 40)
        print(f"Total invalid combinations: {len(invalid_combinations)}")
        print("STOPPING processing as required by rules.")
        return False
        
    print("All combinations are valid!")
    return True

if __name__ == '__main__':
    process()
