const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const roleArray = [...roles];
        console.log(roleArray);
        console.log(req.user);

        // Check if the user's role is included in the allowed roles
        if (!roleArray.includes(req.user.role)) {
            return res.status(401).send({ success: false, message: 'Non autorisé' });
        }
        next(); // Proceed to the next middleware or route handler
    };
};

module.exports = { authorizeRoles };
