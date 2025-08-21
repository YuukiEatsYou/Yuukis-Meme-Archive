// Joke ads data
const jokeAds = [
  {
    title: "FREE RAM DOWNLOAD!",
    text: "Double your computer memory instantly! Click here!",
    image: "https://pbs.twimg.com/media/Gmw-nNBWwAAzmJY?format=jpg&name=large",
  },
  {
    title: "YOU'VE WON A PRIZE!",
    text: "Congratulations! You're our 1,000,000th visitor!",
    image: "https://pbs.twimg.com/media/Gndb_U1WsAAaKLc?format=jpg&name=large",
  },
  {
    title: "GIT RIPPED IN SECONDS",
    text: "Try this new fitness program! Only 50$ a month!",
    image: "https://pbs.twimg.com/media/GplDs2WWoAA5DlO?format=jpg&name=large",
  },
  {
    title: "LIMITED TIME OFFER!",
    text: "2 Coffin's for the price of 1! Only while supply lasts!",
    image: "https://pbs.twimg.com/media/Gpk9rCBWgAAmfrn?format=jpg&name=large",
  },
  {
    title: "HOT GIRLS IN YOUR AREA!",
    text: "She will give you a night that you will neither forget nor survive",
    image: "https://pbs.twimg.com/media/Gm6U17XXQAA36na?format=jpg&name=large",
  },
];

// Function to show an ad
function showAd() {
  // Prevent multiple ads showing at once
  if (document.querySelector(".ad-modal")) return;

  // Select a random ad
  const ad = jokeAds[Math.floor(Math.random() * jokeAds.length)];

  // Create ad element
  const adModal = document.createElement("div");
  adModal.className = "sp-modal";
  adModal.innerHTML = `
        <div class="sp-header">
            <div class="sp-title">${ad.title}</div>
            <button class="close-sp">✕</button>
        </div>
        <div class="sp-content">
            <img src="${ad.image}" alt="Sp" class="sp-img">
            <div class="sp-text">${ad.text}</div>
        </div>
    `;

  document.body.appendChild(adModal);

  // Add close functionality
  const closeBtn = adModal.querySelector(".close-sp");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(adModal);
  });
}

showAd();
