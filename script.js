let todoPosts = [];
let filteredPosts = [];
let currentFilter = 'all';

// Constants for better maintainability
const PRIORITY_COLORS = {
  High: "red",
  Medium: "orange", 
  Low: "green"
};

const PRIORITY_VALUES = {
  High: 1,
  Medium: 2,
  Low: 3
};

// Utility function to sanitize HTML content
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Search and filter functions
function filterPosts() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  
  filteredPosts = todoPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                         post.content.toLowerCase().includes(searchTerm);
    const matchesFilter = currentFilter === 'all' || 
                         post.priority.toLowerCase() === currentFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  displayTodoPosts();
}

function setFilter(filter) {
  currentFilter = filter;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  
  filterPosts();
}

// Character counting for form inputs
function updateCharCount(inputElement, countElement, maxLength) {
  const currentLength = inputElement.value.length;
  countElement.textContent = `${currentLength}/${maxLength}`;
  
  if (currentLength > maxLength * 0.9) {
    countElement.style.color = 'var(--warning-color)';
  } else {
    countElement.style.color = 'var(--text-muted)';
  }
}

function displayTodoPosts() {
  const todoPostContainer = document.getElementById("todo-posts");
  const postsToShow = filteredPosts.length > 0 || currentFilter !== 'all' || 
                     document.getElementById('search-input').value ? filteredPosts : todoPosts;
  
  if (postsToShow.length === 0) {
    const searchTerm = document.getElementById('search-input').value;
    const message = searchTerm ? 
      `<div class="no-tasks">
        <i class="fas fa-search"></i>
        <h3>No tasks found</h3>
        <p>No tasks match your search for "${searchTerm}"</p>
      </div>` :
      `<div class="no-tasks">
        <i class="fas fa-tasks"></i>
        <h3>No tasks yet</h3>
        <p>Click the + button to add your first task!</p>
      </div>`;
    
    todoPostContainer.innerHTML = message;
    return;
  }

  const postsHTML = postsToShow.map((post, index) => {
    const priorityColor = PRIORITY_COLORS[post.priority] || "gray";
    const sanitizedTitle = sanitizeHTML(post.title);
    const sanitizedContent = sanitizeHTML(post.content);
    const originalIndex = todoPosts.findIndex(p => p.id === post.id);
    
    return `
      <div class="post" data-priority="${post.priority.toLowerCase()}">
        <div class="post-header">
          <div class="mainHeader">${sanitizedTitle}</div>
          <div class="priority priority-${post.priority.toLowerCase()}">
            ${post.priority === 'High' ? '🔴' : post.priority === 'Medium' ? '🟡' : '🟢'} ${post.priority}
          </div>
        </div>
        <div class="text"><p>${sanitizedContent}</p></div>
        <div class="post-actions">
          <input type="checkbox" class="delete-checkbox" data-index="${originalIndex}" title="Select for deletion">
          <span class="created-date">${post.createdDate || 'Unknown date'}</span>
        </div>
      </div>
    `;
  }).join('');

  todoPostContainer.innerHTML = postsHTML;
  attachDeleteEventListeners();
}

function attachDeleteEventListeners() {
  const checkboxes = document.querySelectorAll(".delete-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", toggleDeleteCheckbox);
  });
}

function openTodoPage() {
  const writingPage = document.getElementById("todo-writing-page");
  writingPage.classList.remove("hidden");
  
  // Focus on title input for better UX
  setTimeout(() => {
    document.getElementById("todo-title").focus();
  }, 100);
}

function closeTodoPage() {
  const writingPage = document.getElementById("todo-writing-page");
  writingPage.classList.add("hidden");
  
  // Clear form when closing
  const titleInput = document.getElementById("todo-title");
  const contentInput = document.getElementById("todo-content");
  const prioritySelect = document.getElementById("todo-priority");
  clearForm(titleInput, contentInput, prioritySelect);
}

function saveTodo() {
  const titleInput = document.getElementById("todo-title");
  const contentInput = document.getElementById("todo-content");
  const prioritySelect = document.getElementById("todo-priority");

  // Validation
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  
  if (!title) {
    alert("Please enter a title for your task!");
    titleInput.focus();
    return;
  }

  const newTodo = {
    id: Date.now().toString(), // Unique ID
    title: title,
    content: content,
    priority: prioritySelect.value,
    delete: false,
    createdDate: new Date().toLocaleDateString(),
    completed: false
  };

  todoPosts.push(newTodo);
  sortPostsByPriority();
  closeTodoPage();
  saveToLocalStorage();
  filterPosts(); // Use filterPosts instead of displayTodoPosts to maintain current filter
  clearForm(titleInput, contentInput, prioritySelect);
  
  // Show success message (optional)
  console.log("Task saved successfully!");
}

function togglePages() {
  // This function is kept for compatibility but replaced with modal approach
  closeTodoPage();
}

function saveToLocalStorage() {
  try {
    localStorage.setItem("todoPosts", JSON.stringify(todoPosts));
    console.log("Data saved successfully to localStorage");
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    alert("Error saving data. Please try again.");
  }
}

function loadFromLocalStorage() {
  try {
    const storedTodoPosts = localStorage.getItem("todoPosts");
    if (storedTodoPosts) {
      todoPosts = JSON.parse(storedTodoPosts);
      // Migrate old todos that don't have new fields
      todoPosts = todoPosts.map(todo => ({
        ...todo,
        id: todo.id || Date.now().toString() + Math.random(),
        createdDate: todo.createdDate || 'Unknown date',
        completed: todo.completed || false
      }));
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    todoPosts = [];
  }
}

function toggleDeleteCheckbox(event) {
  const index = parseInt(event.target.getAttribute("data-index"));
  if (index >= 0 && index < todoPosts.length) {
    todoPosts[index].delete = event.target.checked;
  }
}

function deleteSelectedPosts() {
  const selectedCount = todoPosts.filter(post => post.delete).length;
  
  if (selectedCount === 0) {
    alert("Please select tasks to delete!");
    return;
  }
  
  if (confirm(`Are you sure you want to delete ${selectedCount} task(s)?`)) {
    todoPosts = todoPosts.filter((post) => !post.delete);
    saveToLocalStorage();
    displayTodoPosts();
  }
}

function clearForm(titleInput, contentInput, prioritySelect) {
  titleInput.value = "";
  contentInput.value = "";
  prioritySelect.value = "Medium";
}

function sortPostsByPriority() {
  todoPosts.sort((a, b) => PRIORITY_VALUES[a.priority] - PRIORITY_VALUES[b.priority]);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + N to add new todo
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    openTodoPage();
  }
  
  // Escape to close todo writing page
  if (event.key === 'Escape') {
    const writingPage = document.getElementById("todo-writing-page");
    if (!writingPage.classList.contains("hidden")) {
      closeTodoPage();
    }
  }
}

function initApp() {
  loadFromLocalStorage();
  sortPostsByPriority();
  filteredPosts = [...todoPosts]; // Initialize filtered posts
  displayTodoPosts();
  
  // Event listeners
  document.getElementById("add-todo-button").addEventListener("click", openTodoPage);
  document.getElementById("save-todo-button").addEventListener("click", saveTodo);
  document.getElementById("delete-posts-button").addEventListener("click", deleteSelectedPosts);
  
  // Modal close buttons
  document.getElementById("close-modal").addEventListener("click", closeTodoPage);
  document.getElementById("cancel-todo-button").addEventListener("click", closeTodoPage);
  
  // Search functionality
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", debounce(filterPosts, 300));
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setFilter(e.target.dataset.filter);
    });
  });
  
  // Character counting
  const titleInput = document.getElementById("todo-title");
  const contentInput = document.getElementById("todo-content");
  
  titleInput.addEventListener("input", () => {
    const charCount = titleInput.parentElement.querySelector('.char-count');
    updateCharCount(titleInput, charCount, 100);
  });
  
  contentInput.addEventListener("input", () => {
    const charCount = contentInput.parentElement.querySelector('.char-count');
    updateCharCount(contentInput, charCount, 500);
  });
  
  // Close modal when clicking outside
  document.getElementById("todo-writing-page").addEventListener("click", (e) => {
    if (e.target.id === "todo-writing-page") {
      closeTodoPage();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Debounce utility function
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

document.addEventListener("DOMContentLoaded", initApp);
