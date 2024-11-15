import os
import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext
from datetime import datetime
import threading
import re

class FileCheckboxTree(ttk.Frame):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        
        # Create canvas and scrollbar
        self.canvas = tk.Canvas(self, borderwidth=0)
        self.scrollbar = ttk.Scrollbar(self, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)
        
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        # Bind mouse wheel
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        
        # Layout
        self.scrollbar.pack(side="right", fill="y")
        self.canvas.pack(side="left", fill="both", expand=True)
        
        self.canvas_frame = self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.scrollable_frame.bind("<Configure>", self._configure_scroll_region)
        self.canvas.bind("<Configure>", self._configure_canvas_window)
        
        self.checkboxes = {}
        self.vars = {}
        
    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
    def _configure_scroll_region(self, event):
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        
    def _configure_canvas_window(self, event):
        self.canvas.itemconfig(self.canvas_frame, width=event.width)
        
    def clear(self):
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        self.checkboxes = {}
        self.vars = {}
        
    def add_item(self, path, indent=0):
        var = tk.BooleanVar()
        checkbox = ttk.Checkbutton(
            self.scrollable_frame,
            text=path,
            variable=var,
            padding=(indent*20, 0, 0, 0)
        )
        checkbox.pack(anchor="w", fill="x")
        self.checkboxes[path] = checkbox
        self.vars[path] = var
        
    def select_all(self):
        for var in self.vars.values():
            var.set(True)
            
    def deselect_all(self):
        for var in self.vars.values():
            var.set(False)
            
    def get_selected(self):
        return [path for path, var in self.vars.items() if var.get()]

class FileProcessorGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("File Structure Generator")
        self.root.geometry("1000x800")
        
        # Get script directory
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Variables
        self.folder_path = tk.StringVar()
        self.watch_var = tk.BooleanVar(value=False)
        self.remove_comments_var = tk.BooleanVar(value=True)  # Set to True by default
        self.observer = None
        self.default_ignores = {'.git', 'node_modules', '.next', '__pycache__'}
        self.ignore_vars = {}
        
        self.setup_gui()
        
    def setup_gui(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        
        # Left panel
        left_frame = ttk.Frame(main_frame)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 5))
        
        # Folder selection
        folder_frame = ttk.Frame(left_frame)
        folder_frame.pack(fill="x", pady=5)
        ttk.Label(folder_frame, text="Folder:").pack(side="left")
        ttk.Entry(folder_frame, textvariable=self.folder_path, width=50).pack(side="left", padx=5)
        ttk.Button(folder_frame, text="Browse", command=self.browse_folder).pack(side="left")
        
        # Ignore patterns
        ignore_frame = ttk.LabelFrame(left_frame, text="Ignore Patterns", padding="5")
        ignore_frame.pack(fill="x", pady=5)
        
        for i, pattern in enumerate(self.default_ignores):
            var = tk.BooleanVar(value=True)
            self.ignore_vars[pattern] = var
            ttk.Checkbutton(ignore_frame, text=pattern, variable=var, command=self.refresh_file_list).grid(
                row=i//2, column=i%2, sticky="w", padx=5)
        
        # Custom ignore pattern
        custom_frame = ttk.Frame(ignore_frame)
        custom_frame.grid(row=len(self.default_ignores)//2 + 1, column=0, columnspan=2, sticky="w", pady=5)
        ttk.Label(custom_frame, text="Custom ignore:").pack(side="left")
        self.custom_ignore = ttk.Entry(custom_frame, width=20)
        self.custom_ignore.pack(side="left", padx=5)
        ttk.Button(custom_frame, text="Apply", command=self.refresh_file_list).pack(side="left")
        
        # File selection
        file_frame = ttk.LabelFrame(left_frame, text="Select Files to Include", padding="5")
        file_frame.pack(fill="both", expand=True, pady=5)
        
        # Add checkbox tree
        self.checkbox_tree = FileCheckboxTree(file_frame)
        self.checkbox_tree.pack(fill="both", expand=True, pady=5)
        
        # Selection buttons
        select_frame = ttk.Frame(left_frame)
        select_frame.pack(fill="x", pady=5)
        ttk.Button(select_frame, text="Select All", command=self.checkbox_tree.select_all).pack(side="left", padx=5)
        ttk.Button(select_frame, text="Deselect All", command=self.checkbox_tree.deselect_all).pack(side="left")
        
        # Right panel
        right_frame = ttk.Frame(main_frame)
        right_frame.grid(row=0, column=1, sticky="nsew")
        
        # Options
        options_frame = ttk.LabelFrame(right_frame, text="Options", padding="5")
        options_frame.pack(fill="x", pady=5)
        ttk.Checkbutton(options_frame, text="Watch for changes", variable=self.watch_var).pack(anchor="w")
        
        # Generate buttons
        buttons_frame = ttk.Frame(right_frame)
        buttons_frame.pack(pady=10)
        ttk.Button(buttons_frame, text="Generate Both", command=lambda: self.generate('both')).pack(side="left", padx=5)
        ttk.Button(buttons_frame, text="Structure Only", command=lambda: self.generate('structure')).pack(side="left", padx=5)
        ttk.Button(buttons_frame, text="Content Only", command=lambda: self.generate('content')).pack(side="left", padx=5)
        
        # Output log
        log_frame = ttk.LabelFrame(right_frame, text="Output Log", padding="5")
        log_frame.pack(fill="both", expand=True)
        self.log = scrolledtext.ScrolledText(log_frame, height=20, width=50)
        self.log.pack(fill="both", expand=True)
        
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
    def browse_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.folder_path.set(folder)
            self.refresh_file_list()
            
    def refresh_file_list(self):
        self.checkbox_tree.clear()
        folder = self.folder_path.get()
        if not folder:
            return
            
        ignore_patterns = self.get_ignore_patterns()
        
        def add_files(path, indent=0):
            try:
                for item in sorted(os.listdir(path)):
                    full_path = os.path.join(path, item)
                    relative_path = os.path.relpath(full_path, folder)
                    
                    if any(pattern in relative_path for pattern in ignore_patterns):
                        continue
                        
                    if os.path.isfile(full_path):
                        self.checkbox_tree.add_item(relative_path, indent)
                    else:
                        self.checkbox_tree.add_item(f"[{item}]", indent)
                        add_files(full_path, indent + 1)
            except Exception as e:
                self.log_message(f"Error accessing {path}: {str(e)}")
                
        add_files(folder)
        
    def log_message(self, message):
        self.log.insert(tk.END, f"{message}\n")
        self.log.see(tk.END)
        
    def get_ignore_patterns(self):
        patterns = {pattern for pattern, var in self.ignore_vars.items() if var.get()}
        custom = self.custom_ignore.get().strip()
        if custom:
            patterns.add(custom)
        return patterns
        
    def generate_tree(self, dir_path, output_file, ignore_patterns):
        with open(output_file, 'w', encoding='utf-8') as f:
            #f.write(f"Directory structure generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            def write_tree(path, prefix=""):
                if any(pattern in path for pattern in ignore_patterns):
                    return
                    
                f.write(f"{prefix}├── {os.path.basename(path)}\n")
                if os.path.isdir(path):
                    for item in sorted(os.listdir(path)):
                        write_tree(os.path.join(path, item), prefix + "│   ")
                        
            write_tree(dir_path)

    def remove_comments(self, content, file_extension):
        """
        Remove comments from code based on file extension
        """
        # Define comment patterns for different languages
        patterns = {
            '.py': {
                'single': r'#.*$',
                'multi': r'"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'',
                'inline_multi': True
            },
            '.js': {
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True
            },
            '.ts': {  # TypeScript patterns
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True,
                'jsdoc': r'/\*\*[\s\S]*?\*/'  # JSDoc comments
            },
            '.tsx': {  # TypeScript JSX patterns
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True,
                'jsdoc': r'/\*\*[\s\S]*?\*/'  # JSDoc comments
            },
            '.jsx': {
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True,
                'jsdoc': r'/\*\*[\s\S]*?\*/'
            },
            '.java': {
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True
            },
            '.cpp': {
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True
            },
            '.cs': {
                'single': r'//.*$',
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True
            },
            '.html': {
                'single': None,
                'multi': r'<!--[\s\S]*?-->',
                'inline_multi': True
            },
            '.css': {
                'single': None,
                'multi': r'/\*[\s\S]*?\*/',
                'inline_multi': True
            }
        }
        
        # Get patterns for file type or use TypeScript patterns as default
        ext = os.path.splitext(file_extension.lower())[0] + os.path.splitext(file_extension.lower())[1]
        pattern = patterns.get(ext, patterns['.ts'])  # Default to TypeScript patterns
        
        # Remove JSDoc comments first if pattern supports it
        if pattern.get('jsdoc'):
            content = re.sub(pattern['jsdoc'], '', content)
            
        # Remove multi-line comments
        if pattern['multi']:
            content = re.sub(pattern['multi'], '', content)
        
        # Remove single-line comments
        if pattern['single']:
            # Split into lines, remove comments, and rejoin
            lines = content.split('\n')
            lines = [re.sub(pattern['single'], '', line) for line in lines]
            content = '\n'.join(lines)
        
        # Remove empty lines and normalize spacing
        lines = content.split('\n')
        lines = [line.rstrip() for line in lines if line.strip()]
        return '\n'.join(lines)

    def combine_files(self, source_dir, output_file):
        """
        Enhanced version that properly handles files from different folders and removes comments if enabled
        """
        selected_files = self.checkbox_tree.get_selected()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            #f.write(f"Combined files content generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            if self.remove_comments_var.get():
                f.write("Comments have been removed from the source files")
            f.write("\n")
            
            # Sort files by directory depth to maintain a logical order
            selected_files.sort(key=lambda x: x.count(os.sep))
            
            current_dir = None
            for relative_path in selected_files:
                # Skip directory entries
                if relative_path.startswith('[') and relative_path.endswith(']'):
                    continue
                
                # Get the directory path for the current file
                dir_path = os.path.dirname(relative_path)
                
                # If we're entering a new directory, add a header
                if dir_path != current_dir:
                    if dir_path:
                        f.write(f"\n{'='*80}\n")
                        f.write(f"Directory: {dir_path}\n")
                        f.write(f"{'='*80}\n\n")
                    current_dir = dir_path
                
                file_path = os.path.join(source_dir, relative_path)
                f.write(f"File: {os.path.basename(relative_path)}\n")
                f.write(f"{'-'*80}\n\n")
                
                try:
                    if os.path.getsize(file_path) > 1024 * 1024:  # Skip files larger than 1MB
                        f.write("File too large to include in combined output\n")
                    else:
                        try:
                            with open(file_path, 'r', encoding='utf-8') as infile:
                                content = infile.read()
                                if self.remove_comments_var.get():
                                    content = self.remove_comments(content, os.path.splitext(file_path)[1])
                                f.write(content)
                        except UnicodeDecodeError:
                            # Try with different encoding if UTF-8 fails
                            with open(file_path, 'r', encoding='latin-1') as infile:
                                content = infile.read()
                                if self.remove_comments_var.get():
                                    content = self.remove_comments(content, os.path.splitext(file_path)[1])
                                f.write(content)
                except Exception as e:
                    f.write(f"Error reading file: {str(e)}\n")
                f.write("\n\n")

    def generate(self, mode='both'):
        folder = self.folder_path.get()
        if not folder:
            self.log_message("Please select a folder first!")
            return
            
        ignore_patterns = self.get_ignore_patterns()
        
        def process():
            try:
                if mode in ['both', 'structure']:
                    structure_file = os.path.join(self.script_dir, 'file_structure.txt')
                    self.generate_tree(folder, structure_file, ignore_patterns)
                    self.log_message(f"Generated structure file: {structure_file}")
                    
                if mode in ['both', 'content']:
                    content_file = os.path.join(self.script_dir, 'combined_output.txt')
                    self.combine_files(folder, content_file)
                    self.log_message(f"Generated content file: {content_file}")
                    
                if self.watch_var.get() and not self.observer:
                    self.start_watching(folder, mode)
                    
            except Exception as e:
                self.log_message(f"Error: {str(e)}")
                
        threading.Thread(target=process, daemon=True).start()
        
    def run(self):
        self.root.mainloop()
        if self.observer:
            self.observer.stop()
            self.observer.join()

if __name__ == "__main__":
    app = FileProcessorGUI()
    app.run()