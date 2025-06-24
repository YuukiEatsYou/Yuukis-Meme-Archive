// Theme toggle functionality - Fixed version
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Get the stylesheet element by ID - this is the critical fix
  const stylesheet = document.getElementById("main-stylesheet");

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");

  // Apply saved theme if it exists
  if (savedTheme === "retro") {
    body.classList.add("retro");
    themeToggle.textContent = "TOGGLE NORMAL MODE";
    // Ensure we have the retro stylesheet
    if (stylesheet) {
      stylesheet.href = "retro-styles.css";
    }
  } else {
    body.classList.remove("retro");
    themeToggle.textContent = "TOGGLE RETRO MODE";
    // Ensure we have the normal stylesheet
    if (stylesheet) {
      stylesheet.href = "styles.css";
    }
  }

  // Toggle theme on button click
  themeToggle.addEventListener("click", function () {
    if (body.classList.contains("retro")) {
      // Switch to normal theme
      body.classList.remove("retro");
      themeToggle.textContent = "TOGGLE RETRO MODE";
      if (stylesheet) {
        stylesheet.href = "styles.css";
      }
      localStorage.setItem("theme", "normal");
    } else {
      // Switch to retro theme
      body.classList.add("retro");
      themeToggle.textContent = "TOGGLE NORMAL MODE";
      if (stylesheet) {
        stylesheet.href = "retro-styles.css";
      }
      localStorage.setItem("theme", "retro");
    }
  });
});
