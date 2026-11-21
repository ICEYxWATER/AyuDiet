/**
 * Authentication & Role Authorization Middleware
 * ------------------------------------------------
 * Enforces that only authorized backend practitioners or administrators
 * can modify the food database or approve clinical diet charts.
 * General clients / patients have read-only access to foods and can
 * only submit draft meal plans for practitioner review.
 */

export const requirePractitioner = (req, res, next) => {
  const practitionerKey = req.headers['x-practitioner-key'] || req.headers['x-admin-key'];
  const configuredSecret = process.env.PRACTITIONER_SECRET || 'ayudiet_practitioner_2026';

  // Check header secret key or user role (if session/token present)
  const isAuthorized =
    practitionerKey === configuredSecret ||
    req.user?.role === 'practitioner' ||
    req.user?.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message:
        'Access denied: Only authorized Ayurvedic practitioners or administrators at the backend can modify the food database or approve clinical diet plans.'
    });
  }

  next();
};

export const requireAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const configuredAdminSecret = process.env.ADMIN_SECRET || 'ayudiet_admin_2026';

  const isAuthorized = adminKey === configuredAdminSecret || req.user?.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Access denied: Administrator privileges required.'
    });
  }

  next();
};
