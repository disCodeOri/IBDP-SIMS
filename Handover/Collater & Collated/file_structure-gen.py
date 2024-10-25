import os

def print_directory_tree(root_dir, indent=""):
    for item in sorted(os.listdir(root_dir)):
        path = os.path.join(root_dir, item)
        if os.path.isdir(path):
            print(f"{indent}├── {item}/")
            print_directory_tree(path, indent + "│   ")
        else:
            print(f"{indent}├── {item}")

if __name__ == "__main__":
    # Set the root directory to the current working directory
    root_directory = os.getcwd()  # or specify any directory here
    
    print(f"{os.path.basename(root_directory)}/")
    print_directory_tree(root_directory)
