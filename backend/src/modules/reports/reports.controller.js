
const reportsService = require("./reports.service");

// Get reports summary
const getReportsSummary = async (req, res) => {
  try {
    const summary = await reportsService.getReportsSummary();

    res.json(summary);
  } catch (error) {
    console.error("Reports summary error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get daily report
const getDailyReport = async (req, res) => {
  try {
    const report = await reportsService.getDailyReport();

    res.json(report);
  } catch (error) {
    console.error("Daily report error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getReportsSummary,
  getDailyReport,
};
