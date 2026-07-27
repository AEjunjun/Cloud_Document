import os
import json
import sys

def read_md_file(full_path):
    encodings = ['utf-8', 'gbk', 'gb2312', 'latin-1']
    for enc in encodings:
        try:
            with open(full_path, 'r', encoding=enc) as f:
                return f.read()
        except (UnicodeDecodeError, LookupError):
            continue
    with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def build_tree(dir_path, base_path=''):
    children = []
    try:
        entries = sorted(os.listdir(dir_path))
    except OSError:
        return {'children': []}

    for name in entries:
        if name.startswith('.'):
            continue
        full_path = os.path.join(dir_path, name)
        rel_path = (base_path + '/' + name) if base_path else name

        if os.path.isdir(full_path):
            sub = build_tree(full_path, rel_path)
            if sub['children']:
                children.append({
                    'type': 'directory',
                    'name': name,
                    'path': rel_path,
                    'children': sub['children']
                })
        elif name.endswith('.md'):
            try:
                content = read_md_file(full_path)
                children.append({
                    'type': 'file',
                    'name': name,
                    'path': rel_path,
                    'content': content
                })
            except Exception as e:
                print('warning: cannot read ' + rel_path + ': ' + str(e))

    children.sort(key=lambda x: (0 if x['type'] == 'directory' else 1, x['name']))
    return {'children': children}

def count_files(node):
    if node.get('type') == 'file':
        return 1
    return sum(count_files(c) for c in node.get('children', []))

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    home_dir = os.path.join(script_dir, 'Home')

    if not os.path.isdir(home_dir):
        os.makedirs(home_dir)
        print('Home folder created. Put your .md files in it and run again.')
        sys.exit(0)

    tree = build_tree(home_dir)
    tree['name'] = 'Home'
    tree['type'] = 'directory'

    output_path = os.path.join(script_dir, 'manifest.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    count = count_files(tree)
    print('Done! ' + str(count) + ' md files -> manifest.json')
