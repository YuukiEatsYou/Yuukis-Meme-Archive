// script.js
import { allImages } from "./data.js";

let currentPage = 1;
const itemsPerPage = 40;
let currentFilteredImages = [];

function initializeGallery() {
  const gallery = document.getElementById("imageGallery");
  gallery.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageImages = currentFilteredImages.slice(startIndex, endIndex);

  pageImages.forEach((image) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("data-tags", image.tags.join(" "));

    item.innerHTML = `
            <img src="${image.url}" class="gallery-img" alt="Gallery image">
            <div class="tags">
                ${image.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
        `;

    const img = item.querySelector(".gallery-img");

    img.addEventListener("click", function (e) {
      e.stopPropagation();
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightboxImage");

      lightboxImg.src = this.src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    const tags = item.querySelectorAll(".tag");
    tags.forEach((tag) => {
      tag.addEventListener("click", function (e) {
        e.stopPropagation();
        const searchInput = document.getElementById("searchInput");
        searchInput.value = this.textContent;
        searchInput.dispatchEvent(new Event("input"));
      });
    });

    gallery.appendChild(item);
  });

  const existingEgg = document.querySelector(".easter-egg-container");
  if (existingEgg) existingEgg.remove();

  const isLastPage =
    currentPage === Math.ceil(currentFilteredImages.length / itemsPerPage);
  const isEmptySearch = document.getElementById("searchInput").value === "";

  if (isLastPage && isEmptySearch && currentFilteredImages.length > 0) {
    const easterEggContainer = document.createElement("div");
    easterEggContainer.className = "easter-egg-container";
    easterEggContainer.innerHTML = `
              <img src="https://github.com/YuukiEatsYou/Yuukis-Meme-Archive/blob/main/easteregg.png?raw=true"
                   alt="Surprise!"
                   class="easter-egg-image"
                   title="You found the secret!">
          `;
    document.querySelector(".main-content").appendChild(easterEggContainer);
  }

  updatePaginationControls();
  scrollToTop();
}

document.getElementById("searchInput").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  currentFilteredImages = allImages.filter((image) =>
    image.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  );
  currentPage = 1;
  initializeGallery();
});

document.getElementById("lightbox").addEventListener("click", function (e) {
  if (e.target === this) {
    this.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

document.addEventListener("keydown", function (e) {
  const lightbox = document.getElementById("lightbox");
  if (e.key === "Escape" && lightbox.classList.contains("active")) {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

const searchInput = document.getElementById("searchInput");
const clearBtn = document.querySelector(".clear-btn");

searchInput.addEventListener("input", function (e) {
  clearBtn.classList.toggle("visible", this.value.length > 0);
});

clearBtn.addEventListener("click", function () {
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("input"));
  searchInput.focus();
  clearBtn.classList.remove("visible");
});

const tagsModal = document.getElementById("tagsModal");
const tagsList = document.getElementById("tagsList");
const viewTagsBtn = document.createElement("button");
viewTagsBtn.className = "view-tags-btn";
viewTagsBtn.textContent = "View All Tags";
document.querySelector(".search-container").prepend(viewTagsBtn);

function collectTags() {
  const tagCounts = {};

  allImages.forEach((image) => {
    image.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return tagCounts;
}

viewTagsBtn.addEventListener("click", () => {
  const tags = collectTags();
  tagsList.innerHTML = Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([tag, count]) => `
            <div class="tag-count">
                <span>${tag}</span>
                <span>${count}</span>
            </div>
        `,
    )
    .join("");

  tagsModal.style.display = "block";
  setTimeout(() => tagsModal.classList.add("active"), 10);
});

function closeTagsModal() {
  tagsModal.classList.remove("active");
  setTimeout(() => (tagsModal.style.display = "none"), 300);
}

document.querySelector(".close-tags").addEventListener("click", closeTagsModal);
tagsModal.addEventListener("click", (e) => {
  if (e.target === tagsModal) closeTagsModal();
});

tagsList.addEventListener("click", (e) => {
  if (e.target.closest(".tag-count")) {
    const tag = e.target
      .closest(".tag-count")
      .querySelector("span:first-child").textContent;
    searchInput.value = tag;
    searchInput.dispatchEvent(new Event("input"));
    closeTagsModal();
    scrollToTop();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && tagsModal.classList.contains("active")) {
    closeTagsModal();
  }
});

function updatePaginationControls() {
  const totalPages = Math.ceil(currentFilteredImages.length / itemsPerPage);
  const pagination = document.createElement("div");
  pagination.className = "pagination";

  pagination.innerHTML = `
        <button ${currentPage === 1 ? "disabled" : ""} class="prev-page">Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage >= totalPages ? "disabled" : ""} class="next-page">Next</button>
    `;

  pagination.querySelector(".prev-page").addEventListener("click", () => {
    currentPage--;
    initializeGallery();
  });

  pagination.querySelector(".next-page").addEventListener("click", () => {
    currentPage++;
    initializeGallery();
  });

  const existingPagination = document.querySelector(".pagination");
  if (existingPagination) existingPagination.remove();

  document.querySelector("main").appendChild(pagination);
}

function scrollToTop() {
  try {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (e) {
    window.scrollTo(0, 0);
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

window.onload = () => {
  currentFilteredImages = [...allImages];
  initializeGallery();
};
