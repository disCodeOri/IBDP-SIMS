import os
from pathlib import Path
from datetime import datetime

def generate_tree(directory_path, file_handler, exclude_dirs=None, indent="", last=True, is_root=False):
    if exclude_dirs is None:
        exclude_dirs = {'.git', '__pycache__', 'venv'}
    
    # Get the directory name
    directory_name = os.path.basename(directory_path)
    
    # Define the characters for the tree structure
    prefix = '└── ' if last else '├── '
    if is_root:
        line = f"{directory_name}/"
    else:
        line = f"{indent}{prefix}{directory_name}/"
    
    file_handler.write(line + '\n')
    
    # Get all items in the directory
    try:
        items = list(os.scandir(directory_path))
        # Sort items (directories first, then files)
        items.sort(key=lambda x: (not x.is_dir(), x.name.lower()))
        
        # Filter out excluded directories
        items = [item for item in items if item.name not in exclude_dirs]
        
        # Calculate new indent for subdirectories/files
        if is_root:
            new_indent = "    "
        else:
            new_indent = indent + ("    " if last else "│   ")
        
        # Process all items
        for index, item in enumerate(items):
            is_last = index == len(items) - 1
            
            if item.is_dir():
                generate_tree(item.path, file_handler, exclude_dirs, new_indent, is_last)
            else:
                prefix = '└── ' if is_last else '├── '
                file_handler.write(f"{new_indent}{prefix}{item.name}\n")
                
    except PermissionError:
        file_handler.write(f"{new_indent}└── <Permission Denied>\n")

def main():
    # Replace this with your directory path
    directory_path = r"C:\Users\SUN\Desktop\programs\IBDP-SIMS\indexengineer"
    
    # Add any additional directories you want to exclude
    exclude_dirs = {
        '.git',
        '__pycache__',
        'venv',
        'node_modules',  # Commonly excluded in web projects
        '.next'          # Next.js build directory
    }
    
    # Verify the directory exists
    if not os.path.exists(directory_path):
        print(f"Error: Directory '{directory_path}' does not exist.")
        return
    
    # Create the output file in the same directory as the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, 'file_structure.txt')
    
    # Write to the file
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header with timestamp
        f.write("Directory Structure\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-" * 50 + "\n")
        
        # Generate the tree
        generate_tree(directory_path, f, exclude_dirs, is_root=True)
        
        # Write footer
        f.write("-" * 50 + "\n")
    
    print(f"Directory structure has been saved to: {output_file}")

if __name__ == "__main__":
    main()