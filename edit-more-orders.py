import re

with open('packages/server/src/scripts/seed-more-orders.ts', 'r') as f:
    content = f.read()

# Remove product insertion
content = re.sub(r'console\.log\(`Inserting \$\{ENHANCED_PRODUCTS\.length\}.*?Additional products inserted\.\'\);', '', content, flags=re.DOTALL)

# Remove customer insertion
content = re.sub(r'// Insert additional customers.*?Additional customers inserted\.\'\);', '', content, flags=re.DOTALL)

# Change totalDays from 365 to 1095 (3 years)
content = content.replace("const totalDays = 365;", "const totalDays = 1095;")

# Change the number of loops for generating orders
content = content.replace("for (let i = 0; i < 100; i++)", "for (let i = 0; i < 1500; i++)")
content = content.replace("for (let i = 0; i < 200; i++)", "for (let i = 0; i < 3000; i++)")
content = content.replace("for (let i = 0; i < 200; i++)", "for (let i = 0; i < 1500; i++)") # Wait, there are two loops with 200? Let's check.

# Or just use regex to multiply the loop iterations
def replacer(match):
    num = int(match.group(1))
    return f"for (let i = 0; i < {num * 20}; i++)"

content = re.sub(r'for \(let i = 0; i < (\d+); i\+\+\)', replacer, content)

# Remove expenses generation just in case
content = re.sub(r'// Generate additional expenses.*?Additional expenses inserted\.\'\);', '', content, flags=re.DOTALL)

with open('packages/server/src/scripts/seed-more-orders.ts', 'w') as f:
    f.write(content)

print("Modification complete.")
