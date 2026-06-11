const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function sanitizeUsers(users) {
  return users.map(sanitizeUser);
}

module.exports = { PUBLIC_USER_SELECT, sanitizeUser, sanitizeUsers };
