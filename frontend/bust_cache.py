import glob

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('src="script.js"', 'src="script.js?v=3"')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
