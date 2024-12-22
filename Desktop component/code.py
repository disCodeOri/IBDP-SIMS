import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog
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
import platform

# --- Configuration ---
CONFIG_FILE = "repo_config.json"

def load_config():
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Create the file if it doesn't exist
        with open(CONFIG_FILE, "w") as f:
            json.dump({"repositories": []}, f, indent=4)
        return {"repositories": []}

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

def show_notification(tray, title, message):
    try:
        tray.notify(message, title)
    except Exception as e:
        print(f"Error showing notification: {e}")

def show_fading_notification(message, is_error=False):
    window = tk.Toplevel()
    window.overrideredirect(True)  # Remove window decorations

    label = tk.Label(window, text=message, padx=20, pady=10, bg="lightgreen" if not is_error else "lightcoral", fg="black")
    label.pack()

    screen_width = window.winfo_screenwidth()
    screen_height = window.winfo_screenheight()
    window_width = label.winfo_reqwidth()
    window_height = label.winfo_reqheight()
    x = screen_width - window_width - 20
    y = screen_height - window_height - 20
    window.geometry(f"+{x}+{y}") # Set geometry
    window.attributes('-alpha', 0) # Initial transparency 0

    def fade_in(alpha=0):
        if alpha < 1:
            alpha += 0.1
            window.attributes('-alpha', alpha)
            window.after(20, lambda: fade_in(alpha))
        else:
            window.after(3000 if not is_error else 5000, fade_out) # Hold notification for a while

    def fade_out(alpha=1):
        if alpha > 0:
            alpha -= 0.1
            window.attributes('-alpha', alpha)
            window.after(20, lambda: fade_out(alpha))
        else:
            window.destroy()

    fade_in()

# --- File System Monitor ---
class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, app):
        self.app = app

    def on_any_event(self, event):
        if event.is_directory:
            return None

        if event.src_path.endswith("~") or event.src_path.endswith(".swp"):
            return None

        self.app.schedule_commit()

# --- Main Application Class ---
class GitSyncApp:
    def __init__(self):
        self.config = load_config()
        self.tray = None
        self.main_window = tk.Tk()  # Create main window here
        self.log_text = None
        self.staged_changes_text = None
        self.commit_scheduled = False
        self.observer = None
        self.active_repo_var = None # Initialize within the create window method

    def start(self):
        icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon.png")
        image = Image.open(icon_path)
        menu = (
            pystray.MenuItem("Show Application", self.show_window), # Added this line
            pystray.MenuItem("Exit", self.quit_app),
        )
        self.tray = pystray.Icon("GitSync", image, "Git Synchronization", menu)
        self.tray.on_click = lambda icon, item: self.show_window()
        self.tray.run_detached()

        self.create_main_window() # build the rest of the window
        self.load_repositories()
        self.start_observer()
        self.start_scheduler()
        self.show_startup_notification()
        self.main_window.withdraw()  # hide window on startup

    def load_repositories(self):
        if self.config["repositories"]:
            # Set the first repository as active if available
           if self.active_repo_var: # check if initialized
               self.active_repo_var.set(self.config["repositories"][0].get("name", ""))

    def get_active_repo_config(self):
        if self.active_repo_var: # check if initialized
           active_repo_name = self.active_repo_var.get()
           for repo in self.config["repositories"]:
               if repo.get("name") == active_repo_name:
                   return repo
        return None

    def start_observer(self):
        active_repo = self.get_active_repo_config()
        if active_repo and active_repo["path"] and os.path.exists(active_repo["path"]):
            event_handler = FileChangeHandler(self)
            self.observer = Observer()
            self.observer.schedule(event_handler, active_repo["path"], recursive=True)
            self.observer.start()
            self.log(f"File system monitoring started for: {active_repo['name']}")
        else:
            self.log("No active repository configured or path does not exist. File system monitoring not started.")

    def stop_observer(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()
            self.log("File system monitoring stopped.")

    def start_scheduler(self):
        schedule.every(60).seconds.do(self.periodic_pull) # Assuming a default interval
        threading.Thread(target=self.run_scheduler, daemon=True).start()
        self.log("Periodic pull scheduled every 60 seconds.")

    def run_scheduler(self):
        while True:
            schedule.run_pending()
            time.sleep(1)

    def schedule_commit(self):
        if not self.commit_scheduled:
            self.commit_scheduled = True
            threading.Timer(5, self.commit_and_push).start()

    def commit_and_push(self):
        active_repo = self.get_active_repo_config()
        if not active_repo or not active_repo["path"] or not active_repo["url"]:
            self.log("Active repository not fully configured.")
            self.commit_scheduled = False
            return

        repo_path = active_repo["path"]
        self.log(f"Checking for changes in: {active_repo['name']}...")
        status_output = execute_git_command(repo_path, ["git", "status", "--porcelain"])
        if "Error:" in status_output:
            self.log(f"Git status error: {status_output}")
            show_fading_notification(f"Git status error: {status_output}", is_error=True)
            self.commit_scheduled = False
            return

        if status_output:
            self.log("Changes detected. Staging, committing, and pushing...")
            add_output = execute_git_command(repo_path, ["git", "add", "."])
            if "Error:" in add_output:
                self.log(f"Git add error: {add_output}")
                show_fading_notification(f"Git add error: {add_output}", is_error=True)
                self.commit_scheduled = False
                return

            commit_message = f"Automatic commit at {time.strftime('%Y-%m-%d %H:%M:%S')}"
            commit_output = execute_git_command(repo_path, ["git", "commit", "-m", commit_message])
            if "Error:" in commit_output:
                self.log(f"Git commit error: {commit_output}")
                show_fading_notification(f"Git commit error: {commit_output}", is_error=True)
                self.commit_scheduled = False
                return

            push_output = execute_git_command(repo_path, ["git", "push", "origin", "main"])
            if "Error:" in push_output:
                self.log(f"Git push error: {push_output}")
                show_fading_notification(f"Git push error: {push_output}", is_error=True)
            else:
                self.log("Changes successfully committed and pushed.")
                show_notification(self.tray, "GitSync", f"Changes in {active_repo['name']} successfully committed and pushed.")
        else:
            self.log("No changes to commit.")

        self.commit_scheduled = False
        if self.main_window and self.main_window.winfo_exists():
            self.update_staged_changes()

    def periodic_pull(self):
        active_repo = self.get_active_repo_config()
        if not active_repo or not active_repo["path"] or not active_repo["url"]:
            return

        repo_path = active_repo["path"]
        self.log(f"Performing periodic pull for: {active_repo['name']}...")
        pull_output = execute_git_command(repo_path, ["git", "pull", "origin", "main"])
        self.log(f"Pull output for {active_repo['name']}: {pull_output}")
        if "error" in pull_output.lower() or "conflict" in pull_output.lower():
            show_fading_notification(f"Error during periodic pull for {active_repo['name']}: {pull_output}", is_error=True)
        elif "Already up to date" not in pull_output:
            show_notification(self.tray, "GitSync", f"Successfully pulled changes for {active_repo['name']}.")

    def show_window(self, icon=None, item=None):
        self.main_window.deiconify()
        self.update_staged_changes()

    def create_main_window(self):
        self.main_window.title("Git Synchronization Tool")
        self.main_window.geometry("600x450")
        self.main_window.protocol("WM_DELETE_WINDOW", self.hide_window)

        # Initialize active_repo_var here
        self.active_repo_var = tk.StringVar()

        # --- Repository Selection ---
        ttk.Label(self.main_window, text="Active Repository:").pack(pady=5)
        repo_names = [repo.get("name", "") for repo in self.config["repositories"]]
        self.active_repo_var.set(repo_names[0] if repo_names else "")  # Set initial value
        repo_dropdown = ttk.Combobox(self.main_window, textvariable=self.active_repo_var, values=repo_names)
        repo_dropdown.pack(pady=5)
        repo_dropdown.bind("<<ComboboxSelected>>", self.on_repo_change)

        # --- Tabs ---
        notebook = ttk.Notebook(self.main_window)

        # --- Status Tab ---
        status_tab = ttk.Frame(notebook)
        ttk.Label(status_tab, text="Repository Name:").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.repo_name_entry = ttk.Entry(status_tab, width=40)
        self.repo_name_entry.grid(row=0, column=1, sticky="ew", padx=5, pady=5)

        ttk.Label(status_tab, text="Repository Path:").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.repo_path_entry = ttk.Entry(status_tab, width=40)
        self.repo_path_entry.grid(row=1, column=1, sticky="ew", padx=5, pady=5)

        ttk.Label(status_tab, text="Remote URL:").grid(row=2, column=0, sticky="w", padx=5, pady=5)
        self.remote_url_entry = ttk.Entry(status_tab, width=40)
        self.remote_url_entry.grid(row=2, column=1, sticky="ew", padx=5, pady=5)

        ttk.Button(status_tab, text="Save/Add Repository", command=self.save_repository_config).grid(row=3, column=0, columnspan=2, pady=10)
        ttk.Button(status_tab, text="Force Sync Now", command=self.force_sync).grid(row=4, column=0, columnspan=2, pady=5)
        notebook.add(status_tab, text="Status")

        # --- Changes Tab ---
        changes_tab = ttk.Frame(notebook)
        ttk.Label(changes_tab, text="Staged Changes:").pack(pady=5)
        self.staged_changes_text = scrolledtext.ScrolledText(changes_tab, wrap=tk.WORD, height=10)
        self.staged_changes_text.pack(fill="both", expand=True, padx=5, pady=5)
        ttk.Button(changes_tab, text="Stage Changes", command=self.stage_all_changes).pack(pady=5)  # New stage button
        ttk.Button(changes_tab, text="Commit and Push", command=self.manual_commit_push).pack(pady=10)
        notebook.add(changes_tab, text="Changes")

        # --- Log Tab ---
        log_tab = ttk.Frame(notebook)
        ttk.Label(log_tab, text="Event Log:").pack(pady=5)
        self.log_text = scrolledtext.ScrolledText(log_tab, wrap=tk.WORD, height=10)
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)
        notebook.add(log_tab, text="Log")

        notebook.pack(expand=True, fill="both")
        self.load_active_repo_details() # Load details for the initially selected repo

    def on_repo_change(self, event):
        self.load_active_repo_details()
        self.stop_observer()
        self.start_observer()

    def load_active_repo_details(self):
        active_repo = self.get_active_repo_config()
        if active_repo:
            self.repo_name_entry.delete(0, tk.END)
            self.repo_name_entry.insert(0, active_repo.get("name", ""))
            self.repo_path_entry.delete(0, tk.END)
            self.repo_path_entry.insert(0, active_repo.get("path", ""))
            self.remote_url_entry.delete(0, tk.END)
            self.remote_url_entry.insert(0, active_repo.get("url", ""))

    def hide_window(self, icon=None):
        if self.main_window:
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

    def save_repository_config(self):
        repo_name = self.repo_name_entry.get().strip()
        repo_path = self.repo_path_entry.get().strip()
        remote_url = self.remote_url_entry.get().strip()

        if not repo_name or not remote_url:
            show_fading_notification("Repository Name and Remote URL are required.", is_error=True)
            return

        if not repo_path:
            # Prompt for folder selection if path is missing
            repo_path = filedialog.askdirectory(title="Select Repository Folder")
            if not repo_path:
                return
            # Attempt to clone the repository
            self.log(f"Attempting to clone repository to: {repo_path}")
            clone_output = execute_git_command(os.path.dirname(repo_path), ["git", "clone", remote_url, os.path.basename(repo_path)])
            if "Error:" in clone_output:
                show_fading_notification(f"Error cloning repository: {clone_output}", is_error=True)
                return
            else:
                self.log(f"Repository cloned successfully to: {repo_path}")

        # Check if repository already exists
        for repo in self.config["repositories"]:
            if repo["name"] == repo_name:
                repo["path"] = repo_path
                repo["url"] = remote_url
                break
        else:
            self.config["repositories"].append({"name": repo_name, "path": repo_path, "url": remote_url})

        save_config(self.config)
        self.load_repositories() # Reload to update dropdown
        self.log(f"Repository '{repo_name}' configuration saved.")

    def force_sync(self):
        if not self.get_active_repo_config():
            show_fading_notification("No active repository selected.", is_error=True)
            return
        threading.Thread(target=self.commit_and_push).start()

    def stage_all_changes(self):
        active_repo = self.get_active_repo_config()
        if not active_repo or not active_repo["path"]:
            show_fading_notification("No active repository configured.", is_error=True)
            return

        repo_path = active_repo["path"]
        add_output = execute_git_command(repo_path, ["git", "add", "."])
        if "Error:" in add_output:
           show_fading_notification(f"Git add error: {add_output}", is_error=True)
        else:
            self.log("All changes staged successfully.")
            self.update_staged_changes()  # Update after staging

    def update_staged_changes(self):
        self.staged_changes_text.delete("1.0", tk.END)
        active_repo = self.get_active_repo_config()
        if active_repo and active_repo["path"]:
            status_output = execute_git_command(active_repo["path"], ["git", "status", "--porcelain"])
            if "Error:" in status_output:
                self.staged_changes_text.insert(tk.END, f"Error fetching staged changes: {status_output}")
            else:
                 self.staged_changes_text.insert(tk.END, status_output)
        else:
             self.staged_changes_text.insert(tk.END, "No active repository selected or path not configured.")


    def manual_commit_push(self):
        active_repo = self.get_active_repo_config()
        if not active_repo or not active_repo["path"] or not active_repo["url"]:
           show_fading_notification("Active repository not fully configured.", is_error=True)
           return

        repo_path = active_repo["path"]
        changes = execute_git_command(repo_path, ["git", "status", "--porcelain"])
        if not changes:
            show_fading_notification("No changes to commit.", is_error=True)
            return

        commit_dialog = tk.Toplevel(self.main_window)
        commit_dialog.title("Enter Commit Message")

        ttk.Label(commit_dialog, text="Commit Message:").pack(pady=5)
        commit_message_entry = tk.Text(commit_dialog, wrap=tk.WORD, height=5, width=40)
        commit_message_entry.pack(padx=10, pady=10)

        def perform_manual_commit():
            message = commit_message_entry.get("1.0", tk.END).strip()
            if not message:
                show_fading_notification("Commit message cannot be empty.", is_error=True)
                return

            add_output = execute_git_command(repo_path, ["git", "add", "."])
            if "Error:" in add_output:
                show_fading_notification(f"Git add error: {add_output}", is_error=True)
                commit_dialog.destroy()
                return

            commit_output = execute_git_command(repo_path, ["git", "commit", "-m", message])
            if "Error:" in commit_output:
                show_fading_notification(f"Git commit error: {commit_output}", is_error=True)
            else:
                push_output = execute_git_command(repo_path, ["git", "push", "origin", "main"])
                if "Error:" in push_output:
                    show_fading_notification(f"Git push error: {push_output}", is_error=True)
                else:
                    show_notification(self.tray, "GitSync", f"Changes in {active_repo['name']} successfully committed and pushed.")
                self.update_staged_changes()
            commit_dialog.destroy()

        ttk.Button(commit_dialog, text="Commit", command=perform_manual_commit).pack(pady=10)

    def show_startup_notification(self):
        # Startup notification with smooth transition and fade-out
        active_repo = self.get_active_repo_config()
        message = "GitSyncBot Running and functional\n"
        if active_repo:
            message += f"Active Repo: {active_repo['name']}\n"
        message += f"Pull schedule: Every 60 seconds\n" # Assuming default

        # Check for changes in all repos
        changed_repos = self.check_for_changes_across_repos()
        if changed_repos:
           message += f"Repos with changes: {', '.join(changed_repos)}"

        show_fading_notification(message) # show smooth transition notification

    def check_for_changes_across_repos(self):
        changed_repos = []
        for repo in self.config["repositories"]:
            repo_path = repo.get("path")
            if repo_path:
                status_output = execute_git_command(repo_path, ["git", "status", "--porcelain"])
                if status_output and "Error:" not in status_output: # If there are changes and no git error.
                    changed_repos.append(repo["name"])
        return changed_repos
# --- Main Execution ---
if __name__ == "__main__":
    app = GitSyncApp()
    app.start()
    app.main_window.mainloop()