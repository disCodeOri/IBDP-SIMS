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
        self.disabled_checkboxes = {}
        
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
        self.disabled_checkboxes = {}
        
    def add_item(self, path, indent=0, disabled=False):
        var = tk.BooleanVar()
        checkbox = ttk.Checkbutton(
            self.scrollable_frame,
            text=path,
            variable=var,
            padding=(indent*20, 0, 0, 0),
            state="disabled" if disabled else "normal"
        )
        checkbox.pack(anchor="w", fill="x")
        self.checkboxes[path] = checkbox
        self.vars[path] = var
        if disabled:
            self.disabled_checkboxes[path] = checkbox
        
    def select_all(self):
        for path, var in self.vars.items():
          if path not in self.disabled_checkboxes:
            var.set(True)
            
    def deselect_all(self):
        for path, var in self.vars.items():
          if path not in self.disabled_checkboxes:
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
        self.remove_comments_var = tk.BooleanVar(value=False)
        self.default_ignores = {'.git', 'node_modules', '.next', '__pycache__'}
        self.ignore_vars = {}
        self.files_to_ignore = {"collation-engine.py", "combined_output.txt", "file_structure.txt"}
        
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
        
        # Refresh button
        refresh_frame = ttk.Frame(left_frame)
        refresh_frame.pack(fill="x", pady=5)
        ttk.Button(refresh_frame, text="Refresh File Tree", command=self.refresh_file_list).pack(side="left")
        
        # Right panel
        right_frame = ttk.Frame(main_frame)
        right_frame.grid(row=0, column=1, sticky="nsew")
        
        # Options
        options_frame = ttk.LabelFrame(right_frame, text="Options", padding="5")
        options_frame.pack(fill="x", pady=5)
        ttk.Checkbutton(options_frame, text="Remove Comments", variable=self.remove_comments_var).pack(anchor="w") #Added the new checkbox
        
        # Generate buttons
        buttons_frame = ttk.Frame(right_frame)
        buttons_frame.pack(pady=10)
        ttk.Button(buttons_frame, text="Generate Both", command=lambda: self.generate('both')).pack(side="left", padx=5)
        ttk.Button(buttons_frame, text="Structure Only", command=lambda: self.generate('structure')).pack(side="left", padx=5)
        ttk.Button(buttons_frame, text="Content Only", command=lambda: self.generate('content')).pack(side="left", padx=5)
        ttk.Button(buttons_frame, text="Line Counts", command=lambda: self.generate('counts')).pack(side="left", padx=5)
        
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
                        disabled = os.path.basename(full_path) in self.files_to_ignore
                        self.checkbox_tree.add_item(relative_path, indent, disabled)
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

    def count_non_comment_lines(self, content, file_extension):
        """
        Count lines of code excluding comments and empty lines
        """
        # Define comment patterns for different languages
        patterns = {
            '.py': {
                'single': r'#.*$',
                'multi_start': r'("""|\'\'\').*$',
                'multi_end': r'^.*?("""|\'\'\').*$',
                'inline_multi': True
            },
            '.js': {
                'single': r'//.*$',
                'multi_start': r'/\*.*$',
                'multi_end': r'^.*?\*/.*$',
                'inline_multi': True
            },
            '.ts': {
                'single': r'//.*$',
                'multi_start': r'/\*.*$',
                'multi_end': r'^.*?\*/.*$',
                'inline_multi': True
            },
            '.tsx': {
                'single': r'//.*$',
                'multi_start': r'/\*.*$',
                'multi_end': r'^.*?\*/.*$',
                'inline_multi': True
            },
            '.jsx': {
                'single': r'//.*$',
                'multi_start': r'/\*.*$',
                'multi_end': r'^.*?\*/.*$',
                'inline_multi': True
            },
            '.html': {
                'single': None,
                'multi_start': r'<!--.*$',
                'multi_end': r'^.*?-->.*$',
                'inline_multi': True
            },
            '.css': {
                'single': None,
                'multi_start': r'/\*.*$',
                'multi_end': r'^.*?\*/.*$',
                'inline_multi': True
            }
        }

        ext = os.path.splitext(file_extension.lower())[0] + os.path.splitext(file_extension.lower())[1]
        pattern = patterns.get(ext, patterns['.js'])  # Default to JavaScript patterns

        lines = content.split('\n')
        non_comment_lines = 0
        in_multi_comment = False

        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue

            # Handle multi-line comments
            if pattern['multi_start'] and re.search(pattern['multi_start'], line):
                in_multi_comment = True
                # Check if multi-line comment ends on the same line
                if pattern['multi_end'] and re.search(pattern['multi_end'], line):
                    in_multi_comment = False
                continue

            if in_multi_comment:
                if pattern['multi_end'] and re.search(pattern['multi_end'], line):
                    in_multi_comment = False
                continue

            # Handle single-line comments
            if pattern['single'] and re.match(pattern['single'], line.lstrip()):
                continue

            # If we get here, it's a line of code
            non_comment_lines += 1

        return non_comment_lines

    def combine_files(self, source_dir, output_file):
        """
        Modified version that counts non-comment lines
        """
        selected_files = self.checkbox_tree.get_selected()
        line_counts = {}

        with open(output_file, 'w', encoding='utf-8') as f:
            if self.remove_comments_var.get():
                f.write("Comments have been removed from the source files")
            f.write("\n")

            selected_files.sort(key=lambda x: x.count(os.sep))
            current_dir = None

            for relative_path in selected_files:
                if relative_path.startswith('[') and relative_path.endswith(']'):
                    continue

                file_path = os.path.join(source_dir, relative_path)
                if os.path.basename(file_path) in self.files_to_ignore:
                    continue

                dir_path = os.path.dirname(relative_path)
                if dir_path != current_dir:
                    if dir_path:
                        f.write(f"\n{'='*11}\nDirectory: {dir_path}\n{'='*11}\n\n")
                    current_dir = dir_path

                f.write(f"File: {relative_path}\n{'-'*20}\n\n")

                try:
                    if os.path.getsize(file_path) > 1024 * 1024:
                        f.write("File too large to include in combined output\n")
                        line_counts[relative_path] = 0
                    else:
                        try:
                            with open(file_path, 'r', encoding='utf-8') as infile:
                                content = infile.read()
                                # Count non-comment lines before potentially removing comments
                                line_counts[relative_path] = self.count_non_comment_lines(content, os.path.splitext(file_path)[1])
                                if self.remove_comments_var.get():
                                    content = self.remove_comments(content, os.path.splitext(file_path)[1])
                                f.write(content)
                        except UnicodeDecodeError:
                            with open(file_path, 'r', encoding='latin-1') as infile:
                                content = infile.read()
                                line_counts[relative_path] = self.count_non_comment_lines(content, os.path.splitext(file_path)[1])
                                if self.remove_comments_var.get():
                                    content = self.remove_comments(content, os.path.splitext(file_path)[1])
                                f.write(content)
                except Exception as e:
                    f.write(f"Error reading file: {str(e)}\n")
                    line_counts[relative_path] = 0

                f.write("\n\n")

        return line_counts

    def generate_line_counts_file(self, line_counts):
        """Generates a file with total lines and per-file counts."""
        total_lines = sum(line_counts.values())
        counts_file = os.path.join(self.script_dir, 'line_counts.txt')
        with open(counts_file, 'w', encoding='utf-8') as f:
            f.write(f"Total lines of code: {total_lines}\n\n")
            f.write("Line counts per file:\n")
            for file_path, count in line_counts.items():
                f.write(f"{file_path}: {count}\n")
        self.log_message(f"Generated line counts file: {counts_file}")

    def generate(self, mode='both'):
        folder = self.folder_path.get()
        if not folder:
            self.log_message("Please select a folder first!")
            return

        ignore_patterns = self.get_ignore_patterns()

        def process():
            try:
                if mode == 'counts':
                    # Only generate line counts
                    content_file = os.path.join(self.script_dir, 'combined_output_temp.txt')
                    line_counts = self.combine_files(folder, content_file)
                    self.generate_line_counts_file(line_counts)
                    # Remove temporary file
                    if os.path.exists(content_file):
                        os.remove(content_file)
                else:
                    if mode in ['both', 'structure']:
                        structure_file = os.path.join(self.script_dir, 'file_structure.txt')
                        self.generate_tree(folder, structure_file, ignore_patterns)
                        self.log_message(f"Generated structure file: {structure_file}")

                    if mode in ['both', 'content']:
                        content_file = os.path.join(self.script_dir, 'combined_output.txt')
                        line_counts = self.combine_files(folder, content_file)
                        self.log_message(f"Generated content file: {content_file}")
                        self.generate_line_counts_file(line_counts)
            except Exception as e:
                self.log_message(f"Error: {str(e)}")

        threading.Thread(target=process, daemon=True).start()

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = FileProcessorGUI()
    app.run()