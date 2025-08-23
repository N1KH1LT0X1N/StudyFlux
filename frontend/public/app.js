// Application data with modern enhancements
const appData = {
  "leaderboard": [
    {"rank": 1, "name": "Alex Chen", "points": 2847, "avatar": "AC", "isCurrentUser": false, "color": "#3b82f6"},
    {"rank": 2, "name": "Sarah Johnson", "points": 2695, "avatar": "SJ", "isCurrentUser": false, "color": "#ef4444"},
    {"rank": 3, "name": "You", "points": 2341, "avatar": "YU", "isCurrentUser": true, "color": "#10b981"},
    {"rank": 4, "name": "Mike Torres", "points": 2156, "avatar": "MT", "isCurrentUser": false, "color": "#f59e0b"},
    {"rank": 5, "name": "Emma Wilson", "points": 1987, "avatar": "EW", "isCurrentUser": false, "color": "#8b5cf6"},
    {"rank": 6, "name": "David Kim", "points": 1823, "avatar": "DK", "isCurrentUser": false, "color": "#06b6d4"},
    {"rank": 7, "name": "Lisa Zhang", "points": 1654, "avatar": "LZ", "isCurrentUser": false, "color": "#ec4899"}
  ],
  "notifications": [
    {"id": 1, "icon": "🏆", "message": "You've reached a new milestone!", "timestamp": "2 hours ago", "unread": true},
    {"id": 2, "icon": "👥", "message": "5 new users joined your learning path", "timestamp": "4 hours ago", "unread": true},
    {"id": 3, "icon": "📊", "message": "Weekly progress report is ready", "timestamp": "1 day ago", "unread": false},
    {"id": 4, "icon": "⭐", "message": "Your flashcard set received 10 likes", "timestamp": "2 days ago", "unread": false},
    {"id": 5, "icon": "🔔", "message": "System maintenance completed", "timestamp": "3 days ago", "unread": false},
    {"id": 6, "icon": "🎯", "message": "New learning goal completed", "timestamp": "4 days ago", "unread": false}
  ],
  "capabilities": [
    {
      "title": "Personalized Q&A",
      "description": "Generate tailored questions and answers from your content.",
      "icon": "❓",
      "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      "title": "Progress Tracking", 
      "description": "Monitor your learning path's effectiveness and user engagement.",
      "icon": "📈",
      "gradient": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      "title": "Flashcard Generation",
      "description": "Automatically create interactive flashcards for key concepts.", 
      "icon": "🗂️",
      "gradient": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      "title": "Multilingual Abilities",
      "description": "Translate your learning materials into multiple languages.",
      "icon": "🌍",
      "gradient": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    }
  ]
};

// Animation and interaction utilities
class ModernUI {
  static createRipple(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 10;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  static animateNumber(element, start, end, duration = 1000) {
    const startTime = Date.now();
    const difference = end - start;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + difference * easeOutQuart);
      
      element.textContent = current.toLocaleString() + ' points';
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  static slideInElement(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.4s ease-out';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, delay);
  }
  
  static pulseElement(element) {
    element.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 600);
  }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
});

function initializeDashboard() {
  renderCapabilities();
  renderLeaderboard();
  renderNotifications();
  updateNotificationBadge();
  setupEventListeners();
  addScrollEffects();
  
  // Add entrance animations
  setTimeout(() => {
    animateEntrance();
  }, 100);
}

function animateEntrance() {
  const elements = document.querySelectorAll('.creator-header, .action-section, .capability-card, .card');
  elements.forEach((element, index) => {
    ModernUI.slideInElement(element, index * 100);
  });
}

function renderCapabilities() {
  const capabilitiesGrid = document.getElementById('capabilitiesGrid');
  
  appData.capabilities.forEach((capability, index) => {
    const capabilityCard = createCapabilityCard(capability, index);
    capabilitiesGrid.appendChild(capabilityCard);
  });
}

function createCapabilityCard(capability, index) {
  const card = document.createElement('div');
  card.className = 'capability-card';
  card.tabIndex = 0;
  
  card.innerHTML = `
    <div class="capability-icon">${capability.icon}</div>
    <h4 class="capability-title">${capability.title}</h4>
    <p class="capability-description">${capability.description}</p>
  `;
  
  // Add click interaction
  card.addEventListener('click', (e) => {
    ModernUI.createRipple(card, e);
    ModernUI.pulseElement(card);
    
    // Simulate capability selection
    setTimeout(() => {
      addNotification({
        id: Date.now(),
        icon: capability.icon,
        message: `${capability.title} feature explored!`,
        timestamp: 'Just now',
        unread: true
      });
    }, 300);
  });
  
  // Enhanced hover effects
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-6px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
  
  return card;
}

function renderLeaderboard() {
  const leaderboardList = document.getElementById('leaderboardList');
  
  appData.leaderboard.forEach((user, index) => {
    const leaderboardItem = createLeaderboardItem(user, index);
    leaderboardList.appendChild(leaderboardItem);
  });
}

function createLeaderboardItem(user, index) {
  const item = document.createElement('div');
  item.className = `leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`;
  item.tabIndex = 0;
  
  item.innerHTML = `
    <div class="leaderboard-rank">${user.rank}</div>
    <div class="leaderboard-avatar" style="background-color: ${user.color}">
      ${user.avatar}
    </div>
    <div class="leaderboard-info">
      <div class="leaderboard-name">${user.name}</div>
      <div class="leaderboard-points">${user.points.toLocaleString()} points</div>
    </div>
  `;
  
  // Add click interaction
  item.addEventListener('click', (e) => {
    ModernUI.createRipple(item, e);
    
    if (!user.isCurrentUser) {
      // Animate points for other users
      const pointsElement = item.querySelector('.leaderboard-points');
      ModernUI.animateNumber(pointsElement, 0, user.points, 800);
    }
  });
  
  // Add entrance animation delay
  setTimeout(() => {
    ModernUI.slideInElement(item, index * 50);
  }, 200);
  
  return item;
}

function renderNotifications() {
  const notificationsList = document.getElementById('notificationsList');
  notificationsList.innerHTML = ''; // Clear existing notifications
  
  appData.notifications.forEach((notification, index) => {
    const notificationItem = createNotificationItem(notification, index);
    notificationsList.appendChild(notificationItem);
  });
}

function createNotificationItem(notification, index) {
  const item = document.createElement('div');
  item.className = `notification-item ${notification.unread ? 'unread' : ''}`;
  item.tabIndex = 0;
  item.dataset.notificationId = notification.id; // Store ID for easier reference
  
  item.innerHTML = `
    <div class="notification-icon">${notification.icon}</div>
    <div class="notification-content">
      <div class="notification-message">${notification.message}</div>
      <div class="notification-timestamp">${notification.timestamp}</div>
    </div>
  `;
  
  // Add click handler to mark as read
  item.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (notification.unread) {
      ModernUI.createRipple(item, e);
      markNotificationAsRead(notification.id, item);
    }
  });
  
  // Add entrance animation delay
  setTimeout(() => {
    ModernUI.slideInElement(item, index * 30);
  }, 300);
  
  return item;
}

function markNotificationAsRead(notificationId, element) {
  // Find the notification in the data and mark as read
  const notification = appData.notifications.find(n => n.id === notificationId);
  if (notification && notification.unread) {
    notification.unread = false;
    element.classList.remove('unread');
    
    // Add fade out effect for the unread indicator
    element.style.transition = 'all 0.3s ease-out';
    
    // Update notification badge immediately
    updateNotificationBadge();
    
    // Show success feedback
    ModernUI.pulseElement(element);
    
    console.log(`Marked notification ${notificationId} as read`);
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  const unreadCount = appData.notifications.filter(n => n.unread).length;
  
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  
  if (unreadCount > 0) {
    badge.style.animation = 'pulse 2s ease-in-out infinite';
  } else {
    badge.style.animation = '';
  }
  
  console.log(`Updated notification badge: ${unreadCount} unread notifications`);
}

function setupEventListeners() {
  // Enhanced create button functionality - Fix for direct click issue
  const createBtn = document.getElementById('createBtn');
  if (createBtn) {
    createBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCreateClick(e);
    });
  }
  
  // Add keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('capability-card')) {
      e.target.click();
    }
    if (e.key === 'Enter' && e.target.classList.contains('notification-item')) {
      e.target.click();
    }
  });
  
  // Add scroll effects
  window.addEventListener('scroll', handleScroll);
}

function handleCreateClick(e) {
  const btn = document.getElementById('createBtn');
  if (!btn || btn.disabled) return; // Prevent multiple clicks
  
  console.log('Create button clicked');
  
  const originalContent = btn.innerHTML;
  
  // Create ripple effect
  ModernUI.createRipple(btn, e);
  
  // Add loading state with enhanced animation
  btn.classList.add('loading');
  btn.innerHTML = `
    <span class="btn-glow"></span>
    <span class="btn-icon">⏳</span>
    <span class="btn-text">Creating...</span>
  `;
  btn.disabled = true;
  
  // Simulate API call with progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 25 + 15; // Faster progress
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      
      // Success state
      btn.innerHTML = `
        <span class="btn-glow"></span>
        <span class="btn-icon">✨</span>
        <span class="btn-text">Created Successfully!</span>
      `;
      btn.classList.remove('loading');
      
      // Add success notification
      addNotification({
        id: Date.now(),
        icon: '🎉',
        message: 'New learning path created successfully!',
        timestamp: 'Just now',
        unread: true
      });
      
      // Add confetti effect (simple version)
      createConfetti();
      
      // Reset button after delay
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        btn.style.transform = '';
      }, 2500);
    }
  }, 150); // Faster interval
}

function createConfetti() {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        border-radius: 50%;
        z-index: 1000;
        pointer-events: none;
        animation: confetti-fall 2s ease-out forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 2000);
    }, i * 50);
  }
}

function addNotification(notification) {
  // Add to the beginning of notifications array
  appData.notifications.unshift(notification);
  
  // Re-render all notifications to maintain proper event handlers
  renderNotifications();
  
  // Update badge
  updateNotificationBadge();
  
  // Limit notifications to 8
  if (appData.notifications.length > 8) {
    appData.notifications = appData.notifications.slice(0, 8);
  }
  
  console.log('Added new notification:', notification.message);
}

function addScrollEffects() {
  const cards = document.querySelectorAll('.capability-card');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideIn 0.6s ease-out';
      }
    });
  }, observerOptions);
  
  cards.forEach((card) => {
    observer.observe(card);
  });
}

function handleScroll() {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector('.background-pattern');
  
  if (parallax) {
    parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
}

// Add dynamic CSS for animations
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-10px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  
  .notification-item.unread .notification-icon {
    animation: gentle-pulse 2s ease-in-out infinite;
  }
  
  @keyframes gentle-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  .leaderboard-item:hover .leaderboard-rank {
    color: #6366f1;
    transform: scale(1.1);
    transition: all 0.2s ease-out;
  }
  
  .capability-card:focus-visible {
    transform: translateY(-2px) scale(1.02);
  }
`;

document.head.appendChild(dynamicStyles);

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debouncing to scroll handler
window.removeEventListener('scroll', handleScroll);
window.addEventListener('scroll', debounce(handleScroll, 10));

// Add touch support for mobile
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('.capability-card, .leaderboard-item, .notification-item')) {
    e.target.closest('.capability-card, .leaderboard-item, .notification-item').classList.add('touching');
  }
});

document.addEventListener('touchend', (e) => {
  document.querySelectorAll('.touching').forEach(el => {
    el.classList.remove('touching');
  });
});

// Initialize theme detection and transitions
document.documentElement.style.setProperty('color-scheme', 'dark');

console.log('🌙 AI Learning Hub Dashboard - Dark Mode Initialized');
console.log('✨ Modern UI enhancements loaded successfully!');