document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build card content
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        participantsSection.style.marginTop = "10px";
        participantsSection.style.background = "#e8f5e9";
        participantsSection.style.border = "1px solid #a5d6a7";
        participantsSection.style.borderRadius = "4px";
        participantsSection.style.padding = "10px";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants";
        participantsTitle.style.margin = "0 0 8px 0";
        participantsTitle.style.color = "#388e3c";
        participantsSection.appendChild(participantsTitle);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        participantsList.style.listStyleType = "disc";
        participantsList.style.marginLeft = "20px";
        participantsList.style.color = "#2e7d32";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach(participant => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.padding = "2px 0";

            // Participant name
            const nameSpan = document.createElement("span");
            nameSpan.textContent = participant;
            nameSpan.style.flex = "1";
            li.appendChild(nameSpan);

            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "&#128465;"; // Trash can emoji
            deleteBtn.title = "Remove participant";
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.style.background = "none";
            deleteBtn.style.border = "none";
            deleteBtn.style.color = "#c62828";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.fontSize = "1.1em";

            deleteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              deleteBtn.disabled = true;
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(participant)}`,
                  { method: "POST" }
                );
                if (response.ok) {
                  li.remove();
                } else {
                  deleteBtn.disabled = false;
                  alert("Failed to remove participant.");
                }
              } catch (err) {
                deleteBtn.disabled = false;
                alert("Error removing participant.");
              }
            });
            li.appendChild(deleteBtn);

            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet.";
          li.style.color = "#888";
          participantsList.appendChild(li);
        }
        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show new participant
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
