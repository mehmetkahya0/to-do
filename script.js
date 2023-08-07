let todoPosts = []; // Blog yazılarınızı burada bir dizi içinde tutun

// Fonksiyon: Blog yazılarını ana sayfaya ekler
function displayTodoPosts() {
  const todoPostContainer = document.getElementById("todo-posts");
  todoPostContainer.innerHTML = "";

  todoPosts.forEach((post, index) => {
    const postHTML = `
      <div class="post">
        <div class="mainHeader">${post.title}</div>
        <div class="text"><p>${post.content}</p></div>
        <input type="checkbox" class="delete-checkbox" data-index="${index}">
      </div>
    `;
    todoPostContainer.innerHTML += postHTML;
  });

  // Silme checkbox'larına tıklanma olayı ekle
  const deleteCheckboxes = document.querySelectorAll(".delete-checkbox");
  deleteCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", toggleDeleteCheckbox);
  });
}

// Fonksiyon: Blog yazma sayfasını açar
function openTodoPage() {
  const mainPage = document.getElementById("todo-posts");
  const todoWritingPage = document.getElementById("todo-writing-page");

  mainPage.style.display = "none";
  todoWritingPage.style.display = "block";
}

// Fonksiyon: Yazılan blogu ana sayfaya ekler
function saveTodo() {
  const titleInput = document.getElementById("todo-title");
  const contentInput = document.getElementById("todo-content");

  const newTodo = {
    title: titleInput.value,
    content: contentInput.value,
  };

  todoPosts.push(newTodo);

  const mainPage = document.getElementById("todo-posts");
  const todoWritingPage = document.getElementById("todo-writing-page");

  mainPage.style.display = "block";
  todoWritingPage.style.display = "none";

  saveToLocalStorage(); // Verileri local storage'a kaydedelim

  displayTodoPosts(); // Blog yazılarını ana sayfaya ekleyelim (güncel liste)

  // Yazıları ekledikten sonra formu temizleyelim
  titleInput.value = "";
  contentInput.value = "";
}

// Fonksiyon: Verileri local storage'a kaydeder
function saveToLocalStorage() {
  localStorage.setItem("todoPosts", JSON.stringify(todoPosts));
}

// Fonksiyon: Silme checkbox'larını açar/kapatır
function toggleDeleteCheckbox(event) {
  const index = event.target.getAttribute("data-index");
  todoPosts[index].delete = event.target.checked;
}

// Fonksiyon: Seçili blogları siler
function deleteSelectedPosts() {
  todoPosts = todoPosts.filter((post) => !post.delete);
  saveToLocalStorage(); // Seçilen postları sildikten sonra local storage'ı güncelle
  displayTodoPosts(); // Blog yazılarını ana sayfaya ekleyelim (güncel liste)
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener("DOMContentLoaded", function () {
  // Local storage'dan verileri çekelim (eğer varsa)
  const storedTodoPosts = localStorage.getItem("todoPosts");
  if (storedTodoPosts) {
    todoPosts = JSON.parse(storedTodoPosts);
  }

  displayTodoPosts(); // Blog yazılarını ana sayfaya ekleyelim

  const addTodoButton = document.getElementById("add-todo-button");
  addTodoButton.addEventListener("click", openTodoPage);

  const saveTodoButton = document.getElementById("save-todo-button");
  saveTodoButton.addEventListener("click", saveTodo);

  const deletePostsButton = document.getElementById("delete-posts-button");
  deletePostsButton.addEventListener("click", deleteSelectedPosts);
});
