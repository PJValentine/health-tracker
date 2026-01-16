// Simple toast notification system
// Uses browser-native approach with custom container

let toastContainer = null;
let toastIdCounter = 0;

// Initialize toast container
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

// Create and show toast
function showToast(message, type = 'success', duration = 3000) {
  const container = getToastContainer();
  const toastId = `toast-${toastIdCounter++}`;

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info'),
};
