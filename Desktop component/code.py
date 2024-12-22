import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import pystray
from PIL import Image
import subprocess
import threading
import time
import schedule
import os
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Configuration ---
CONFIG_FILE = "config.json"
DEFAULT_CONFIG = {
    "repo_path": "",
    "remote_url": "",
    "sync_interval": 60  # seconds
}

def load_config():
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return DEFAULT_CONFIG

def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)

# --- Helper Functions ---
def execute_git_command(repo_path, command_list):
    try:
        process = subprocess.run(command_list, cwd=repo_path, capture_output=True, text=True, check=True)
        return process.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr.strip()}"
    except FileNotFoundError:
        return "Error: Git executable not found. Ensure Git is installed and in your PATH."
    except Exception as e:
        return f"An unexpected error occurred: {e}"

def show_notification(tray, title, message):  # Pass 'tray' as an argument
    try:
        tray.notify(message, title)
    except Exception as e:
        print(f"Error showing notification: {e}")

def show_error_popup(message):
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    messagebox.showerror("Error", message)
    root.destroy()

# --- File System Monitor ---
class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, app):
        self.app = app

    def on_any_event(self, event):
        if event.is_directory:
            return None

        # Ignore temporary files created by some editors
        if event.src_path.endswith("~") or event.src_path.endswith(".swp"):
            return None

        self.app.schedule_commit()

# --- Main Application Class ---
class GitSyncApp:
    def __init__(self):
        self.config = load_config()
        self.tray = None
        self.main_window = None
        self.log_text = None
        self.staged_changes_text = None
        self.commit_scheduled = False
        self.observer = None

    def start(self):
        image = Image.open("icon.png")  # Replace with your icon file
        menu = (
            pystray.MenuItem("Show", self.show_window),
            pystray.MenuItem("Exit", self.quit_app)
        )
        self.tray = pystray.Icon("GitSync", image, "Git Synchronization", menu)
        self.tray.run_detached()

        self.start_observer()
        self.start_scheduler()

    def start_observer(self):
        if self.config["repo_path"] and os.path.exists(self.config["repo_path"]):
            event_handler = FileChangeHandler(self)
            self.observer = Observer()
            self.observer.schedule(event_handler, self.config["repo_path"], recursive=True)
            self.observer.start()
            self.log("File system monitoring started.")
        else:
            self.log("Repository path not configured or does not exist. File system monitoring not started.")

    def stop_observer(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()
            self.log("File system monitoring stopped.")

    def start_scheduler(self):
        schedule.every(self.config["sync_interval"]).seconds.do(self.periodic_pull)
        threading.Thread(target=self.run_scheduler, daemon=True).start()
        self.log(f"Periodic pull scheduled every {self.config['sync_interval']} seconds.")

    def run_scheduler(self):
        while True:
            schedule.run_pending()
            time.sleep(1)

    def schedule_commit(self):
        if not self.commit_scheduled:
            self.commit_scheduled = True
            threading.Timer(5, self.commit_and_push).start() # Wait for 5 seconds for more changes

    def commit_and_push(self):
        if not self.config["repo_path"] or not self.config["remote_url"]:
            self.log("Repository path or remote URL not configured.")
            self.commit_scheduled = False
            return

        self.log("Checking for changes...")
        status_output = execute_git_command(self.config["repo_path"], ["git", "status", "--porcelain"])
        if "Error:" in status_output:
            self.log(f"Git status error: {status_output}")
            show_error_popup(f"Git status error: {status_output}")
            self.commit_scheduled = False
            return

        if status_output:
            self.log("Changes detected. Staging, committing, and pushing...")
            add_output = execute_git_command(self.config["repo_path"], ["git", "add", "."])
            if "Error:" in add_output:
                self.log(f"Git add error: {add_output}")
                show_error_popup(f"Git add error: {add_output}")
                self.commit_scheduled = False
                return

            commit_message = f"Automatic commit at {time.strftime('%Y-%m-%d %H:%M:%S')}"
            commit_output = execute_git_command(self.config["repo_path"], ["git", "commit", "-m", commit_message])
            if "Error:" in commit_output:
                self.log(f"Git commit error: {commit_output}")
                show_error_popup(f"Git commit error: {commit_output}")
                self.commit_scheduled = False
                return

            push_output = execute_git_command(self.config["repo_path"], ["git", "push", "origin", "main"])
            if "Error:" in push_output:
                self.log(f"Git push error: {push_output}")
                show_error_popup(f"Git push error: {push_output}")
            else:
                self.log("Changes successfully committed and pushed.")
                show_notification(self.tray, "GitSync", "Changes successfully committed and pushed.") # Pass self.tray
        else:
            self.log("No changes to commit.")

        self.commit_scheduled = False
        if self.main_window and self.main_window.winfo_exists():
            self.update_staged_changes()

    def periodic_pull(self):
        if not self.config["repo_path"] or not self.config["remote_url"]:
            return

        self.log("Performing periodic pull...")
        pull_output = execute_git_command(self.config["repo_path"], ["git", "pull", "origin", "main"])
        self.log(f"Pull output: {pull_output}")
        if "error" in pull_output.lower() or "conflict" in pull_output.lower():
            show_error_popup(f"Error during periodic pull: {pull_output}")
        elif "Already up to date" not in pull_output:
            show_notification(self.tray, "GitSync", "Successfully pulled changes from the repository.") # Pass self.tray

    def show_window(self, icon=None, item=None):
        if not self.main_window or not self.main_window.winfo_exists():
            self.create_main_window()
        self.main_window.deiconify()
        self.update_staged_changes()

    def create_main_window(self):
        self.main_window = tk.Tk()
        self.main_window.title("Git Synchronization Tool")
        self.main_window.geometry("600x400")
        self.main_window.protocol("WM_DELETE_WINDOW", self.hide_window)

        # --- Tabs ---
        notebook = ttk.Notebook(self.main_window)

        # --- Status Tab ---
        status_tab = ttk.Frame(notebook)
        ttk.Label(status_tab, text="Repository Path:").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.repo_path_entry = ttk.Entry(status_tab, width=50)
        self.repo_path_entry.grid(row=0, column=1, sticky="ew", padx=5, pady=5)
        self.repo_path_entry.insert(0, self.config["repo_path"])

        ttk.Label(status_tab, text="Remote URL:").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.remote_url_entry = ttk.Entry(status_tab, width=50)
        self.remote_url_entry.grid(row=1, column=1, sticky="ew", padx=5, pady=5)
        self.remote_url_entry.insert(0, self.config["remote_url"])

        ttk.Button(status_tab, text="Save Configuration", command=self.save_configuration).grid(row=2, column=0, columnspan=2, pady=10)
        ttk.Button(status_tab, text="Force Sync Now", command=self.force_sync).grid(row=3, column=0, columnspan=2, pady=5)

        notebook.add(status_tab, text="Status")

        # --- Changes Tab ---
        changes_tab = ttk.Frame(notebook)
        ttk.Label(changes_tab, text="Staged Changes:").pack(pady=5)
        self.staged_changes_text = scrolledtext.ScrolledText(changes_tab, wrap=tk.WORD, height=10)
        self.staged_changes_text.pack(fill="both", expand=True, padx=5, pady=5)
        ttk.Button(changes_tab, text="Commit and Push", command=self.manual_commit_push).pack(pady=10)
        notebook.add(changes_tab, text="Changes")

        # --- Log Tab ---
        log_tab = ttk.Frame(notebook)
        ttk.Label(log_tab, text="Event Log:").pack(pady=5)
        self.log_text = scrolledtext.ScrolledText(log_tab, wrap=tk.WORD, height=10)
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)
        notebook.add(log_tab, text="Log")

        notebook.pack(expand=True, fill="both")
        self.main_window.mainloop()

    def hide_window(self):
        self.main_window.withdraw()

    def quit_app(self, icon=None, item=None):
        self.stop_observer()
        self.tray.stop()
        if self.main_window:
            self.main_window.destroy()

    def log(self, message):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}\n"
        if self.log_text:
            self.log_text.insert(tk.END, log_message)
            self.log_text.see(tk.END)
        print(log_message.strip())

    def save_configuration(self):
        repo_path = self.repo_path_entry.get()
        remote_url = self.remote_url_entry.get()

        if not os.path.exists(repo_path):
            show_error_popup("Invalid Repository Path: The specified path does not exist.")
            return

        self.config["repo_path"] = repo_path
        self.config["remote_url"] = remote_url
        save_config(self.config)
        self.log("Configuration saved.")
        self.stop_observer()
        self.start_observer()

    def force_sync(self):
        if not self.config["repo_path"] or not self.config["remote_url"]:
            show_error_popup("Repository path and remote URL must be configured.")
            return
        threading.Thread(target=self.commit_and_push).start()

    def update_staged_changes(self):
        if self.staged_changes_text and self.config["repo_path"]:
            self.staged_changes_text.delete("1.0", tk.END)
            status_output = execute_git_command(self.config["repo_path"], ["git", "status", "--porcelain"])
            if "Error:" in status_output:
                self.staged_changes_text.insert(tk.END, f"Error fetching staged changes: {status_output}")
            else:
                self.staged_changes_text.insert(tk.END, status_output)

    def manual_commit_push(self):
        if not self.config["repo_path"] or not self.config["remote_url"]:
            show_error_popup("Repository path and remote URL must be configured.")
            return

        changes = execute_git_command(self.config["repo_path"], ["git", "status", "--porcelain"])
        if not changes:
            show_error_popup("No changes to commit.")
            return

        commit_dialog = tk.Toplevel(self.main_window)
        commit_dialog.title("Enter Commit Message")

        ttk.Label(commit_dialog, text="Commit Message:").pack(pady=5)
        commit_message_entry = tk.Text(commit_dialog, wrap=tk.WORD, height=5, width=40)
        commit_message_entry.pack(padx=10, pady=10)

        def perform_manual_commit():
            message = commit_message_entry.get("1.0", tk.END).strip()
            if not message:
                messagebox.showerror("Error", "Commit message cannot be empty.")
                return

            add_output = execute_git_command(self.config["repo_path"], ["git", "add", "."])
            if "Error:" in add_output:
                show_error_popup(f"Git add error: {add_output}")
                commit_dialog.destroy()
                return

            commit_output = execute_git_command(self.config["repo_path"], ["git", "commit", "-m", message])
            if "Error:" in commit_output:
                show_error_popup(f"Git commit error: {commit_output}")
            else:
                push_output = execute_git_command(self.config["repo_path"], ["git", "push", "origin", "main"])
                if "Error:" in push_output:
                    show_error_popup(f"Git push error: {push_output}")
                else:
                    show_notification(self.tray, "GitSync", "Changes successfully committed and pushed.") # Pass self.tray
                self.update_staged_changes()
            commit_dialog.destroy()

        ttk.Button(commit_dialog, text="Commit", command=perform_manual_commit).pack(pady=10)

# --- Main Execution ---
if __name__ == "__main__":
    app = GitSyncApp()
    app.start()