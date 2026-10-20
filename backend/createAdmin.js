const prisma = require("./src/config/db");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    const email = "admin@ubuea.cm";
    const password = "Admin@123";

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          firstName: "Restau",
          lastName: "Admin",
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
          admin: {
            create: { email },
          },
        },
        include: { admin: true },
      });

      console.log("Admin created successfully!");
      console.log({ id: user.id, email: user.admin.email, role: user.role });
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

async function createScanner() {
  try {
    const matricule = "SC29A656";
    const password = "Scanner@123";

    const existingScanner = await prisma.scanner.findUnique({
      where: { matricule },
    });

    if (existingScanner) {
      console.log("Scanner account already exists.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          firstName: "Restau",
          lastName: "Scanner",
          password: hashedPassword,
          role: "SCANNER",
          isActive: true,
          scanner: {
            create: { matricule },
          },
        },
        include: { scanner: true },
      });

      console.log("Scanner account created successfully!");
      console.log({
        id: user.id,
        matricule: user.scanner.matricule,
        role: user.role,
      });
    }
  } catch (error) {
    console.error("Error creating scanner:", error);
  }
}

async function main() {
  await createAdmin();
  await createScanner();
  await prisma.$disconnect();
}

main();