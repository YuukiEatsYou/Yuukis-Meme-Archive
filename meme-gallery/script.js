// script.js - Yuuki's Meme Archive Gallery
// A feature-rich meme gallery with search, pagination, lightbox, and tag browsing
import { allImages } from "./data.js";

/**
 * MemeGallery - Main class for managing the meme gallery interface
 *
 * Features:
 * - Image gallery with pagination (40 images per page)
 * - Tag-based search and filtering
 * - Lightbox modal for full-size image viewing
 * - Tag browsing modal with usage counts
 * - Easter egg on the last page
 * - Accessibility support with keyboard navigation
 * - Error handling for failed image loads
 */
class MemeGallery {
  /**
   * Constructor - Initializes the gallery with default state and cached DOM elements
   */
  constructor() {
    // Gallery state management
    this.currentPage = 1;
    this.itemsPerPage = 40;
    this.currentFilteredImages = [...allImages]; // Clone to avoid modifying original
    this.tagCounts = this.collectTags(); // Pre-calculate tag usage counts

    // Cache frequently accessed DOM elements for performance
    this.elements = {
      gallery: document.getElementById("imageGallery"),
      searchInput: document.getElementById("searchInput"),
      clearBtn: document.querySelector(".clear-btn"),
      lightbox: document.getElementById("lightbox"),
      lightboxImg: document.getElementById("lightboxImage"),
      tagsModal: document.getElementById("tagsModal"),
      tagsList: document.getElementById("tagsList"),
      mainContent: document.querySelector(".main-content"),
      main: document.querySelector("main"),
    };

    this.init();
  }

  /**
   * Initialize the gallery - Sets up UI elements and event listeners
   */
  init() {
    this.createViewTagsButton();
    this.attachEventListeners();
    this.render();
  }

  /**
   * Creates and adds the "View All Tags" button to the search container
   */
  createViewTagsButton() {
    const viewTagsBtn = document.createElement("button");
    viewTagsBtn.className = "view-tags-btn";
    viewTagsBtn.textContent = "View All Tags";
    document.querySelector(".search-container").prepend(viewTagsBtn);
    this.elements.viewTagsBtn = viewTagsBtn;
  }

  /**
   * Attaches all event listeners for the gallery functionality
   * Uses .bind() to maintain proper 'this' context in event handlers
   */
  attachEventListeners() {
    // Search functionality - filters images as user types
    this.elements.searchInput.addEventListener(
      "input",
      this.handleSearch.bind(this),
    );

    // Clear search button - resets search and shows all images
    this.elements.clearBtn.addEventListener(
      "click",
      this.handleClear.bind(this),
    );

    // Lightbox modal - closes when clicking outside the image
    this.elements.lightbox.addEventListener(
      "click",
      this.handleLightboxClick.bind(this),
    );

    // Tags modal events - open/close and tag selection
    this.elements.viewTagsBtn.addEventListener(
      "click",
      this.openTagsModal.bind(this),
    );
    document
      .querySelector(".close-tags")
      .addEventListener("click", this.closeTagsModal.bind(this));
    this.elements.tagsModal.addEventListener(
      "click",
      this.handleTagsModalClick.bind(this),
    );
    this.elements.tagsList.addEventListener(
      "click",
      this.handleTagSelection.bind(this),
    );

    // Global keyboard events - ESC key handling for modals
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  /**
   * Collects and counts all tags across all images
   * @returns {Object} Object with tag names as keys and usage counts as values
   */
  collectTags() {
    const tagCounts = {};
    allImages.forEach((image) => {
      image.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  }

  /**
   * Handles search input events - filters images based on tag matches
   * @param {Event} e - Input event from search field
   */
  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Filter images based on search term (case-insensitive, partial matches)
    if (searchTerm === "") {
      this.currentFilteredImages = [...allImages];
    } else {
      this.currentFilteredImages = allImages.filter((image) =>
        image.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Reset to first page when search changes
    this.currentPage = 1;
    this.updateClearButtonVisibility();
    this.render();
  }

  /**
   * Handles clear button click - resets search input and triggers new search
   */
  handleClear() {
    this.elements.searchInput.value = "";
    this.elements.searchInput.dispatchEvent(new Event("input"));
    this.elements.searchInput.focus();
  }

  /**
   * Shows/hides the clear button based on search input content
   */
  updateClearButtonVisibility() {
    this.elements.clearBtn.classList.toggle(
      "visible",
      this.elements.searchInput.value.length > 0,
    );
  }

  /**
   * Handles clicks on the lightbox overlay - closes lightbox when clicking outside image
   * @param {Event} e - Click event
   */
  handleLightboxClick(e) {
    if (e.target === this.elements.lightbox) {
      this.closeLightbox();
    }
  }

  /**
   * Opens the lightbox modal with the specified image
   * @param {string} imageSrc - URL of the image to display
   */
  openLightbox(imageSrc) {
    this.elements.lightboxImg.src = imageSrc;
    this.elements.lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  /**
   * Closes the lightbox modal and restores page scrolling
   */
  closeLightbox() {
    this.elements.lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  /**
   * Opens the tags modal and populates it with all tags sorted by usage count
   * Tags are sorted from most used to least used for better UX
   */
  openTagsModal() {
    const sortedTags = Object.entries(this.tagCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(
        ([tag, count]) =>
          `<div class="tag-count" role="button" tabindex="0" aria-label="Search for ${tag} (${count} images)">
          <span>${this.escapeHtml(tag)}</span>
          <span>${count}</span>
        </div>`,
      )
      .join("");

    this.elements.tagsList.innerHTML = sortedTags;
    this.elements.tagsModal.style.display = "block";
    // Small delay for smooth animation
    setTimeout(() => this.elements.tagsModal.classList.add("active"), 10);
  }

  /**
   * Closes the tags modal with fade-out animation
   */
  closeTagsModal() {
    this.elements.tagsModal.classList.remove("active");
    // Wait for animation to complete before hiding
    setTimeout(() => (this.elements.tagsModal.style.display = "none"), 300);
  }

  /**
   * Handles clicks on the tags modal overlay - closes modal when clicking outside content
   * @param {Event} e - Click event
   */
  handleTagsModalClick(e) {
    if (e.target === this.elements.tagsModal) {
      this.closeTagsModal();
    }
  }

  /**
   * Handles tag selection in the tags modal - triggers search for selected tag
   * @param {Event} e - Click event
   */
  handleTagSelection(e) {
    const tagElement = e.target.closest(".tag-count");
    if (tagElement) {
      const tag = tagElement.querySelector("span:first-child").textContent;
      this.searchForTag(tag);
    }
  }

  /**
   * Searches for a specific tag by setting it in the search input
   * @param {string} tag - Tag name to search for
   */
  searchForTag(tag) {
    this.elements.searchInput.value = tag;
    this.elements.searchInput.dispatchEvent(new Event("input"));
    this.closeTagsModal();
    this.scrollToTop();
  }

  /**
   * Handles global keyboard events - ESC key for closing modals
   * @param {Event} e - Keyboard event
   */
  handleKeydown(e) {
    if (e.key === "Escape") {
      if (this.elements.lightbox.classList.contains("active")) {
        this.closeLightbox();
      } else if (this.elements.tagsModal.classList.contains("active")) {
        this.closeTagsModal();
      }
    }
  }

  /**
   * Creates a single gallery item element with image and tags
   * @param {Object} image - Image object with url and tags properties
   * @returns {HTMLElement} Gallery item DOM element
   */
  createGalleryItem(image) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("data-tags", image.tags.join(" ")); // For potential CSS filtering

    // Create tags HTML with accessibility attributes
    const tagsHtml = image.tags
      .map(
        (tag) =>
          `<span class="tag" role="button" tabindex="0" aria-label="Search for ${tag}">${this.escapeHtml(tag)}</span>`,
      )
      .join("");

    // Build the gallery item HTML
    item.innerHTML = `
      <img src="${image.url}" class="gallery-img" alt="Meme image" loading="lazy">
      <div class="tags">${tagsHtml}</div>
    `;

    // Add event listeners to the created elements
    const img = item.querySelector(".gallery-img");
    const tags = item.querySelectorAll(".tag");

    // Image click handler - opens lightbox
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openLightbox(img.src);
    });

    // Image error handler - hides broken images and logs warning
    img.addEventListener("error", (e) => {
      console.warn("Failed to load image:", image.url);
      e.target.style.display = "none";
    });

    // Tag click and keyboard handlers - searches for clicked tag
    tags.forEach((tag) => {
      tag.addEventListener("click", (e) => {
        e.stopPropagation();
        this.searchForTag(tag.textContent);
      });

      // Keyboard accessibility for tags
      tag.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.searchForTag(tag.textContent);
        }
      });
    });

    return item;
  }

  /**
   * Renders the main image gallery for the current page
   * Uses document fragments for efficient DOM manipulation
   */
  renderGallery() {
    // Clear existing gallery content
    this.elements.gallery.innerHTML = "";

    // Calculate which images to show on current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageImages = this.currentFilteredImages.slice(startIndex, endIndex);

    // Use document fragment for batch DOM operations (better performance)
    const fragment = document.createDocumentFragment();

    pageImages.forEach((image) => {
      const item = this.createGalleryItem(image);
      fragment.appendChild(item);
    });

    // Add all items to the gallery at once
    this.elements.gallery.appendChild(fragment);
  }

  /**
   * Renders the easter egg image on the last page (only when not searching)
   * The easter egg appears only when viewing all images on the final page
   */
  renderEasterEgg() {
    // Remove any existing easter egg
    const existingEgg = document.querySelector(".easter-egg-container");
    if (existingEgg) existingEgg.remove();

    // Check conditions for showing easter egg
    const isLastPage =
      this.currentPage ===
      Math.ceil(this.currentFilteredImages.length / this.itemsPerPage);
    const isEmptySearch = this.elements.searchInput.value.trim() === "";

    // Show easter egg only on last page with no active search
    if (isLastPage && isEmptySearch && this.currentFilteredImages.length > 0) {
      const easterEggContainer = document.createElement("div");
      easterEggContainer.className = "easter-egg-container";
      easterEggContainer.innerHTML = `
        <img src="https://github.com/YuukiEatsYou/Yuukis-Meme-Archive/blob/main/easteregg.png?raw=true"
             alt="Surprise! You found the secret easter egg!"
             class="easter-egg-image"
             title="You found the secret!"
             loading="lazy">
      `;
      this.elements.mainContent.appendChild(easterEggContainer);
    }
  }

  /**
   * Creates and updates pagination controls based on current state
   * Pagination is hidden for single-page results
   */
  updatePaginationControls() {
    const totalPages = Math.ceil(
      this.currentFilteredImages.length / this.itemsPerPage,
    );

    // Remove existing pagination controls
    const existingPagination = document.querySelector(".pagination");
    if (existingPagination) existingPagination.remove();

    // Don't show pagination if there's only one page or no results
    if (totalPages <= 1) return;

    // Create pagination container with accessibility attributes
    const pagination = document.createElement("div");
    pagination.className = "pagination";
    pagination.setAttribute("role", "navigation");
    pagination.setAttribute("aria-label", "Gallery pagination");

    const prevDisabled = this.currentPage === 1;
    const nextDisabled = this.currentPage >= totalPages;

    // Build pagination HTML with accessibility features
    pagination.innerHTML = `
      <button ${prevDisabled ? "disabled" : ""}
              class="prev-page"
              aria-label="Go to previous page">
        Previous
      </button>
      <span class="page-info" aria-live="polite">
        Page ${this.currentPage} of ${totalPages}
      </span>
      <button ${nextDisabled ? "disabled" : ""}
              class="next-page"
              aria-label="Go to next page">
        Next
      </button>
    `;

    // Add event listeners for pagination buttons
    if (!prevDisabled) {
      pagination.querySelector(".prev-page").addEventListener("click", () => {
        this.currentPage--;
        this.render();
      });
    }

    if (!nextDisabled) {
      pagination.querySelector(".next-page").addEventListener("click", () => {
        this.currentPage++;
        this.render();
      });
    }

    // Add pagination to the page
    this.elements.main.appendChild(pagination);
  }

  /**
   * Smoothly scrolls to the top of the page with fallback for older browsers
   * Ensures consistent behavior across different browsers
   */
  scrollToTop() {
    try {
      // Modern smooth scrolling
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (e) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }

    // Ensure scroll works by setting multiple scroll properties
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  /**
   * Escapes HTML characters to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} HTML-escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Main render method - updates all gallery components
   * Includes error handling to prevent complete gallery failure
   */
  render() {
    try {
      this.renderGallery();
      this.renderEasterEgg();
      this.updatePaginationControls();
      this.scrollToTop();
    } catch (error) {
      console.error("Error rendering gallery:", error);
      // Could add user-facing error message here if needed
    }
  }

  /**
   * Public API: Updates the search programmatically
   * @param {string} searchTerm - Term to search for
   */
  updateSearch(searchTerm) {
    this.elements.searchInput.value = searchTerm;
    this.elements.searchInput.dispatchEvent(new Event("input"));
  }

  /**
   * Public API: Navigates to a specific page
   * @param {number} page - Page number to navigate to (1-based)
   */
  goToPage(page) {
    const totalPages = Math.ceil(
      this.currentFilteredImages.length / this.itemsPerPage,
    );
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render();
    }
  }
}

// Gallery instance variable for global access
let gallery;

/**
 * Initialize the gallery when the DOM is fully loaded
 * Uses DOMContentLoaded for faster initialization than window.onload
 */
window.addEventListener("DOMContentLoaded", () => {
  try {
    gallery = new MemeGallery();
  } catch (error) {
    console.error("Failed to initialize gallery:", error);

    // Show user-friendly error message if initialization fails
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML =
      "Sorry, there was an error loading the gallery. Please refresh the page.";

    const galleryElement = document.getElementById("imageGallery");
    if (galleryElement) {
      galleryElement.appendChild(errorDiv);
    }
  }
});

// Export gallery instance for potential external use or testing
export { gallery };
