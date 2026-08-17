const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token required",
            });
        }

        // Expected format:
        // Authorization: Bearer TOKEN
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token missing",
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");

            return res.status(500).json({
                message: "JWT secret is not configured",
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information
        req.user = decoded;

        // Continue to route
        next();
    } catch (error) {
        console.error("AUTH ERROR:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

module.exports = auth;