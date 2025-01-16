### Discord (r/IBDP45) - The Engine Room

**Purpose:** To facilitate focused collaboration, real-time interaction, accountability partnerships, and personalized progress tracking through the `crac45` bot.

**Server Structure:**

* **Welcome & Rules:**  Channel for new members with clear guidelines and instructions.
* **Announcements:**  For important updates and information from moderators.
* **General Discussion:**  A casual space for community chatter (with potential slow mode).
* **Subject Channels:** Dedicated channels for each IB subject, mirroring Reddit but with a more immediate discussion format.
* **Study Groups:**  Channels for students taking the same subjects to collaborate on specific topics or assignments.
* **Accountability Hub:**  The central channel for progress updates and buddy interactions.
  * Dedicated individual threads for each member (see below).
* **Pomodoro/Study Rooms (VC):** Voice channels for focused study sessions with `crac45` tracking.
* **Music Lounge (VC):** A voice channel for playing music using `crac45`.
* **Bot Commands:**  A designated channel for interacting with the `crac45` bot.
* **Staff Channels:** Private channels for moderators and admins.

**Individual Progress Threads:**

* **Purpose:** Each member gets a personal thread within the "Accountability Hub" channel.
* **Functionality:**
  * Members post daily or regular progress updates on their study goals and achievements.
  * Buddies can provide encouragement and feedback within these threads.
  * The `crac45` bot can potentially summarize progress or highlight trends over time.

**Assigned Buddies for Accountability:**

* **Matching Algorithm:** The `crac45` bot will pair members based on factors like subjects taken, time zone, current grades, and stated availability.
* **Accountability Checkups:**
  * The bot sends regular reminders to buddies to check in with each other.
  * Suggested check-up questions: "What are your goals for today/this week?", "What challenges are you facing?", "How can I support you?", "Did you complete your planned tasks?".
* **Buddy Communication:**  Buddies can communicate within their individual progress threads or in direct messages.

**Competitive Sprints:**

* **Buddy vs. Buddy:** Individuals compete against their assigned buddy on task completion or study time over a set period.
* **Buddy Pair vs. Buddy Pair:** Teams of two buddies compete against another team.
* **Tournaments:** Server wide study marathons. (people can either participate in buddy pairs or go in individually for an extra gruesome challenge)
  * "Frenzy Friday" - buddy pair vs buddy pair marathons (this happens on the discord actually, not the reddit page)
* **Tracking and Scoring:** The `crac45` bot tracks progress based on input from members. Scoring can be based on the number of tasks completed, study time accumulated, or a combination.
* **Rewards (Optional):**  Consider implementing a simple reward system (e.g., bragging rights, special Discord roles).

**`crac45` Bot Functionality:**

* **Buddy Management:**
  * Assignment and reassignment of buddies (manual override for specific requests).
  * Sending reminder messages for accountability checkups.
  * Facilitating competitive sprints and tracking scores.
* **Streaks and Point-Based Progress:**
  * Tracking daily/weekly study streaks.
  * Point system for task completion (preset values or buddy-assigned).
  * Leaderboards (optional, may foster unhealthy competition for some).
* **Reporting to Batcave:**  Data on study sessions, task completion, and potentially energy levels will be sent to the web portal.
* **VC Functionality:**
  * **Study Time Tracker:** Tracks time spent in designated study voice channels.
  * **Break Recording:**
    * Basic: Members send a command like `!break start` and `!break end`.
    * Advanced: Keyword listening for common break-related phrases (e.g., "brb," "taking a break"). Accuracy and privacy need careful consideration.
  * **Music Streaming:** Plays music from Spotify links within the VC. Ensure bot permissions and stability.
  * **Auto VC creation and deletion:** For Grp study sessions of 3-4 or 5-6 ppl the bot will create a special VC channel as per commnad for the members of that particular group (called through "@" mentions). (the bot will create VC roles for that grp study instance and then assign those roles to the grp study members and then they will be able to join the grp VC).
* **Slow Mode Control:** Dynamically adjusts slow mode based on message rate in channels to manage chat flow.