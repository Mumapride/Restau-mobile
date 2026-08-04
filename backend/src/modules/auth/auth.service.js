const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerStudent = async (firstName, lastName, matricule, password) => {
  // Step 1: Check if matricule already exists
  const existing = await prisma.student.findUnique({
    where: { matricule: matricule.toUpperCase() }
  });

  if (existing) {
    throw new Error('Matricule already registered');
  }

  // Step 2: Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Step 3: Create User and Student together
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      password: hashedPassword,
      role: 'STUDENT',
      student: {
        create: {
          matricule: matricule.toUpperCase()
        }
      }
    },
    include: { student: true }
  });

  return {
    message: 'Account created successfully',
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      matricule: user.student.matricule,
      role: user.role
    }
  };
};
const loginStudent = async (matricule, password) => {
  // Step 1: Find the student by matricule
  const student = await prisma.student.findUnique({
    where: { matricule: matricule.toUpperCase() },
    include: { user: true }
  });

  // Step 2: If no student found, throw error
  if (!student) {
    throw new Error('Invalid matricule or password');
  }

  // Step 3: Check if account is active
  if (!student.user.isActive) {
    throw new Error('Account is deactivated, contact admin');
  }

  // Step 4: Check if password matches
  const passwordMatch = await bcrypt.compare(password, student.user.password);
  if (!passwordMatch) {
    throw new Error('Invalid matricule or password');
  }

  // Step 5: Create and return JWT token
  const token = jwt.sign(
    {
      id: student.user.id,
      studentId: student.id,
      role: student.user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: student.user.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      matricule: student.matricule,
      role: student.user.role
    }
  };
};

const loginAdmin = async (email, password) => {
  // Step 1: Find admin by email
  const admin = await prisma.admin.findUnique({
    where: { email },
    include: { user: true }
  });

  // Step 2: If no admin found, throw error
  if (!admin) {
    throw new Error('Invalid email or password');
  }

  // Step 3: Check if account is active
  if (!admin.user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Step 4: Check if password matches
  const passwordMatch = await bcrypt.compare(password, admin.user.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Step 5: Create and return JWT token
  const token = jwt.sign(
    {
      id: admin.user.id,
      adminId: admin.id,
      role: admin.user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: admin.user.id,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
      email: admin.email,
      role: admin.user.role
    }
  };
};

module.exports = { registerStudent, loginStudent, loginAdmin };