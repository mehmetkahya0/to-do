let todoPosts = [];

function displayTodoPosts() {
    const todoPostContainer = document.getElementById("todo-posts");
    let postsHTML = "";

    todoPosts.forEach((post, index) => {
        postsHTML += `
            <div class="post">
                <div class="mainHeader">${post.title}</div>
                <div class="priority">Priority: ${post.priority}</div>
                <div class="text"><p>${post.content}</p></div>
                <input type="checkbox" class="delete-checkbox" data-index="${index}">
            </div>
        `;
    });

    todoPostContainer.innerHTML = postsHTML;
    attachDeleteEventListeners();
}

function attachDeleteEventListeners() {
    document.querySelectorAll(".delete-checkbox").forEach(checkbox => {
        checkbox.addEventListener("click", toggleDeleteCheckbox);
    });
}

function openTodoPage() {
    document.getElementById("todo-posts").style.display = "none";
    document.getElementById("todo-writing-page").style.display = "block";
}

function saveTodo() {
    const titleInput = document.getElementById("todo-title");
    const contentInput = document.getElementById("todo-content");
    const prioritySelect = document.getElementById("todo-priority");

    todoPosts.push({
        title: titleInput.value,
        content: contentInput.value,
        priority: prioritySelect.value,
        delete: false // Initialize with delete flag as false
    });

    sortPostsByPriority();
    togglePages();
    saveToLocalStorage();
    displayTodoPosts();
    clearForm(titleInput, contentInput, prioritySelect);
}

function togglePages() {
    document.getElementById("todo-posts").style.display = "block";
    document.getElementById("todo-writing-page").style.display = "none";
}

function saveToLocalStorage() {
    try {
        localStorage.setItem("todoPosts", JSON.stringify(todoPosts));
    } catch (e) {
        console.error("Error saving to localStorage", e);
    }
}

function toggleDeleteCheckbox(event) {
    const index = event.target.getAttribute("data-index");
    todoPosts[index].delete = event.target.checked;
}

function deleteSelectedPosts() {
    todoPosts = todoPosts.filter(post => !post.delete);
    saveToLocalStorage();
    displayTodoPosts();
}

function clearForm(titleInput, contentInput, prioritySelect) {
    titleInput.value = "";
    contentInput.value = "";
    prioritySelect.value = "Medium";
}

function sortPostsByPriority() {
    const priorityValues = { "High": 1, "Medium": 2, "Low": 3 };
    todoPosts.sort((a, b) => priorityValues[a.priority] - priorityValues[b.priority]);
}

function initApp() {
    const storedTodoPosts = localStorage.getItem("todoPosts");
    if (storedTodoPosts) {
        todoPosts = JSON.parse(storedTodoPosts);
    }
    sortPostsByPriority();
    displayTodoPosts();
    document.getElementById("add-todo-button").addEventListener("click", openTodoPage);
    document.getElementById("save-todo-button").addEventListener("click", saveTodo);
    document.getElementById("delete-posts-button").addEventListener("click", deleteSelectedPosts);
}

document.addEventListener("DOMContentLoaded", initApp);