export const roleCheck = (role) => {
    return (req, res, next) => {
      if (!req.user || req.user.user_metadata.role !== role) {
        return res.status(403).json({ error: "Access denied" });
      }
      next();
    };
  };