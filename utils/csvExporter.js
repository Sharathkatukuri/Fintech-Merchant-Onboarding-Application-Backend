const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
};

const buildApplicationsCsv = (applications) => {
  const headers = [
    "Application ID",
    "Business Name",
    "Registration Number",
    "Category",
    "Status",
    "Merchant Name",
    "Merchant Email",
    "Merchant Phone",
    "Review Notes",
    "Submitted At",
    "Reviewed At",
  ];

  const rows = applications.map((application) => [
    application._id,
    application.businessName,
    application.registrationNumber,
    application.category,
    application.status,
    application.merchant?.ownerName || "",
    application.merchant?.email || "",
    application.merchant?.phone || "",
    application.reviewNotes || "",
    application.submittedAt || "",
    application.reviewedAt || "",
  ]);

  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
};

module.exports = {
  buildApplicationsCsv,
};
