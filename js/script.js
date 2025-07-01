// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA APOD API endpoint and key
const API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'lsrLcI9IHBDaHczZqJ8g7ogbh0hFwiXt5xUSD9Ho'; 

// Listen for button clicks
button.addEventListener('click', () => {
  // Get the selected start and end dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show a loading message while fetching data
  gallery.innerHTML = `<div class="placeholder"><p>Loading images...</p></div>`;

  // Build the API URL with the selected dates
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA's API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery (remove loading message)
      gallery.innerHTML = '';

      // Only keep the first 9 items (in case more are returned)
      const images = data.filter(item => item.media_type === 'image').slice(0, 9);

      // If there are no images, show a message
      if (images.length === 0) {
        gallery.innerHTML = `<div class="placeholder"><p>No images found for this date range.</p></div>`;
        return;
      }

      // Loop through each image and add it to the gallery
      images.forEach(item => {
        // Create a new div for each image
        const div = document.createElement('div');
        div.className = 'gallery-item';

        // Add the image, title, and date. Add data attributes for modal info.
        div.innerHTML = `
          <img src="${item.url}" alt="${item.title}" class="img-thumbnail gallery-img" style="cursor:pointer;" 
            data-title="${encodeURIComponent(item.title)}" 
            data-date="${item.date}" 
            data-explanation="${encodeURIComponent(item.explanation)}" 
            data-url="${item.hdurl ? item.hdurl : item.url}" />
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        `;

        // Add the div to the gallery
        gallery.appendChild(div);
      });

      // Add click event listeners to images for modal only (remove zoom effect JS)
      const galleryImages = document.querySelectorAll('.gallery-img');
      galleryImages.forEach(img => {
        img.addEventListener('click', (e) => {
          // Modal code only
          const modal = new bootstrap.Modal(document.getElementById('imageModal'));
          const modalImg = document.getElementById('modalImage');
          const modalTitle = document.getElementById('imageModalLabel');
          const modalDate = document.getElementById('modalDate');
          const modalExplanation = document.getElementById('modalExplanation');

          modalImg.src = img.getAttribute('data-url');
          modalImg.alt = decodeURIComponent(img.getAttribute('data-title'));
          modalTitle.textContent = decodeURIComponent(img.getAttribute('data-title'));
          modalDate.textContent = img.getAttribute('data-date');
          modalExplanation.textContent = decodeURIComponent(img.getAttribute('data-explanation'));

          modal.show();
        });
      });
      // Remove zoom when clicking outside any image
      document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('gallery-img')) {
          document.querySelectorAll('.gallery-img.zoomed').forEach(z => z.classList.remove('zoomed'));
        }
      });
    })
    .catch(error => {
      // Show an error message if something goes wrong (removes loading message)
      gallery.innerHTML = `<div class="placeholder"><p>Sorry, something went wrong. Please try again!</p></div>`;
      console.error(error);
    });
});
