import express, { Request, Response, NextFunction } from "express";
import mysql, { Connection } from "mysql2";
import axios from "axios";
import cors from "cors";
// import * as dns from 'dns/promises';
import path from "path";
// import { parse } from 'csv-parse';
// import ExcelJS from 'exceljs';
// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import { fileURLToPath, Url } from 'url';
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

//** Swagger definition for API Calls*/
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AIADMK Members Management System API",
      version: "1.0.0",
      description:
        "API for managing members, OTP verification, and reports for AIADMK.",
      contact: {
        name: "LKPR GLobal LLP",
        url: "https://lkprglobal.com",
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

const specs = swaggerJsdoc(options);
const app = express();
const port = process.env.PORT || 5253; // Include the port variable in .env, if you need to run on the different port
app.use(cors({ origin: ["http://localhost:5253", "http://localhost:8080"] }));
app.use(express.json({ limit: "50mb" }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//** Debug dotenv loading*/
console.log("Dotenv path:", path.resolve(__dirname, "../.env"));
console.log("Environment variables:", {
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN ? "****" : "undefined",
});

//** Mysql Database connection string */
// MySQL connection
const db: Connection = mysql.createConnection({
  host: "localhost",
  user: "lkprglobal_localdev",
  password: "PdK1!gc8Ep%n",
  database: "aiadmk_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
  console.log("Connected to MySQL");
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

app.post("/api/register", (req: Request, res: Response) => {
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

  db.query(
    "INSERT INTO admins (username, mobile, role) VALUES (?, ?, ?)",
    [username, sanitizedMobile, role],
    (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      return res
        .status(200)
        .json({ message: `${role} : ${username} registered successfully` });
    }
  );
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
app.post("/api/Login", (req: Request, res: Response) => {
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

  // Check if the mobile number exists in the database
  db.query(
    "UPDATE admins SET otp = ?, otp_expiry = ? WHERE mobile = ?",
    [otp, expiry, sanitizedMobile],
    (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      //**Whatsapp otp Send */
      sendWhatsAppOTP();

      return res.status(200).json({ message: `OTP sent successfully` });
    }
  );
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
app.post("/api/validate-otp", (req: Request, res: Response) => {
  const { mobile, otp } = req.body;
  const sanitizedMobile = sanitizePhoneNumber(mobile);
  // Validate input
  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required" });
  }
  if (!otp) {
    return res.status(400).json({ error: "OTP is required" });
  }

  db.query(
    "SELECT * FROM admins WHERE mobile = ? AND otp = ?",
    [sanitizedMobile, otp],
    (err, results: any[]) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!results || results.length === 0) {
        return res.status(400).json({ error: "Invalid mobile number or OTP" });
      }

      //Clear OTP
      db.query(
        "UPDATE admins SET otp = NULL, otp_expiry = NULL WHERE mobile = ?",
        [sanitizedMobile],
        (err) => {
          if (err) {
            console.error("Error clearing OTP:", err);
            return res.status(500).json({ error: "Server error" });
          }
        }
      );

      //Update Status of User / Admin
      db.query(
        "UPDATE admins SET is_verified = ? WHERE mobile = ?",
        [1, sanitizedMobile],
        (err) => {
          if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ error: "Server error" });
          }
        }
      );

      // OTP is valid, proceed with login
      return res.status(200).json({
        message: `${results[0].role} : ${results[0].username} logged in successfully`,
      });
    }
  );
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
app.get("/api/view-members", (req: Request, res: Response) => {
  // Handle GET request for member registration
  db.query("SELECT * FROM users", (err, results: any[]) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    return res.status(200).json({ members: results });
  });
});

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

app.post("/api/Register-Member", (req: Request, res: Response) => {
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

  db.query(
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
    ],
    (err) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res
        .status(200)
        .json({ message: `${name} Member registered successfully` });
    }
  );
});

/**
 * @swagger
 * /api/Update-Member:
 *   post:
 *     tags: [Members]
 *     summary: Update an existing member
 *     parameters:
 *      - in: path
 *        name: ID
 *        required: true
 *        description: Member ID to update
 *        schema:
 *          type: input
 *          properties:
 *            id:
 *              type: integer
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
 *         description: Members Updated successfully
 *       400:
 *         description: Invalid input or duplicate Member
 *       500:
 *         description: Server error
 */
app.post("/api/update-member", (req: Request, res: Response) => {
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

  const id = req.query.id;
  // Validate input
  if (!id || id === "") {
    return res.status(400).json({ error: "ID is required" });
  }

  // Update query
  db.query(
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
    ],
    (err) => {
      if (err) {
        console.error("Error updating data:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res
        .status(200)
        .json({ message: `Member with ID ${id} updated successfully` });
    }
  );
});

/** Start server */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
