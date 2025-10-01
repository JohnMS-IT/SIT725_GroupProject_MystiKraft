// admin-users.js
// Admin User Management logic:
// - Load all users (GET /api/admin/users)
// - Update user role (PUT /api/admin/users/:id/role)
// - Delete user (DELETE /api/admin/users/:id)

const userTableBody = document.getElementById('userTableBody');

// Load all users
async function loadUsers() {
  userTableBody.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';

  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) {
      if (res.status === 403) {
        userTableBody.innerHTML = '<tr><td colspan="5" class="red-text center">Access denied. Admin privileges required.</td></tr>';
        M.toast({html: 'Access denied. Admin privileges required.', classes: 'red'});
        return;
      }
      throw new Error('Failed to load users');
    }
    
    const users = await res.json();
    renderUsers(users);
  } catch (error) {
    console.error('Error loading users:', error);
    userTableBody.innerHTML = '<tr><td colspan="5" class="red-text">Failed to load users</td></tr>';
    M.toast({html: 'Failed to load users', classes: 'red'});
  }
}

// Render users to the table
function renderUsers(users) {
  userTableBody.innerHTML = '';

  if (users.length === 0) {
    userTableBody.innerHTML = '<tr><td colspan="5" class="center">No users found</td></tr>';
    return;
  }

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.dataset.id = user._id;
    
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
    const roleColor = user.role === 'admin' ? 'orange' : 'blue';
    const registeredDate = new Date(user.createdAt).toLocaleDateString();

    tr.innerHTML = `
      <td>${user.email}</td>
      <td>${fullName}</td>
      <td><span class="badge ${roleColor}">${user.role}</span></td>
      <td>${registeredDate}</td>
      <td>
        <a class="btn-flat blue-text text-darken-1" data-act="toggle-role" data-id="${user._id}" data-current-role="${user.role}">
          <i class="material-icons">swap_horiz</i>Toggle Role
        </a>
        <a class="btn-flat red-text text-darken-1" data-act="delete" data-id="${user._id}" data-email="${user.email}">
          <i class="material-icons">delete</i>Delete
        </a>
      </td>
    `;
    userTableBody.appendChild(tr);
  });
}

// Handle actions (toggle role, delete)
userTableBody.addEventListener('click', async (e) => {
  // Handle Toggle Role
  const toggleBtn = e.target.closest('[data-act="toggle-role"]');
  if (toggleBtn) {
    const id = toggleBtn.dataset.id;
    const currentRole = toggleBtn.dataset.currentRole;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (!confirm(`Change this user's role to "${newRole}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        throw new Error('Failed to update role');
      }

      M.toast({html: `User role updated to ${newRole}`, classes: 'green'});
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error updating role:', error);
      M.toast({html: 'Failed to update user role', classes: 'red'});
    }
    return;
  }

  // Handle Delete
  const deleteBtn = e.target.closest('[data-act="delete"]');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const email = deleteBtn.dataset.email;

    if (!confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      const row = userTableBody.querySelector(`tr[data-id="${id}"]`);
      if (row) row.remove();

      M.toast({html: 'User deleted successfully', classes: 'green'});
    } catch (error) {
      console.error('Error deleting user:', error);
      M.toast({html: 'Failed to delete user', classes: 'red'});
    }
  }
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
});

