document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const confirmationMessage = document.getElementById('confirmation-message');
  const completionTime = document.getElementById('completion-time');
  const timerDisplay = document.getElementById('timer');
  
  // Form timing variables
  let startTime = null;
  let formFocused = false;
  let timerInterval = null;
  let elapsedTime = 0;
  
  // Load previous submissions from localStorage
  let formSubmissions = JSON.parse(localStorage.getItem('contactFormSubmissions')) || [];
  
  // Start timer on first focus
  const formInputs = [nameInput, emailInput, messageInput];
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (!formFocused) {
        formFocused = true;
        startTime = new Date();
        startTimer();
      }
    });
  });
  
  // Custom validation functions
  function validateName() {
    const value = nameInput.value.trim();
    const regex = /^[A-Za-z ]{2,50}$/;
    
    if (value === '') {
      nameError.textContent = 'Name is required';
      return false;
    } else if (!regex.test(value)) {
      nameError.textContent = 'Name must be between 2-50 characters and contain only letters and spaces';
      return false;
    } else {
      nameError.textContent = '';
      return true;
    }
  }
  
  function validateEmail() {
    const value = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value === '') {
      emailError.textContent = 'Email is required';
      return false;
    } else if (!regex.test(value)) {
      emailError.textContent = 'Please enter a valid email address';
      return false;
    } else {
      emailError.textContent = '';
      return true;
    }
  }
  
  function validateMessage() {
    const value = messageInput.value.trim();
    
    if (value === '') {
      messageError.textContent = 'Message is required';
      return false;
    } else if (value.length < 10) {
      messageError.textContent = 'Message must be at least 10 characters long';
      return false;
    } else if (value.length > 500) {
      messageError.textContent = 'Message must not exceed 500 characters';
      return false;
    } else {
      messageError.textContent = '';
      return true;
    }
  }
  
  // Format time as hours:minutes:seconds
  function formatTime(time) {
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Timer function
  function startTimer() {
    timerInterval = setInterval(() => {
      const now = new Date();
      elapsedTime = Math.floor((now - startTime) / 1000);
      timerDisplay.textContent = formatTime(elapsedTime);
    }, 1000);
  }
  
  // Add live validation on input
  nameInput.addEventListener('input', validateName);
  emailInput.addEventListener('input', validateEmail);
  messageInput.addEventListener('input', validateMessage);
  
  // Save form data to localStorage
  function saveToLocalStorage(formData) {
    // Add timestamp to the data
    formData.submittedAt = new Date().toISOString();
    
    // Add to existing submissions
    formSubmissions.push(formData);
    
    // Save to localStorage
    localStorage.setItem('contactFormSubmissions', JSON.stringify(formSubmissions));
    
    // Log the saved data
    console.log('Data saved to localStorage:', formData);
    console.log('All submissions:', formSubmissions);
  }
  
  // Reset form and UI
  function resetForm() {
    // Reset form fields
    contactForm.reset();
    
    // Reset validation error messages
    nameError.textContent = '';
    emailError.textContent = '';
    messageError.textContent = '';
    
    // Reset star rating
    const starInputs = document.querySelectorAll('input[name="rating"]');
    starInputs.forEach(input => input.checked = false);
    
    // Reset timer
    clearInterval(timerInterval);
    elapsedTime = 0;
    timerDisplay.textContent = '00:00:00';
    startTime = null;
    formFocused = false;
    
    // Hide confirmation and show form
    confirmationMessage.style.display = 'none';
    contactForm.style.display = 'block';
  }
  
  // Form submission handler
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Perform final validation
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();
    
    // If all validations pass, submit the form
    if (isNameValid && isEmailValid && isMessageValid) {
      // Stop the timer
      clearInterval(timerInterval);
      
      // Capture form data
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
        rating: document.querySelector('input[name="rating"]:checked')?.value || 'Not rated',
        timeToComplete: formatTime(elapsedTime),
        elapsedSeconds: elapsedTime
      };
      
      // Save to localStorage
      saveToLocalStorage(formData);
      
      // Display submission time in the confirmation message
      completionTime.textContent = formData.timeToComplete;
      
      // Hide form and show confirmation
      contactForm.style.display = 'none';
      confirmationMessage.style.display = 'block';
      
      // Log form data
      console.log('Form submitted:', formData);
      
      // Auto-refresh form after 5 seconds
      setTimeout(resetForm, 3000);
    }
  });
  
  // Function to retrieve submissions from localStorage
  function getSubmissions() {
    return JSON.parse(localStorage.getItem('contactFormSubmissions')) || [];
  }
  
  // Expose utility functions to window for potential use by other scripts
  window.contactFormUtils = {
    getSubmissions,
    clearSubmissions: () => {
      localStorage.removeItem('contactFormSubmissions');
      formSubmissions = [];
      console.log('All submissions cleared from localStorage');
    }
  };
});