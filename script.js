// 1. INITIAL STATE
let tasks = JSON.parse(localStorage.getItem("proTasks")) || [];
let activeTaskName = localStorage.getItem("activeTask") || "No task selected";

const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const progressBar = document.getElementById("progress-bar");
const rangeValText = document.getElementById("rangeVal");
const manualRange = document.getElementById("manualRange");
const activeBox = document.getElementById("activeTaskDisplay");

// 2. INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("date-display").innerText = new Date().toDateString();
    
    // Find the active task's specific percentage to set the slider
    const activeTask = tasks.find(t => t.text === activeTaskName && t.completed === false);
    const initialPercent = activeTask ? activeTask.percent : 0;
    
    manualRange.value = initialPercent;
    updateManualText(activeTaskName, initialPercent);
    renderTasks();
});

// 3. RENDER FUNCTION
function renderTasks() {
    taskList.innerHTML = "";
    let completedCount = 0;

    tasks.forEach((task, index) => {
        if (task.completed) completedCount++;

        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");
        
        // Entire row is clickable
        li.setAttribute("onclick", `toggleTask(${index})`);
        
        const tagClass = task.cat === 'Work' ? 'tag-work' : 'tag-personal';

        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <span class="tag ${tagClass}">${task.cat}</span>
            </div>
            <span class="delete-btn" onclick="event.stopPropagation(); deleteTask(${index})">×</span>
        `;
        taskList.appendChild(li);
    });

    document.getElementById("taskCount").innerText = `${tasks.length - completedCount} tasks pending`;
    localStorage.setItem("proTasks", JSON.stringify(tasks));
}

// 4. TASK-SPECIFIC PROGRESS LOGIC
function updateManualBar() {
    const val = manualRange.value;
    progressBar.style.width = val + "%";
    rangeValText.innerText = val + "%";
    
    // Update percentage only for the currently active task
    const activeTask = tasks.find(t => t.text === activeTaskName && t.completed === false);
    if (activeTask) {
        activeTask.percent = val;
    }

    localStorage.setItem("proTasks", JSON.stringify(tasks));
    updateManualText(activeTaskName, val);
}

function updateManualText(name, percentage) {
    if (name && name !== "No task selected" && tasks.length > 0) {
        activeBox.innerHTML = `Working on: <b>${name}</b> — <span style="color: var(--primary)">${percentage}% Done</span>`;
    } else {
        activeBox.innerText = "Select a task to start working...";
        progressBar.style.width = "0%";
        rangeValText.innerText = "0%";
    }
    
    const header = document.querySelector('h1');
    if (parseInt(percentage) === 100 && tasks.length > 0) {
        header.innerHTML = "All Done! 🏆";
    } else {
        header.innerHTML = "TaskMaster <span>Pro</span>";
    }
}

// 5. ACTION FUNCTIONS
function addTask() {
    const category = document.getElementById("categorySelect").value;
    if (input.value.trim() === "") return;
    
    tasks.push({ 
        text: input.value.trim(), 
        completed: false, 
        cat: category,
        percent: 0 
    });
    
    input.value = "";
    renderTasks();
}

function toggleTask(index) {
    // Save current active task name
    activeTaskName = tasks[index].text;
    localStorage.setItem("activeTask", activeTaskName);

    // Focus Logic: Strike out all EXCEPT the selected one
    tasks.forEach((task, i) => {
        task.completed = (i !== index);
    });

    // Set slider to the saved percentage of the NEWLY selected task
    const currentTaskPercent = tasks[index].percent || 0;
    manualRange.value = currentTaskPercent;
    
    updateManualBar();
    renderTasks();
}

function deleteTask(index) {
    const deletedTaskName = tasks[index].text;
    tasks.splice(index, 1);
    
    // Reset UI if the active task was deleted or if list is empty
    if (tasks.length === 0 || activeTaskName === deletedTaskName) {
        activeTaskName = "No task selected";
        manualRange.value = 0;
        updateManualBar();
    }
    renderTasks();
}

function clearAll() {
    if(confirm("Clear all tasks and reset progress?")) {
        tasks = [];
        activeTaskName = "No task selected";
        manualRange.value = 0;
        updateManualBar();
        renderTasks();
    }
}

// 6. EVENT LISTENERS
addBtn.onclick = addTask;
manualRange.oninput = updateManualBar;
// 6. SEARCH FUNCTIONALITY
function toggleSearch() {
    const container = document.getElementById("searchContainer");
    const sInput = document.getElementById("searchInput");
    
    container.classList.toggle("active");
    
    if (container.classList.contains("active")) {
        sInput.focus(); // Automatically focus so you can start typing immediately
    } else {
        sInput.value = ""; 
        searchTasks(); // Reset the list when closing
    }
}

function searchTasks() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const allTasks = document.querySelectorAll("#taskList li");

    allTasks.forEach(li => {
        // We look for the text inside the task-text span
        const taskText = li.querySelector('.task-text').innerText.toLowerCase();
        
        if (taskText.includes(query)) {
            li.style.display = "flex";
        } else {
            li.style.display = "none";
        }
    });
}