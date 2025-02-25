document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#task-form');
    const input = document.querySelector('#task-input');
    const dateInput = document.querySelector('#task-date');
    const taskList = document.querySelector('#task-list');

    const refreshTasks = () => {
        const filterName = document.querySelector('#filter-name').value.trim();
        const filterDate = document.querySelector('#filter-date').value.trim();

        // Build query parameters based on filter input values
        const queryParams = new URLSearchParams();
        if (filterName) queryParams.append('name', filterName);
        if (filterDate) queryParams.append('due_date', filterDate);

        fetch(`/api?${queryParams.toString()}`)
            .then(response => response.json())
            .then(tasks => {
                // Ensure tasks is an array
                tasks = Array.isArray(tasks) ? tasks : [];
                const taskList = document.querySelector('#task-list');
                taskList.innerHTML = '';

                if (tasks.length === 0) {
                    taskList.innerHTML = '<li>No tasks available</li>';
                    return;
                }

                tasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.textContent = `${task.name} (Due: ${task.due_date})`;

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.onclick = () => editTask(task.name, task.due_date);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => deleteTask(task.name);

                    taskItem.appendChild(editButton);
                    taskItem.appendChild(deleteButton);
                    taskList.appendChild(taskItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                document.querySelector('#task-list').innerHTML = '<li>Error loading tasks</li>';
            });
    };

    // Event Listener for Filter Button
    document.querySelector('#filter-btn').addEventListener('click', event => {
        event.preventDefault(); // Prevent form submission
        refreshTasks();
    });

    // Event Listener for Reset Button
    document.querySelector('#reset-btn').addEventListener('click', event => {
        event.preventDefault();
        document.querySelector('#filter-name').value = '';
        document.querySelector('#filter-date').value = '';
        refreshTasks();
    });

    const handleFormSubmit = event => {
        event.preventDefault();
        const taskName = input.value.trim();
        const taskDate = dateInput.value.trim();
        if (!taskName || !taskDate) return;

        fetch('/api', {
            method: 'POST',
            body: `name=${taskName}&due_date=${taskDate}`
        }).then(() => {
            input.value = '';
            dateInput.value = '';
            refreshTasks();
        });
    };

    const editTask = (oldName, oldDate) => {
        const newName = prompt('Enter new name:', oldName);
        const newDate = prompt('Enter new due date:', oldDate);
        if (!newName && !newDate) return;

        fetch('/api', {
            method: 'PUT',
            body: `old_name=${oldName}&new_name=${newName || ''}&due_date=${newDate || ''}`
        }).then(refreshTasks);
    };

    const deleteTask = name => {
        if (!confirm(`Delete task "${name}"?`)) return;

        fetch('/api', {
            method: 'DELETE',
            body: `name=${name}`
        }).then(refreshTasks);
    };

    form.addEventListener('submit', handleFormSubmit);
    refreshTasks();
});
