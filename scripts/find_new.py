import csv
from difflib import SequenceMatcher

def similar(a, b):
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

existing = []
with open('scripts/current_businesses.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) >= 3:
            existing.append((row[0], row[1], row[2]))

new_list = []
with open('scripts/saengs_list.txt', 'r') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.split('|')
        if len(parts) == 3:
            new_list.append((parts[0], parts[1], parts[2]))

net_new = []
for name, city, state in new_list:
    is_dup = False
    for ex_name, ex_city, ex_state in existing:
        if similar(name, ex_name) > 0.75 and city.lower() == ex_city.lower():
            is_dup = True
            break
    if not is_dup:
        net_new.append((name, city, state))

print(f"Total in Saeng's list: {len(new_list)}")
print(f"Already in database: {len(new_list) - len(net_new)}")
print(f"Net new: {len(net_new)}")
print()
for name, city, state in net_new:
    print(f"{name} | {city} | {state}")
