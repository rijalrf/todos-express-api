const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan internal pada server";

  const errorResponse = {
    success: false,
    message: message,
  };

  // Periksa apakah objek `err` memiliki properti `errors`
  // Jika ada, tambahkan ke dalam respons JSON kita.
  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  // ... (sisa kodenya sama, untuk menampilkan stack trace di development)

  return res.status(statusCode).json(errorResponse);
};

export default errorHandler;
