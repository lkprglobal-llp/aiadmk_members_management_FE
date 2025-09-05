import express, { json, NextFunction, Request, Response } from "express";
import mysql, { Connection, RowDataPacket } from "mysql2/promise";
import axios from "axios";
import cors from "cors";
import path from "path";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

//** Swagger definition for API Calls*/
const options = {
  definition: {
    openapi: "3.0.4",
    info: {
      title: "AIADMK Members Management System API",
      version: "1.0.0",
      description:
        "API for managing members, OTP verification, and reports for AIADMK.",
      contact: {
        name: "LKPR GLobal LLP",
        url: "https://lkprglobal.com",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    servers: [
      {
        url: "http://localhost:5253",
      },
    ],
  },
  apis: ["./src/index.ts"], // Path to files with JSDoc annotations
};

const jwt = require("jsonwebtoken");
const body_parser = require("body-parser");

const specs = swaggerJsdoc(options);
const app = express();
const port = process.env.PORT || 5253; // Include the port variable in .env, if you need to run on the different port
app.use(
  cors({
    origin: ["http://localhost:5253", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(body_parser.json());

//** OTP Store and Token generations */
// JWT secret (store in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// // Interface for user data (matches frontend Admins)
// interface Admin {
//   id: number;
//   username: string;
//   mobile: string;
//   role: string;
// }

// // Interface for member data (matches frontend Member)
// interface Member {
//   id?: number;
//   mobile: string;
//   name: string;
//   parents_name: string;
//   address: string;
//   education_qualification: string;
//   caste: string;
//   joining_details: string;
//   party_member_number: string;
//   voter_id: string;
//   aadhar_number: string;
//   image?: string;
//   position: string;
//   created_at?: string;
//   updated_at?: string;
//   jname: string;
//   tname: string;
//   dname: string;
// }

// Define types (add to types.ts or server.ts)
interface TeamRow extends RowDataPacket {
  tcode?: string | null;
  dcode?: string | null;
  jcode?: string | null; // Aliased jvalue
  tname?: string | null;
  dname?: string | null;
  jname?: string | null; // Aliased jname
}

// Interface for JWT payload
interface JwtPayload {
  id: number;
  role: string;
}

// Extend Request to include user property
interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware to verify JWT token
const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: () => void
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user (id, role)
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

//** Debug dotenv loading*/
console.log("Dotenv path:", path.resolve(__dirname, "../.env"));
console.log("Environment variables:", {
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN ? "****" : "undefined",
});

//** Mysql Database connection string */
// MySQL connection
const dbConfig = {
  host: "localhost",
  user: "lkprglobal_localdev",
  password: "PdK1!gc8Ep%n",
  database: "aiadmk_db",
};

// db.connect((err) => {
//   if (err) {
//     console.error("MySQL connection error:", err);
//     throw err;
//   }
//   console.log("Connected to MySQL");
// });

let db: Connection | null = null;

//! Initialize database connection
async function initializeDbConnection() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL");
  } catch (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
}

// Initialize connection on server start
initializeDbConnection().catch((err) => {
  console.error("Failed to initialize MySQL connection:", err);
  process.exit(1); // Exit if connection fails
});

//** WhatsApp API configuration*/
const whatsappToken = process.env.WHATSAPP_TOKEN;
let whatsappUrl = `https://api.lkprglobal.com/v1/message/send-message?token=${whatsappToken}`;

//** Generate 6-digit OTP*/
const generateOTP: () => string = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* The `sanitizePhoneNumber` function is a utility function that takes a phone number as input, removes
any non-numeric characters, adds the country code '+91' if missing, and returns the sanitized phone
number in the format '+91XXXXXXXXXX'. */
const sanitizePhoneNumber = (number: string): string => {
  if (!number) return "";
  const numberWithPlus = number.replace(/^\+/, "");
  const cleanNumber = numberWithPlus.replace(/[^0-9]/g, "");
  return `+91${cleanNumber}`;
};

/* The `formatWhatsAppNumber` function is a utility function that takes a phone number as input,
removes any non-numeric characters, and ensures that the number is formatted correctly for WhatsApp API. */
const formatWhatsAppNumber = (number: string): string => {
  const cleanNumber = number.replace(/[^0-9]/g, "");
  return cleanNumber.startsWith("+91") ? cleanNumber : `91${cleanNumber}`;
};

//**Mobile validation */
const mobile_validate = (mobile: string): boolean => {
  const mobileRegex = /^\+91[0-9]{10}$/;
  return mobileRegex.test(mobile);
};

/* The `// Retry logic for API requests` section in the code is implementing a retry mechanism for
making API requests. This mechanism allows the code to retry sending an API request a specified
number of times if the initial request fails. */
// const sendWithRetry = async (
//   url: string,
//   payload: any,
//   headers: any,
//   retries: number = 3,
//   delay: number = 1000
// ): Promise<{ success: boolean; data?: any; status?: number; error?: any }> => {
//   let lastError: any = null;
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await axios.post(url, payload, { headers });
//       return { success: true, data: response.data, status: response.status };
//     } catch (err) {
//       lastError = err;
//       console.error(`Attempt ${i + 1} failed:`, {
//         message: (err as Error).message,
//         code: (err as any).code,
//         response: (err as any).response?.data,
//         status: (err as any).response?.status,
//         headers: (err as any).response?.headers,
//       });
//       if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//   }
//   return { success: false, error: lastError };
// };

/* The code snippet you provided is defining a POST endpoint `/api/register` in the Express
application. When a POST request is made to this endpoint, the server executes the callback function
specified, which handles the registration process for a new user / admin. */

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user / admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               mobile:
 *                 type: string
 *               role:
 *                 type: string
 *             required:
 *               - mobile
 *               - role
 *     responses:
 *       200:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input or duplicate mobile
 *       500:
 *         description: Server error
 */

app.post("/api/register", async (req: Request, res: Response) => {
  const { username, mobile, role } = req.body;
  const sanitizedMobile = sanitizePhoneNumber(mobile);
  // Validate input
  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }
  if (!mobile_validate(sanitizedMobile)) {
    return res.status(400).json({ error: "Invalid mobile number format" });
  }
  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  // Check for duplicate mobile
  try {
    const existingUser: any = await db?.execute<RowDataPacket[]>(
      "SELECT * FROM admins WHERE mobile = ?",
      [sanitizedMobile]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }

    const result: any = await db?.execute(
      "INSERT INTO admins (username, mobile, role) VALUES (?, ?, ?)",
      [username, sanitizedMobile, role]
    );
    const insertId = (result as any).insertId;
    return res.status(201).json({
      message: "Admin registered successfully",
      id: insertId,
      user: {
        id: insertId,
        username,
        mobile: sanitizedMobile,
        role,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/Login:
 *   post:
 *     tags: [Auth]
 *     summary: Login for user / admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *             required:
 *               - mobile
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *       400:
 *         description: Invalid input or duplicate mobile
 *       500:
 *         description: Server error
 */
/**
 * The function handles user login by generating an OTP, validating the mobile number, and sending the
 * OTP via WhatsApp.
 */
app.post("/api/Login", async (req: Request, res: Response) => {
  const { mobile } = req.body;
  const sanitizedMobile = sanitizePhoneNumber(mobile);
  // Validate input
  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }
  if (!mobile_validate(sanitizedMobile)) {
    return res.status(400).json({ error: "Invalid mobile number format" });
  }

  const otp = generateOTP();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
  const whatsappNumber = formatWhatsAppNumber(mobile);

  try {
    const isLogin: any = await db?.execute(
      "SELECT * FROM admins WHERE mobile = ?",
      [sanitizedMobile]
    );
    if (isLogin.length === 0) {
      return res.status(404).json({ error: "Mobile number not found" });
    }
  } catch {
    return res.status(500).json({ error: "Server error" });
  }

  // Function to send OTP via WhatsApp
  async function sendWhatsAppOTP() {
    try {
      const response = await axios.post(whatsappUrl, {
        to: whatsappNumber,
        type: "template",
        template: {
          language: { policy: "deterministic", code: "en" },
          name: "otp_copy",
          components: [
            { type: "body", parameters: [{ type: "text", text: otp }] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: otp }],
            },
          ],
        },
      });

      console.log("WhatsApp API response:", response.data);
    } catch (error) {
      console.error("WhatsApp API error:", error);
    }
  }

  db?.execute("UPDATE admins SET otp = ?, otp_expiry = ? WHERE mobile = ?", [
    otp,
    expiry,
    sanitizedMobile,
  ]).then(([result]: [any, any]) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mobile number not found" });
    }
    // Send OTP via WhatsApp
    sendWhatsAppOTP();
    return res.status(200).json({ message: "OTP sent successfully" });
  });
});

/**
 * @swagger
 * /api/validate-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify user/admin OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               otp:
 *                 type: string
 *             required:
 *               - mobile
 *               - otp
 *     responses:
 *       200:
 *         description: User / Admin  logged in successfully
 *       400:
 *         description: Invalid input or duplicate mobile
 *       500:
 *         description: Server error
 */
// app.post(
//   "/api/validate-otp",
//   async (req: Request, res: Response): Promise<void> => {
//     const { mobile, otp } = req.body;
//     const sanitizedMobile = sanitizePhoneNumber(mobile);
//     // Validate input
//     if (!mobile) {
//       res.status(400).json({ error: "Mobile number is required" });
//       return;
//     }
//     if (!otp) {
//       res.status(400).json({ error: "OTP is required" });
//       return;
//     }

//     try {
//       const dbresult: any = await db?.execute(
//         "SELECT id, username, created_at, is_verified, role FROM admins WHERE mobile = ?",
//         [mobile]
//       );
//       const [result] = dbresult;

//       if (!result) {
//         res.status(404).json({ message: "User not found" });
//         return;
//       }
//       const [user] = result;

//       if (user.otp_expiry && new Date(user.otp_expiry) < new Date()) {
//         res.status(400).json({ error: "OTP has expired" });
//         return;
//       }

//       const token = jwt.sign({ id: user?.id }, JWT_SECRET, { expiresIn: "1h" });

//       res.status(200).json({
//         success: true,
//         token,
//         user: {
//           id: user.id,
//           username: user.username,
//           created_at: user.created_at,
//           is_verified: 1,
//           role: user.role,
//         },
//         message: "Login successful",
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: "Server error" });
//       return;
//     }

//     // db?.execute("SELECT * FROM admins WHERE mobile = ? AND otp = ?", [
//     //   sanitizedMobile,
//     //   otp,
//     // ]).then(([results]: [any, any]) => {
//     //   if (!results || results.length === 0) {
//     //     return { error: "Invalid mobile number or OTP" };
//     //   }

//     //Clear OTP
//     db?.execute(
//       "UPDATE admins SET otp = NULL, otp_expiry = NULL WHERE mobile = ?",
//       [sanitizedMobile]
//     ).then(() => {
//       return { error: "Server error" };
//     });

//     //Update Status of User / Admin
//     db?.execute("UPDATE admins SET is_verified = ? WHERE mobile = ?", [
//       1,
//       sanitizedMobile,
//     ]).then(() => {
//       return { error: "Server error" };
//     });
//   }
// );
app.post(
  "/api/validate-otp",
  async (req: Request, res: Response): Promise<void> => {
    if (res.headersSent) {
      console.log("Headers already sent in /api/validate-otp");
      return;
    }
    const { mobile, otp } = req.body;
    const sanitizedMobile = sanitizePhoneNumber(mobile);

    // Validate input
    if (!mobile) {
      res
        .status(400)
        .json({ success: false, error: "Mobile number is required" });
      return;
    }
    if (!otp) {
      res.status(400).json({ success: false, error: "OTP is required" });
      return;
    }
    if (!db) {
      res
        .status(500)
        .json({ success: false, message: "Database not connected" });
      return;
    }

    try {
      // Query user with mobile and OTP, including otp_expiry
      const [results] = await db.execute<RowDataPacket[]>(
        "SELECT id, username, created_at, is_verified, role, otp_expiry FROM admins WHERE mobile = ? AND otp = ?",
        [sanitizedMobile, otp]
      );

      if (results.length === 0) {
        res
          .status(400)
          .json({ success: false, error: "Invalid mobile number or OTP" });
        return;
      }

      const [user] = results;

      // Check OTP expiry
      if (user.otp_expiry && new Date(user.otp_expiry) < new Date()) {
        res.status(400).json({ success: false, error: "OTP has expired" });
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });

      // Clear OTP and update is_verified
      await db.execute(
        "UPDATE admins SET otp = NULL, otp_expiry = NULL, is_verified = 1 WHERE mobile = ?",
        [sanitizedMobile]
      );

      // Send response
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at,
          is_verified: 1,
          role: user.role,
        },
        message: "Login successful",
      });
    } catch (error) {
      console.error("Admin check error:", error);
      if (res.headersSent) {
        console.log("Headers already sent in /api/validate-otp catch");
        return;
      }
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Validate Token endpoint
app.get(
  "/api/validate-token",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!db) {
      res
        .status(500)
        .json({ success: false, message: "Database not connected" });
      return;
    }
    try {
      const [rows] = await db?.execute(
        "SELECT id, username, mobile, role FROM admins WHERE role = ?",
        [req.user?.role]
      );

      const result = rows as RowDataPacket[];

      if (result.length === 0) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const user = result.flatMap((row) => ({
        id: row.id,
        username: row.username,
        mobile: row.mobile,
        role: row.role,
      }));

      const [firstUser] = user;

      res.json({
        success: true,
        user: {
          id: firstUser.id,
          username: firstUser.username,
          mobile: firstUser.mobile,
          role: firstUser.role,
        },
        message: "Token valid",
      });
    } catch (error) {
      console.error("Validate token error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

app.post("/api/logout", (req: Request, res: Response) => {
  // Handle logout logic (e.g., invalidate session, token, etc.)
  localStorage.removeItem("authToken");
  return res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @swagger
 * /api/view-members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: List of all members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
app.get(
  "/api/view-members",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (res.headersSent) return;
    if (!db) {
      res
        .status(500)
        .json({ success: false, message: "Database not connected" });
      return;
    }
    try {
      const [rows] = await db?.execute<RowDataPacket[]>(
        "SELECT id, mobile, name, parents_name, address, education_qualification, caste, joining_details, party_member_number, voter_id, aadhar_number, image, created_at, tname, dname, jname FROM users"
      );
      const members: any = rows.map((row) => ({
        id: row.id,
        name: row.name,
        mobile: row.mobile,
        parents_name: row.parents_name,
        address: row.address,
        education_qualification: row.education_qualification,
        caste: row.caste,
        party_member_number: row.party_member_number,
        joining_details: row.joining_details,
        voter_id: row.voter_id,
        aadhar_number: row.aadhar_number,
        image: row.image,
        created_at: row.created_at,
        updated_at: row.updated_at,
        jname: row.jname,
        tname: row.tname,
        dname: row.dname,
      }));
      res.json({ success: true, members, count: members.length });
    } catch (error) {
      console.error("Get members error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);
/**
 * @swagger
 * /api/Register-Member:
 *   post:
 *     tags: [Members]
 *     summary: Register a new member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               name:
 *                 type: string
 *               parents_name:
 *                 type: string
 *               address:
 *                 type: string
 *               education_qualification:
 *                 type: string
 *               caste:
 *                 type: string
 *               joining_details:
 *                 type: string
 *               party_member_number:
 *                 type: string
 *               voter_id:
 *                 type: string
 *               aadhar_number:
 *                 type: string
 *               image:
 *                 type: string
 *               dname:
 *                 type: string
 *               tname:
 *                 type: string
 *               jname:
 *                 type: string
 *             required:
 *               - mobile
 *               - name
 *               - parents_name
 *               - address
 *               - education_qualification
 *               - caste
 *               - joining_details
 *               - party_member_number
 *               - voter_id
 *               - aadhar_number
 *               - image
 *               - dname
 *               - tname
 *               - jname
 *     responses:
 *       200:
 *         description: Members registered successfully
 *       400:
 *         description: Invalid input or duplicate Member
 *       500:
 *         description: Server error
 */

app.post("/api/Register-Member", async (req: Request, res: Response) => {
  const {
    mobile,
    name,
    parents_name,
    address,
    education_qualification,
    caste,
    joining_details,
    party_member_number,
    voter_id,
    aadhar_number,
    image,
    dname,
    tname,
    jname,
  } = req.body;

  const imageData = image
    ? image.replace(/^data:image\/\w+;base64,/, "")
    : null; // Remove data URL prefix if present
  //** Validate input */
  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (!parents_name) {
    return res.status(400).json({ error: "Parents name is required" });
  }
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }
  if (!education_qualification) {
    return res
      .status(400)
      .json({ error: "Education qualification is required" });
  }
  if (!caste) {
    return res.status(400).json({ error: "Caste is required" });
  }
  if (!joining_details) {
    return res.status(400).json({ error: "Joining details are required" });
  }
  if (!party_member_number) {
    return res.status(400).json({ error: "Party member number is required" });
  }
  if (!voter_id) {
    return res.status(400).json({ error: "Voter ID is required" });
  }
  if (!aadhar_number) {
    return res.status(400).json({ error: "Aadhar number is required" });
  }
  if (!image) {
    return res.status(400).json({ error: "Image is required" });
  }
  if (!dname) {
    return res.status(400).json({ error: "District name is required" });
  }
  if (!tname) {
    return res.status(400).json({ error: "Taluk name is required" });
  }
  if (!jname) {
    return res.status(400).json({ error: "Jurisdiction name is required" });
  }

  //** Query for Insert into DB */

  try {
    const [result]: any = await db?.execute(
      `INSERT INTO users (mobile, name, parents_name, address, education_qualification, caste, joining_details, party_member_number, voter_id, aadhar_number, image, tname, dname, jname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mobile,
        name,
        parents_name,
        address,
        education_qualification,
        caste,
        joining_details,
        party_member_number,
        voter_id,
        aadhar_number,
        imageData,
        dname,
        tname,
        jname,
      ]
    );
    const insertId = result.insertId;
    res.json({
      success: true,
      member: {
        id: insertId,
        name,
        mobile,
        party_member_number,
        tname,
        dname,
        jname,
        parents_name,
        created_at: new Date().toISOString(),
      },
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/Update-Member/{id}:
 *   post:
 *     tags: [Members]
 *     summary: Update an existing member
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           properties:
 *             id:
 *               type: Integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               name:
 *                 type: string
 *               parents_name:
 *                 type: string
 *               address:
 *                 type: string
 *               education_qualification:
 *                 type: string
 *               caste:
 *                 type: string
 *               joining_details:
 *                 type: string
 *               party_member_number:
 *                 type: string
 *               voter_id:
 *                 type: string
 *               aadhar_number:
 *                 type: string
 *               image:
 *                 type: string
 *               dname:
 *                 type: string
 *               tname:
 *                 type: string
 *               jname:
 *                 type: string
 *             required:
 *               - mobile
 *               - name
 *               - parents_name
 *               - address
 *               - education_qualification
 *               - caste
 *               - joining_details
 *               - party_member_number
 *               - voter_id
 *               - aadhar_number
 *               - image
 *               - dname
 *               - tname
 *               - jname
 *     responses:
 *       200:
 *         description: Members registered successfully
 *       400:
 *         description: Invalid input or duplicate Member
 *       500:
 *         description: Server error
 */
app.post("/api/update-member/:id", async (req: Request, res: Response) => {
  const {
    mobile,
    name,
    parents_name,
    address,
    education_qualification,
    caste,
    joining_details,
    party_member_number,
    voter_id,
    aadhar_number,
    image,
    dname,
    tname,
    jname,
  } = req.body;

  const id = req.params.id;

  // Validate input
  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    const [existingMembers]: any = await db?.execute(
      `SELECT * FROM users WHERE (mobile = ? OR party_member_number = ?) AND id != ?`,
      [mobile, party_member_number, id]
    );

    if (existingMembers.length > 0) {
      res.status(400).json({
        success: false,
        message:
          "Another member with this mobile or party member number already exists",
      });
      return;
    }

    const [result]: any = await db?.execute(
      `UPDATE users SET mobile = ?, name = ?, parents_name = ?, address = ?, education_qualification = ?, caste = ?, joining_details = ?, party_member_number = ?, voter_id = ?, aadhar_number = ?, image = ?, tname = ?, dname = ?, jname = ? WHERE id = ?`,
      [
        mobile,
        name,
        parents_name,
        address,
        education_qualification,
        caste,
        joining_details,
        party_member_number,
        voter_id,
        aadhar_number,
        image,
        dname,
        tname,
        jname,
        id,
      ]
    );
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }
    res.json({
      success: true,
      member: {
        id: parseInt(id),
        name,
        mobile,
        party_member_number,
        dname,
        tname,
        jname,
        parents_name,
      },
      message: "Member updated successfully",
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/Delete-Member/{id}:
 *   post:
 *     tags: [Members]
 *     summary: Delete an existing member
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           properties:
 *             id:
 *               type: Integer
 *     responses:
 *       200:
 *         description: Members registered successfully
 *       400:
 *         description: Invalid input or duplicate Member
 *       500:
 *         description: Server error
 */
app.post("/api/delete-member/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!db) {
    res.status(500).json({ success: false, message: "Database not connected" });
    return;
  }
  try {
    const [result] = await db.execute("DELETE FROM members WHERE id = ?", [id]);
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }
    res.json({ success: true, message: "Member deleted successfully" });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /api/view-positions:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
 *     responses:
 *       200:
 *         description: List of all positions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
app.get(
  "/api/view-positions",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (res.headersSent) {
      console.log("Headers already sent in /api/view-positions");
      return;
    }
    try {
      const results = await db?.execute(
        "SELECT DISTINCT tcode, dcode, jcode, tname, dname, jname FROM teams"
      );
      const positions = results as TeamRow[];
      res.json({ success: true, positions });
      return;
    } catch (error) {
      console.error("Fetch positions error:", error);
      if (res.headersSent) {
        console.log("Headers already sent in /api/positions catch");
        return;
      }
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);
// app.get(
//   "/api/view-positions",
//   authenticateToken,
//   async (req: AuthRequest, res: Response): Promise<void> => {
//     if (res.headersSent) {
//       console.log("Headers already sent in /api/view-positions");
//       return;
//     }

//     try {
//       const results = await db?.execute<TeamRow[]>(
//         "SELECT DISTINCT tcode, dcode, jcode AS value, tname, dname, jname AS name FROM teams"
//       );
//       const resultraw = results;
//       const resultPosition = resultraw
//         .map((row) => {
//           // Determine the primary name field (default to jname if others are null/undefined)
//           const primaryKey = row
//             ? "jname"
//             : row.dcode
//             ? "dname"
//             : row.tcode
//             ? "tname"
//             : "jname";
//           const primaryName = row[primaryKey] || "Unknown Position";

//           // Assign category based on available data
//           const category = row.jcode
//             ? "paasrai"
//             : row.tcode
//             ? "ondriyam"
//             : "general";

//           // Safe Tamil name mapping with fallback
//           const tamilTranslations = {
//             jname:
//               row.jname === "position"
//                 ? "பொறுப்பு"
//                 : row.jname || "பதவி அறியப்படவில்லை",
//             dname:
//               row.dname === "district"
//                 ? "மாவட்டம்"
//                 : row.dname || "மாவட்டம் அறியப்படவில்லை",
//             tname:
//               row.tname === "team"
//                 ? "குழு"
//                 : row.tname || "குழு அறியப்படவில்லை",
//           };
//           const tamilName =
//             tamilTranslations[primaryKey] || "பதவி அறியப்படவில்லை";

//           return {
//             jvalue: row.jcode,
//             tvalue: row.tcode,
//             dvalue: row.dcode,
//             name: primaryName,
//             category,
//             tamilName,
//           };
//         })
//         .filter(
//           (
//             pos
//           ): pos is {
//             jvalue: string;
//             tvalue: string;
//             dvalue: string;
//             name: string;
//             category: string;
//             tamilName: string;
//           } => pos.jvalue !== null && pos.name !== null
//         );

//       res.json({ success: true, resultPosition });
//     } catch (error) {
//       console.error("Fetch positions error:", error);
//       if (res.headersSent) {
//         console.log("Headers already sent in /api/view-positions catch");
//         return;
//       }
//       res.status(500).json({ success: false, message: "Server error" });
//     }
//   }
// );
// Define types (add to types.ts or server.ts)

// app.get(
//   "/api/view-positions",
//   authenticateToken,
//   async (req: AuthRequest, res: Response): Promise<void> => {
//     if (res.headersSent) {
//       console.log("Headers already sent in /api/view-positions");
//       return;
//     }
//     if (!db) {
//       res
//         .status(500)
//         .json({ success: false, message: "Database not connected" });
//       return;
//     }
//     try {
//       const [results] = await db.execute<RowDataPacket[]>(
//         "SELECT DISTINCT tcode, dcode, jcode AS value, tname, dname, jname AS name FROM teams"
//       );
//       const positions: PositionResponse[] | any = results.map((row) => {
//         const category = row.tname
//           ? "அணி"
//           : row.dname
//           ? "ஒன்றியம்"
//           : row.jname
//           ? "பொறுப்பு"
//           : "";

//         return res.json({
//           tcode: row.tcode,
//           dcode: row.dcode,
//           jcode: row.jcode,
//           tname: row.tname,
//           dname: row.dname,
//           jname: row.jname,
//           category,
//         });
//       });
// const positions: PositionResponse[] = results.map((row) => {
//   // Assign category based on available data
//   const category = row.jvalue
//     ? "paasrai"
//     : row.tvalue
//     ? "ondriyam"
//     : "general";

//   // Safe Tamil name mapping with fallbacks
//   const tamilName =
//     row.name === "junior"
//       ? "இளைஞர்"
//       : row.name === "district"
//       ? "மாவட்டம்"
//       : row.name === "team"
//       ? "குழு"
//       : row.name || "பதவி அறியப்படவில்லை";

//   return {
//     tvalue: row.tvalue,
//     dvalue: row.dvalue,
//     value: row.value,
//     tname: row.tname,
//     dname: row.dname,
//     name: row.name,
//     category,
//     tamilName,
//   };
// });

//       res.json({ success: true, positions });
//     } catch (error) {
//       console.error("Fetch positions error:", error);
//       if (res.headersSent) {
//         console.log("Headers already sent in /api/view-positions catch");
//         return;
//       }
//       res.status(500).json({ success: false, message: "Server error" });
//     }
//   }
// );

// Add this after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(); // Skip if response already sent
  console.error("Global error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.set("case sensitive routing", false);

/** Start server */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
