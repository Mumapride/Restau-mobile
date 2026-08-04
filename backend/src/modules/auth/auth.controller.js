const { registerStudent, loginStudent, loginAdmin } = require('./auth.service');

const studentRegister = async (req, res) => {
  try {
    const { firstName, lastName, matricule, password } = req.body;

    // Make sure all fields are provided
    if (!firstName || !lastName || !matricule || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await registerStudent(firstName, lastName, matricule, password);
    res.status(201).json(result);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const studentLogin = async (req, res) => {
  try {
    const { matricule, password } = req.body;

    // Make sure both fields are provided
    if (!matricule || !password) {
      return res.status(400).json({ message: 'Matricule and password are required' });
    }

    const result = await loginStudent(matricule, password);
    res.status(200).json(result);

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Make sure both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginAdmin(email, password);
    res.status(200).json(result);

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { studentRegister, studentLogin, adminLogin };