document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const nameList = document.getElementById('name-list');
    const sortButton = document.getElementById('sort-button');
    const shuffleButton = document.getElementById('shuffle-button');
    const resetButton = document.getElementById('reset-button');
    const totalCount = document.getElementById('total-count');
    const sortStatus = document.getElementById('sort-status');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const filterRating = document.getElementById('filter-rating');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    
    // LocalStorage key for form submissions
    const SUBMISSIONS_STORAGE_KEY = 'contactFormSubmissions';
    
  
    // Hard-coded test data
    const HARD_CODED_SUBMISSIONS = [
      {
        name: "John Smith",
        email: "john@example.com",
        message: "I'm interested in your services. Please contact me about pricing options for the enterprise plan.",
        rating: 4,
        timeToComplete: "1m 45s",
        submittedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@company.org",
        message: "Your website looks great! I have a question about the portfolio section. Can you tell me more about the technologies you used for the data visualization project?",
        rating: 5,
        timeToComplete: "2m 12s",
        submittedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        name: "Michael Brown",
        email: "m.brown@gmail.com",
        message: "There seems to be an issue with the contact form on mobile devices. The submit button is not visible when using an iPhone.",
        rating: 3,
        timeToComplete: "0m 55s",
        submittedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ];
  
    // Current working copy of the submissions
    let allSubmissions = getSubmissions();
    let currentSubmissions = [...allSubmissions];
    let filteredSubmissions = [...currentSubmissions];
    let sortType = 'none'; // 'name', 'date', or 'none'
    let currentFilter = 'all';
    let searchQuery = '';
    
    // Pagination settings
    const ITEMS_PER_PAGE = 5;
    let currentPage = 1;
    let totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
    
    // Get submissions from localStorage
     function getSubmissions() {
      const storedSubmissions = JSON.parse(localStorage.getItem(SUBMISSIONS_STORAGE_KEY));
      return storedSubmissions && storedSubmissions.length > 0 
        ? storedSubmissions 
        : HARD_CODED_SUBMISSIONS;
    }
    
    // Format date for display
    function formatDate(dateString) {
      if (!dateString) return 'Unknown date';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'Invalid date';
      }
    }
    
    // Create modal for viewing full messages
    function createModal() {
      // Create modal elements if they don't exist
      if (!document.getElementById('message-modal')) {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'message-modal';
        modalOverlay.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h3');
        modalTitle.id = 'modal-title';
        modalTitle.textContent = 'Full Message';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close modal');
        
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.id = 'modal-body';
        
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        const closeFooterButton = document.createElement('button');
        closeFooterButton.className = 'btn';
        closeFooterButton.textContent = 'Close';
        
        // Assemble modal structure
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        modalFooter.appendChild(closeFooterButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        
        modalOverlay.appendChild(modalContent);
        
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        closeButton.addEventListener('click', () => {
          modalOverlay.classList.remove('visible');
        });
        
        closeFooterButton.addEventListener('click', () => {
          modalOverlay.classList.remove('visible');
        });
        
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
            modalOverlay.classList.remove('visible');
          }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
            modalOverlay.classList.remove('visible');
          }
        });
      }
    }
    
    // Show message in modal
    function showMessageModal(submission) {
      createModal();
      
      const modal = document.getElementById('message-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalBody = document.getElementById('modal-body');
      
      // Update modal content
      modalTitle.textContent = `Message from ${submission.name || 'Anonymous'}`;
      
      // Create structured message view
      modalBody.innerHTML = `
        <div class="modal-user-info">
          <p><strong>From:</strong> ${submission.name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${submission.email || 'Not provided'}</p>
          <p><strong>Rating:</strong> ${submission.rating ? '⭐'.repeat(submission.rating) : 'Not rated'}</p>
          <p><strong>Submitted:</strong> ${formatDate(submission.submittedAt)}</p>
          <p><strong>Form Completion Time:</strong> ${submission.timeToComplete || 'Unknown'}</p>
        </div>
        <div class="modal-message">
          <h4>Message:</h4>
          <p class="message-content">${submission.message || 'No message content'}</p>
        </div>
      `;
      
      // Show modal
      modal.classList.add('visible');
    }
    
    // Apply filters and search
    function applyFilters() {
      // Start with all submissions
      filteredSubmissions = [...currentSubmissions];
      
      // Apply rating filter if not "all"
      if (currentFilter !== 'all') {
        filteredSubmissions = filteredSubmissions.filter(submission => {
          if (currentFilter === '0') {
            return !submission.rating;
          } else {
            return submission.rating == currentFilter;
          }
        });
      }
      
      // Apply search filter if there's a query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredSubmissions = filteredSubmissions.filter(submission => {
          return (
            (submission.name && submission.name.toLowerCase().includes(query)) ||
            (submission.email && submission.email.toLowerCase().includes(query)) ||
            (submission.message && submission.message.toLowerCase().includes(query))
          );
        });
      }
      
      // Reset pagination
      currentPage = 1;
      totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
      
      // Render the list
      renderList();
    }
    
    // Initialize the list
    function renderList() {
      // Clear the current list
      nameList.innerHTML = '';
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredSubmissions.length);
      const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);
      
      if (filteredSubmissions.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        
        if (currentSubmissions.length === 0) {
          emptyMessage.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>No submissions yet</h3>
            <p>Fill out the contact form to see data here.</p>
          `;
        } else {
          emptyMessage.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <h3>No matching submissions</h3>
            <p>Try adjusting your filters or search query.</p>
          `;
        }
        
        nameList.appendChild(emptyMessage);
      } else {
        // Create list items for each submission
        paginatedSubmissions.forEach((submission, index) => {
          const li = document.createElement('li');
          li.classList.add('submission-item');
          
          // Create numbered marker
          const numberSpan = document.createElement('span');
          numberSpan.classList.add('list-number');
          numberSpan.textContent = startIndex + index + 1;
          
          // Create submission container
          const submissionDiv = document.createElement('div');
          submissionDiv.classList.add('submission-details');
          
          // Add name with bold formatting
          const nameDiv = document.createElement('div');
          nameDiv.innerHTML = `<strong>Name:</strong> ${submission.name || 'Anonymous'}`;
          
          // Add email
          const emailDiv = document.createElement('div');
          emailDiv.innerHTML = `<strong>Email:</strong> ${submission.email || 'Not provided'}`;
          
          // Add rating with stars
          const ratingDiv = document.createElement('div');
          const stars = submission.rating ? '⭐'.repeat(submission.rating) : 'Not rated';
          ratingDiv.innerHTML = `<strong>Rating:</strong> ${stars}`;
          
          // Add message (truncated if too long)
          const messageDiv = document.createElement('div');
          const messageText = submission.message || 'No message';
          const truncatedMessage = messageText.length > 80 ? messageText.substring(0, 80) + '...' : messageText;
          messageDiv.innerHTML = `<strong>Message:</strong> ${truncatedMessage}`;
          
          // Add submission date
          const dateDiv = document.createElement('div');
          dateDiv.innerHTML = `<strong>Submitted:</strong> ${formatDate(submission.submittedAt)}`;
          
          // Append details to the submission container
          submissionDiv.appendChild(nameDiv);
          submissionDiv.appendChild(emailDiv);
          submissionDiv.appendChild(ratingDiv);
          submissionDiv.appendChild(messageDiv);
          submissionDiv.appendChild(dateDiv);
          
          // Add buttons container
          const buttonsDiv = document.createElement('div');
          buttonsDiv.style.display = 'flex';
          buttonsDiv.style.marginTop = '10px';
          
          // Add view full message button
          const viewButton = document.createElement('button');
          viewButton.textContent = 'View Details';
          viewButton.classList.add('view-message-btn');
          viewButton.addEventListener('click', () => {
            showMessageModal(submission);
          });
          buttonsDiv.appendChild(viewButton);
          
          // Add delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.classList.add('delete-submission-btn');
          deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this submission?')) {
              const actualIndex = currentSubmissions.findIndex(s => 
                s.submittedAt === submission.submittedAt && s.name === submission.name && s.email === submission.email
              );
              if (actualIndex !== -1) {
                removeSubmission(actualIndex);
              }
            }
          });
          buttonsDiv.appendChild(deleteButton);
          
          submissionDiv.appendChild(buttonsDiv);
          
          // Append elements to list item
          li.appendChild(numberSpan);
          li.appendChild(submissionDiv);
          
          // Add animation delay based on index
          li.style.animationDelay = `${index * 50}ms`;
          
          // Append to list
          nameList.appendChild(li);
        });
      }
      
      // Update list statistics
      totalCount.textContent = currentSubmissions.length;
      
      // Update sort status with colors for visual feedback
      if (sortType === 'name') {
        sortStatus.textContent = 'Sorted by Name';
        sortStatus.style.color = '#2ecc71';
      } else if (sortType === 'date') {
        sortStatus.textContent = 'Sorted by Date';
        sortStatus.style.color = '#3498db';
      } else {
        sortStatus.textContent = 'Unsorted';
        sortStatus.style.color = '#e74c3c';
      }
      
      // Update pagination controls
      updatePaginationControls();
    }
    
    // Update pagination controls state
    function updatePaginationControls() {
      totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE));
      pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
      
      // Enable/disable previous button
      prevPageBtn.disabled = currentPage <= 1;
      
      // Enable/disable next button
      nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // Sort submissions by name
    function sortByName() {
      currentSubmissions = [...currentSubmissions].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      sortType = 'name';
      
      // Apply filters and search
      applyFilters();
      
      // Visual feedback for button
      sortButton.classList.add('active');
      setTimeout(() => {
        sortButton.classList.remove('active');
      }, 300);
    }
    
    // Sort submissions by date
    function sortByDate() {
      currentSubmissions = [...currentSubmissions].sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA; // Newest first
      });
      sortType = 'date';
      
      // Apply filters and search
      applyFilters();
      
      // Visual feedback for button
      shuffleButton.classList.add('active');
      setTimeout(() => {
        shuffleButton.classList.remove('active');
      }, 300);
    }
    
    // Clear all submissions
    function clearAll() {
      if (currentSubmissions.length === 0 || confirm('Are you sure you want to delete ALL submissions? This cannot be undone.')) {
        localStorage.removeItem(SUBMISSIONS_STORAGE_KEY);
        
        // Reset all states
        allSubmissions = [];
        currentSubmissions = [];
        filteredSubmissions = [];
        sortType = 'none';
        currentFilter = 'all';
        searchQuery = '';
        currentPage = 1;
        
        // Reset UI
        if (searchInput) searchInput.value = '';
        if (filterRating) filterRating.value = 'all';
        
        // Re-render the list
        renderList();
        
        // Visual feedback for button
        resetButton.classList.add('active');
        setTimeout(() => {
          resetButton.classList.remove('active');
        }, 300);
      }
    }
    
    // Remove a specific submission
    function removeSubmission(index) {
      if (index >= 0 && index < currentSubmissions.length) {
        // Remove from current submissions
        currentSubmissions.splice(index, 1);
        
        // Also remove from all submissions
        allSubmissions = [...currentSubmissions];
        
        // Save changes to localStorage
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(currentSubmissions));
        
        // Re-apply filters and search
        applyFilters();
        
        return true;
      }
      return false;
    }
    
    // Handle search functionality
    function handleSearch() {
      searchQuery = searchInput.value.trim();
      applyFilters();
    }
    
    // Go to previous page
    function goToPrevPage() {
      if (currentPage > 1) {
        currentPage--;
        renderList();
      }
    }
    
    // Go to next page
    function goToNextPage() {
      if (currentPage < totalPages) {
        currentPage++;
        renderList();
      }
    }
    
    // Simulate submission for testing (can be removed in production)
    function addTestData() {
      if (currentSubmissions.length === 0) {
        const testData = [
          {
            name: "John Smith",
            email: "john@example.com",
            message: "I'm interested in your services. Please contact me about pricing options for the enterprise plan.",
            rating: 4,
            timeToComplete: "1m 45s",
            submittedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            name: "Sarah Johnson",
            email: "sarah.j@company.org",
            message: "Your website looks great! I have a question about the portfolio section. Can you tell me more about the technologies you used for the data visualization project?",
            rating: 5,
            timeToComplete: "2m 12s",
            submittedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            name: "Michael Brown",
            email: "m.brown@gmail.com",
            message: "There seems to be an issue with the contact form on mobile devices. The submit button is not visible when using an iPhone.",
            rating: 3,
            timeToComplete: "0m 55s",
            submittedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          }
        ];
        
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(testData));
        allSubmissions = testData;
        currentSubmissions = [...testData];
        filteredSubmissions = [...testData];
        
        // Render the updated list
        renderList();
        
        console.log("Test data added successfully");
      }
    }
    
    // Event listeners
    if (sortButton) sortButton.addEventListener('click', sortByName);
    if (shuffleButton) shuffleButton.addEventListener('click', sortByDate);
    if (resetButton) resetButton.addEventListener('click', clearAll);
    
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
      // Also trigger search on Enter key
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
    }
    
    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (filterRating) filterRating.addEventListener('change', () => {
      currentFilter = filterRating.value;
      applyFilters();
    });
    
    if (prevPageBtn) prevPageBtn.addEventListener('click', goToPrevPage);
    if (nextPageBtn) nextPageBtn.addEventListener('click', goToNextPage);
    
    // Initialize the list on page load
    renderList();
    
    // Listen for storage events to update in real-time if another tab submits a form
    window.addEventListener('storage', (event) => {
      if (event.key === SUBMISSIONS_STORAGE_KEY) {
        allSubmissions = JSON.parse(event.newValue) || [];
        currentSubmissions = [...allSubmissions];
        
        // Re-apply the current sort
        if (sortType === 'name') {
          sortByName();
        } else if (sortType === 'date') {
          sortByDate();
        } else {
          applyFilters();
        }
      }
    });
    
    // Check if there's any data, if not and we're in development/testing, add some test data
    // Comment out this line in production
    if (currentSubmissions.length === 0) {
      // Uncomment the next line to add test data
      // addTestData();
    }
    
    // Create the modal once on load
    createModal();
    
    // Add keyboard shortcuts (optional)
    document.addEventListener('keydown', (e) => {
      // Search focus with Ctrl+F
      if (e.ctrlKey && e.key === 'f' && searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
      
      // Sort by name with Alt+N
      if (e.altKey && e.key === 'n' && sortButton) {
        e.preventDefault();
        sortByName();
      }
      
      // Sort by date with Alt+D
      if (e.altKey && e.key === 'd' && shuffleButton) {
        e.preventDefault();
        sortByDate();
      }
    });
  });