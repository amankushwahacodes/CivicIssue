exports.createIssue = async (req, res) => {
    try {
        res.json({ message: "Issue created (dummy response)" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
