const getApiStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Viyona backend is running.",
  });
};

module.exports = {
  getApiStatus,
};
