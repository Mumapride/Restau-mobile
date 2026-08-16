const prisma = require("./src/config/db");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    const email = "admin@ubuea.cm";
    const password = "Admin@123";

    // Check whether admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User + Admin together
    const user = await prisma.user.create({
      data: {
        firstName: "Restau",
        lastName: "Admin",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,

        admin: {
          create: {
            email,
          },
        },
      },
      include: {
        admin: true,
      },
    });

    console.log("Admin created successfully!");
    console.log({
      id: user.id,
      email: user.admin.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();