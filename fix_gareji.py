# -*- coding: utf-8 -*-
import re
path = r'c:\repos\soulmate-travel\index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
# Remove "По пути" block (div with h4 "По пути" and its ul)
pattern = r'\s*<div>\s*<h4>По пути</h4>\s*<ul>.*?</ul>\s*</div>\s*<div>'
content = re.sub(pattern, '\n                <div>', content, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
