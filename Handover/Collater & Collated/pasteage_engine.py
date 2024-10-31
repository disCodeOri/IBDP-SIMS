import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import os
import re
import shutil
from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime
import json

@dataclass
class FileOperation:
    filepath: str
    content: str
    timestamp: str
    operation_type: str  # 'create', 'modify', or 'delete'
    previous_content: str = None  # For modifications

class FileOperationStack:
    def __init__(self):
        self.operations: List[List[FileOperation]] = []
        self.current_index: int = -1
        self.backup_dir = ".file_creator_backup"
        
        # Create backup directory if it doesn't exist
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir)
    
    def push(self, operations: List[FileOperation]) -> None:
        """Push a new set of operations onto the stack"""
        if not operations:  # Don't push empty operations
            return
            
        # Remove any future operations if we're not at the end
        while len(self.operations) > self.current_index + 1:
            self.operations.pop()
        
        self.operations.append(operations)
        self.current_index += 1
        self._backup_files(operations)
    
    def can_undo(self) -> bool:
        """Check if undo operation is available"""
        return self.current_index >= 0 and len(self.operations) > 0
    
    def can_redo(self) -> bool:
        """Check if redo operation is available"""
        return self.current_index < len(self.operations) - 1
    
    def undo(self) -> Optional[List[FileOperation]]:
        """Perform undo operation"""
        if not self.can_undo():
            return None
        
        operations = self.operations[self.current_index]
        self.current_index -= 1
        return operations
    
    def redo(self) -> Optional[List[FileOperation]]:
        """Perform redo operation"""
        if not self.can_redo():
            return None
        
        self.current_index += 1
        return self.operations[self.current_index]
    
    def _backup_files(self, operations: List[FileOperation]) -> None:
        """Create backup of files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(self.backup_dir, timestamp)
        os.makedirs(backup_path, exist_ok=True)
        
        for op in operations:
            if op.operation_type in ['create', 'modify']:
                # Save operation metadata
                meta_path = os.path.join(backup_path, f"{os.path.basename(op.filepath)}.meta")
                with open(meta_path, 'w') as f:
                    json.dump({
                        'filepath': op.filepath,
                        'operation_type': op.operation_type,
                        'timestamp': op.timestamp,
                        'previous_content': op.previous_content
                    }, f)

class LogWindow:
    def __init__(self, parent):
        self.window = tk.Toplevel(parent)
        self.window.title("Operation Log")
        self.window.geometry("600x400")
        
        # Create text widget
        self.text = scrolledtext.ScrolledText(self.window, width=70, height=20)
        self.text.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        
        # Create close button
        ttk.Button(self.window, text="Close", command=self.window.destroy).pack(pady=5)
    
    def log(self, message: str) -> None:
        """Add a message to the log"""
        self.text.insert(tk.END, f"{datetime.now().strftime('%H:%M:%S')}: {message}\n")
        self.text.see(tk.END)

class CodeBlockFileCreator:
    def __init__(self, root):
        self.root = root
        self.root.title("Code Block File Creator")
        self.root.geometry("800x600")
        
        # Initialize operation stack and working directory
        self.operation_stack = FileOperationStack()
        self.working_dir = os.getcwd()
        
        # Initialize log window
        self.log_window = None
        
        self._setup_ui()
        
    def _setup_ui(self):
        """Set up the user interface"""
        # Configure grid weight
        self.root.grid_rowconfigure(1, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
        
        # Create main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew", rowspan=2)
        
        # Configure main frame grid
        main_frame.grid_rowconfigure(2, weight=1)
        main_frame.grid_columnconfigure(0, weight=1)
        
        # Create directory selection frame
        self._setup_directory_frame(main_frame)
        
        # Instructions label
        instructions = ("Paste your code blocks below. Each file should start with a comment containing its path.\n"
                      "Example: // src/components/auth/LoginForm.tsx")
        ttk.Label(main_frame, text=instructions, wraplength=780).grid(row=1, column=0, pady=(0, 10))
        
        # Create text area for input
        self.input_text = scrolledtext.ScrolledText(main_frame, width=80, height=20)
        self.input_text.grid(row=2, column=0, sticky="nsew")
        
        # Create bottom frame for buttons
        self._setup_button_frame(main_frame)
        
        # Add keyboard shortcuts
        self._setup_shortcuts()
        
        # Update button states
        self.update_button_states()

    def _setup_directory_frame(self, parent):
        """Set up the directory selection frame"""
        dir_frame = ttk.Frame(parent)
        dir_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        
        ttk.Label(dir_frame, text="Working Directory:").pack(side=tk.LEFT, padx=(0, 5))
        self.dir_var = tk.StringVar(value=self.working_dir)
        self.dir_entry = ttk.Entry(dir_frame, textvariable=self.dir_var, width=50)
        self.dir_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        ttk.Button(dir_frame, text="Browse...", command=self.browse_directory).pack(side=tk.LEFT)

    def _setup_button_frame(self, parent):
        """Set up the button frame"""
        button_frame = ttk.Frame(parent)
        button_frame.grid(row=3, column=0, pady=(10, 0))
        
        self.undo_button = ttk.Button(button_frame, text="Undo", command=self.undo_changes, state=tk.DISABLED)
        self.undo_button.pack(side=tk.LEFT, padx=5)
        
        self.redo_button = ttk.Button(button_frame, text="Redo", command=self.redo_changes, state=tk.DISABLED)
        self.redo_button.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(button_frame, text="Process Files", command=self.process_files).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear", command=self.clear_input).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Show Log", command=self.show_log).pack(side=tk.LEFT, padx=5)

    def _setup_shortcuts(self):
        """Set up keyboard shortcuts"""
        self.root.bind('<Control-z>', lambda e: self.undo_changes())
        self.root.bind('<Control-y>', lambda e: self.redo_changes())

    def show_log(self):
        """Show the log window"""
        if self.log_window is None or not self.log_window.window.winfo_exists():
            self.log_window = LogWindow(self.root)
    
    def log(self, message: str):
        """Log a message to the log window"""
        if self.log_window and self.log_window.window.winfo_exists():
            self.log_window.log(message)
    
    def browse_directory(self):
        """Open directory browser dialog"""
        dir_path = filedialog.askdirectory(initialdir=self.working_dir)
        if dir_path:
            self.working_dir = dir_path
            self.dir_var.set(self.working_dir)
            self.log(f"Changed working directory to: {self.working_dir}")
    
    def update_button_states(self):
        """Update the enabled/disabled state of undo/redo buttons"""
        self.undo_button['state'] = tk.NORMAL if self.operation_stack.can_undo() else tk.DISABLED
        self.redo_button['state'] = tk.NORMAL if self.operation_stack.can_redo() else tk.DISABLED
    
    def clear_input(self):
        """Clear the input text area"""
        self.input_text.delete(1.0, tk.END)
        self.log("Cleared input text area")
    
    def undo_changes(self):
        """Undo the last file operations"""
        operations = self.operation_stack.undo()
        if not operations:
            self.log("No operations to undo")
            return
        
        try:
            for operation in operations:
                if operation.operation_type == 'create':
                    if os.path.exists(operation.filepath):
                        os.remove(operation.filepath)
                        self.log(f"Undo create: Removed {operation.filepath}")
                        try:
                            os.removedirs(os.path.dirname(operation.filepath))
                            self.log(f"Removed empty directory: {os.path.dirname(operation.filepath)}")
                        except OSError:
                            pass
                elif operation.operation_type == 'modify':
                    with open(operation.filepath, 'w', encoding='utf-8') as f:
                        f.write(operation.previous_content)
                    self.log(f"Undo modify: Restored {operation.filepath}")
            
            self.update_button_states()
            messagebox.showinfo("Undo", "Changes undone successfully")
            
        except Exception as e:
            error_msg = f"Error during undo: {str(e)}"
            self.log(f"ERROR: {error_msg}")
            messagebox.showerror("Undo Error", error_msg)
    
    def redo_changes(self):
        """Redo the previously undone file operations"""
        operations = self.operation_stack.redo()
        if not operations:
            self.log("No operations to redo")
            return
        
        try:
            for operation in operations:
                os.makedirs(os.path.dirname(operation.filepath), exist_ok=True)
                with open(operation.filepath, 'w', encoding='utf-8') as f:
                    f.write(operation.content)
                self.log(f"Redo: Restored {operation.filepath}")
            
            self.update_button_states()
            messagebox.showinfo("Redo", "Changes redone successfully")
            
        except Exception as e:
            error_msg = f"Error during redo: {str(e)}"
            self.log(f"ERROR: {error_msg}")
            messagebox.showerror("Redo Error", error_msg)
    
    def parse_code_blocks(self, text: str) -> Dict[str, str]:
        """Parse the input text into a dictionary of file paths and contents"""
        files = {}
        current_file = None
        current_content = []
        
        lines = text.split('\n')
        
        for line in lines:
            path_match = re.match(r'//\s*([^\s].*)', line.strip())
            if path_match:
                if current_file is not None:
                    files[current_file] = '\n'.join(current_content)
                
                current_file = path_match.group(1)
                current_content = []
            elif current_file is not None:
                current_content.append(line)
        
        if current_file is not None and current_content:
            files[current_file] = '\n'.join(current_content)
        
        return files
    
    def process_files(self):
        """Process the input text and create files"""
        try:
            text = self.input_text.get(1.0, tk.END)
            files = self.parse_code_blocks(text)
            
            if not files:
                self.log("No valid file paths found in input")
                messagebox.showwarning("No Files Found", 
                    "No valid file paths found in the input. Each file should start with a comment containing its path.")
                return
            
            operations = []
            for filepath, content in files.items():
                abs_path = os.path.join(self.working_dir, filepath)
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                
                previous_content = None
                operation_type = 'create'
                
                if os.path.exists(abs_path):
                    with open(abs_path, 'r', encoding='utf-8') as f:
                        previous_content = f.read()
                    operation_type = 'modify'
                
                with open(abs_path, 'w', encoding='utf-8') as f:
                    f.write(content.strip())
                
                self.log(f"{operation_type.capitalize()}: {abs_path}")
                
                operations.append(FileOperation(
                    filepath=abs_path,
                    content=content.strip(),
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    operation_type=operation_type,
                    previous_content=previous_content
                ))
            
            if operations:
                self.operation_stack.push(operations)
                self.update_button_states()
                
                message = "Successfully processed files in directory:\n" + self.working_dir + "\n\nFiles:\n" + "\n".join(
                    os.path.relpath(op.filepath, self.working_dir) for op in operations
                )
                messagebox.showinfo("Success", message)
            
        except Exception as e:
            error_msg = f"An error occurred:\n{str(e)}"
            self.log(f"ERROR: {error_msg}")
            messagebox.showerror("Error", error_msg)

def main():
    root = tk.Tk()
    app = CodeBlockFileCreator(root)
    root.mainloop()

if __name__ == "__main__":
    main()