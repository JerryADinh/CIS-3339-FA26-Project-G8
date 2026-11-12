const jwt = require('jsonwebtoken');

// Task S1: requireAuth - Rejects with 401 if there is no valid JWT
const requireAuth = function (req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains userId, name, role, orgId
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Task S1: requireRole - Rejects with 403 if the user does not have the specified role
const requireRole = function (requiredRole) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

// Task S1: withOrg - Merges { org: req.user.orgId } or { orgs: req.user.orgId } into a query filter
const withOrg = function (filter, req, collectionType = 'standard') {
  // Determine if the schema uses 'orgs' (array) or 'org' (single string)
  const orgField = collectionType === 'clients' ? 'orgs' : 'org';
  
  return {
    ...filter,
    [orgField]: req.user.orgId // Matches the orgId inside the JWT
  };
};

module.exports = {
  requireAuth,
  requireRole,
  withOrg
};