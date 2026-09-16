const prisma = require('../../config/db');
const crypto = require('crypto');

// Get student's QR token
const getMyQRToken = async (studentId) => {
  let qrToken = await prisma.qRToken.findUnique({
    where: { studentId },
    include: {
      student: {
        include: { user: true }
      }
    }
  });

  // If no QR token exists create one
  if (!qrToken) {
    qrToken = await prisma.qRToken.create({
      data: {
        studentId,
        token: crypto.randomUUID(),
      },
      include: {
        student: {
          include: { user: true }
        }
      }
    });
  }

  return {
    token: qrToken.token,
    studentId: qrToken.studentId,
    firstName: qrToken.student.user.firstName,
    lastName: qrToken.student.user.lastName,
    matricule: qrToken.student.matricule,
    createdAt: qrToken.createdAt
  };
};

module.exports = { getMyQRToken };