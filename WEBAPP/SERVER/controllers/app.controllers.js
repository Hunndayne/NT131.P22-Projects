const search = async (req, res) => {
    try {
        // TODO: Implement search functionality
        res.json({ message: "Search endpoint" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { search };
