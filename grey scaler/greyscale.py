#GreyScaler.py

import time
import keyboard
import json
from datetime import datetime
from pathlib import Path

class GrayscaleManager:
    def __init__(self):
        self.grayscale_enabled = False
        self.TIME_FILE = Path("grayscale_time.json")
        self.CHECKPOINT_INTERVAL = 300    # Save time every 5 minutes
        self.HIBERNATION_THRESHOLD = 3600 # Consider 1 hour difference as hibernation
        self.GRAYSCALE_THRESHOLD = 1800   # Enable grayscale after 30 minutes
        self.session_start = None
        self.accumulated_time = 0
        self.last_checkpoint = None
        self.load_state()

    def load_state(self):
        """Load the last saved state from file"""
        if self.TIME_FILE.exists():
            try:
                with open(self.TIME_FILE, 'r') as f:
                    data = json.load(f)
                    self.last_checkpoint = data.get('last_time')
                    self.accumulated_time = data.get('accumulated_time', 0)
                    self.grayscale_enabled = data.get('grayscale_enabled', False)
            except json.JSONDecodeError:
                self.last_checkpoint = None
                self.accumulated_time = 0
        else:
            self.last_checkpoint = None
            self.accumulated_time = 0

    def save_state(self):
        """Save current state to file"""
        current_time = datetime.now().timestamp()
        state = {
            'last_time': current_time,
            'accumulated_time': self.accumulated_time,
            'grayscale_enabled': self.grayscale_enabled
        }
        with open(self.TIME_FILE, 'w') as f:
            json.dump(state, f)
        self.last_checkpoint = current_time

    def check_hibernation(self):
        """Detect hibernation by comparing current time with last saved time"""
        if self.last_checkpoint is None:
            self.save_state()
            return False

        current_time = datetime.now().timestamp()
        time_difference = current_time - self.last_checkpoint

        # If time difference is greater than threshold, assume hibernation occurred
        if time_difference > self.HIBERNATION_THRESHOLD:
            print(f"Detected return from hibernation. Time gap: {time_difference/3600:.2f} hours")
            # Don't reset accumulated_time here
            self.save_state()
            return True

        # Save checkpoint every CHECKPOINT_INTERVAL seconds
        if time_difference > self.CHECKPOINT_INTERVAL:
            # Add the time since last checkpoint to accumulated time
            self.accumulated_time += time_difference
            self.save_state()

        return False

    def toggle_grayscale(self):
        """Simulates Windows + Ctrl + C keystroke"""
        keyboard.press('windows+ctrl+c')
        keyboard.release('windows+ctrl+c')
        self.grayscale_enabled = not self.grayscale_enabled
        self.save_state()  # Save state after toggling
        print(f"Grayscale {'enabled' if self.grayscale_enabled else 'disabled'}")

    def manage_session(self):
        """Main logic for managing grayscale based on session time"""
        current_time = time.time()
        
        # Initialize session if needed
        if self.session_start is None:
            self.session_start = current_time
            if not self.check_hibernation():  # If not returning from hibernation
                self.accumulated_time = 0  # Reset only if it's a fresh start
                self.save_state()
            return

        # Check for hibernation
        if self.check_hibernation():
            # Just update the session start time, keep accumulated time
            self.session_start = current_time
            return

        # Update accumulated time with current session
        current_session_time = current_time - self.session_start
        total_time = self.accumulated_time + current_session_time

        # Check if we need to enable grayscale based on total time
        if total_time >= self.GRAYSCALE_THRESHOLD and not self.grayscale_enabled:
            self.toggle_grayscale()

    def run(self):
        """Main loop to continuously monitor and manage grayscale"""
        print(f"Grayscale Manager started. Accumulated time: {self.accumulated_time:.1f} seconds")
        print("Press Ctrl+C to exit.")
        try:
            while True:
                self.manage_session()
                time.sleep(1)  # Check every second
        except KeyboardInterrupt:
            if self.grayscale_enabled:
                self.toggle_grayscale()  # Ensure grayscale is disabled when script stops
        finally:
            self.save_state()  # Save final state before exit

if __name__ == "__main__":
    manager = GrayscaleManager()
    manager.run()