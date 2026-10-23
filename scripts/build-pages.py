"""Prepare the static site for a GitHub Pages project URL without changing dist/."""
import os
from pathlib import Path
import re
import shutil
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

root = Path(__file__).resolve().parents[1]
owner, repository = os.environ.get('GITHUB_REPOSITORY', 'Lumina-StudioBG/viva-brok-demo').split('/')[-2:]
base = '/' + repository + '/'
output = root / '_site'
output.mkdir(exist_ok=True)
shutil.copytree(root / 'dist', output, dirs_exist_ok=True)
for file in output.rglob('*'):
    if file.suffix.lower() not in {'.html', '.css', '.js', '.svg', '.json'}:
        continue
    text = file.read_text(encoding='utf-8')
    # Root-relative quoted paths and JS route comparisons/dynamic asset prefixes.
    text = re.sub(r'([\x22\x27`])/(?!/)(?=[A-Za-z0-9_#]|\1)', lambda m: m[1] + base, text)
    # A trailing '/' in the dynamic product URL is a separator, not a root URL.
    if file.name == 'insurance-explorer.js':
        text = text.replace("+p[0]+'" + base + "'", "+p[0]+'/'")
    text = re.sub(r'url\(/(?!/)', 'url(' + base, text)
    # Link previews (WhatsApp, Viber, Facebook) need an absolute image URL.
    text = text.replace('property="og:image" content="/', 'property="og:image" content="https://' + owner + '.github.io/')
    # The preview's forms only simulate sending, so keep it out of search results.
    if file.suffix.lower() == '.html' and 'name="robots"' not in text:
        text = text.replace('<head>', '<head><meta name="robots" content="noindex">', 1)
    file.write_text(text, encoding='utf-8')
(output / '.nojekyll').touch()

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in {'href', 'src'} or not value or not value.startswith(base):
                continue
            target = output / unquote(urlsplit(value).path.removeprefix(base))
            if not target.exists():
                raise ValueError(f'Missing published target: {value}')

for file in output.rglob('*.html'):
    Links().feed(file.read_text(encoding='utf-8'))
print(f'GitHub Pages site prepared at {base}; local HTML links and assets verified.')
