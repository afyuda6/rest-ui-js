let apiUrl = 'https://rest-api-cpp-640830702257.asia-southeast1.run.app/users';
const usersTable = document.getElementById('users-list');
const createForm = document.getElementById('create-form');
const nameInput = document.getElementById('name');
const apiSelector = document.getElementById('api-selector');

apiSelector.addEventListener('change', (event) => {
    apiUrl = event.target.value;
    fetchUsers();
});

async function fetchUsers() {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const result = await response.json();
        const users = result.data;

        usersTable.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
            </tr>
        `;

        if (Array.isArray(users) && users.length > 0) {
            users.forEach(user => {
                const row = document.createElement('tr');
                row.id = `user-row-${user.id}`;

                const idCell = document.createElement('td');
                idCell.textContent = user.id;

                const nameCell = document.createElement('td');
                nameCell.className = 'name-cell';
                nameCell.textContent = user.name;

                const actionsCell = document.createElement('td');
                actionsCell.className = 'actions-cell';
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.onclick = () => openEditForm(user);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteUser(user.id);

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);

                row.appendChild(idCell);
                row.appendChild(nameCell);
                row.appendChild(actionsCell);
                usersTable.appendChild(row);
            });
        } else {
            usersTable.innerHTML += `<tr><td colspan="3">No users found</td></tr>`;
        }

    } catch (error) {
        console.error('Error fetching users:', error);
        
        usersTable.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
            </tr>
            <tr><td colspan="3">Failed to load users. Please try again later.</td></tr>
        `;
    }
}

async function createUser(name) {
    const params = new URLSearchParams();
    params.append('name', name);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    await response.json();
    fetchUsers();
}

async function updateUser(id, name) {
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('name', name);
    const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    await response.json();
    fetchUsers();
}

async function deleteUser(id) {
    const params = new URLSearchParams();
    params.append('id', id);
    const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    fetchUsers();
}

function openEditForm(user) {
    const row = document.getElementById(`user-row-${user.id}`);

    const nameCell = row.querySelector('.name-cell');
    const originalName = nameCell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalName;
    nameCell.textContent = '';
    nameCell.appendChild(input);

    const actionsCell = row.querySelector('.actions-cell');
    actionsCell.innerHTML = '';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = async () => {
        const updatedName = input.value.trim();
        if (updatedName && updatedName !== originalName) {
            await updateUser(user.id, updatedName);
        } else {
            nameCell.textContent = originalName;
        }
        restoreActions(user, actionsCell);
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
        nameCell.textContent = originalName;
        restoreActions(user, actionsCell);
    };

    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(cancelButton);
}

function restoreActions(user, actionsCell) {
    actionsCell.innerHTML = '';
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => openEditForm(user);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteUser(user.id);

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
}

createForm.onsubmit = async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (name) {
        await createUser(name);
        nameInput.value = '';
    }
};

fetchUsers();
