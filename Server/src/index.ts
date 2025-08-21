import express, { Request, Response, NextFunction } from 'express';
import mysql, { Connection } from 'mysql2';
import axios from 'axios';
import cors from 'cors';
import * as dns from 'dns/promises';
import path from 'path';
import { parse } from 'csv-parse';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { fileURLToPath, Url } from 'url';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';


//** Swagger definition for API Calls*/ 
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AIADMK Members Management System API',
      version: '1.0.0',
      description: 'API for managing members, OTP verification, and reports for AIADMK.',
      contact: {
        name: 'LKPR GLobal LLP',
        url: 'https://lkprglobal.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5253',
      },
    ],
  },
  apis: ['./src/index.ts'], // Path to files with JSDoc annotations
};

const specs = swaggerJsdoc(options);
const app = express();
const port = process.env.PORT || 5253;  // Include the port variable in .env, if you need to run on the different port
app.use(cors({ origin: ['http://localhost:5253', 'http://localhost:8080'] }));
app.use(express.json({ limit: '50mb' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


//** Debug dotenv loading*/ 
console.log('Dotenv path:', path.resolve(__dirname, '../.env'));
console.log('Environment variables:', {
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN ? '****' : 'undefined',
});

//** Mysql Database connection string */
// MySQL connection
const db: Connection = mysql.createConnection({
  host: 'localhost',
  user: 'lkprglobal_localdev',
  password: 'PdK1!gc8Ep%n',
  database: 'aiadmk_db',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('Connected to MySQL');
});

//** WhatsApp API configuration*/ 
const whatsappToken = process.env.WHATSAPP_TOKEN;
let whatsappUrl = `https://api.lkprglobal.com/v1/message/send-message?token=${whatsappToken}`;

//** Generate 6-digit OTP*/ 
const generateOTP: () => string = () => Math.floor(100000 + Math.random() * 900000).toString();

/* The `sanitizePhoneNumber` function is a utility function that takes a phone number as input, removes
any non-numeric characters, adds the country code '+91' if missing, and returns the sanitized phone
number in the format '+91XXXXXXXXXX'. */
const sanitizePhoneNumber = (number: string): string => {
  if (!number) return '';
  const numberWithPlus = number.replace(/^\+/, '');
  const cleanNumber = numberWithPlus.replace(/[^0-9]/g, '');
  return `+91${cleanNumber}`;
};


/* The `formatWhatsAppNumber` function is a utility function that takes a phone number as input,
removes any non-numeric characters, and ensures that the number is formatted correctly for WhatsApp API. */
const formatWhatsAppNumber = (number: string): string => {
  const cleanNumber = number.replace(/[^0-9]/g, '');
  return cleanNumber.startsWith('+91') ? cleanNumber : `91${cleanNumber}`;
};


/* The `// Retry logic for API requests` section in the code is implementing a retry mechanism for
making API requests. This mechanism allows the code to retry sending an API request a specified
number of times if the initial request fails. */
const sendWithRetry = async (
  url: string,
  payload: any,
  headers: any,
  retries: number = 3,
  delay: number = 1000
): Promise<{ success: boolean; data?: any; status?: number; error?: any }> => {
  let lastError: any = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(url, payload, { headers });
      return { success: true, data: response.data, status: response.status };
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${i + 1} failed:`, {
        message: (err as Error).message,
        code: (err as any).code,
        response: (err as any).response?.data,
        status: (err as any).response?.status,
        headers: (err as any).response?.headers,
      });
      if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return { success: false, error: lastError };
};


/* The code snippet you provided is defining a POST endpoint `/api/register` in the Express
application. When a POST request is made to this endpoint, the server executes the callback function
specified, which handles the registration process for a new admin. */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new admin
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
 *             required:
 *               - mobile
 *     responses:
 *       200:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input or duplicate mobile
 *       500:
 *         description: Server error
 */

app.post('/api/register', (req: Request, res: Response) => {
  const { username, mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  const sanitizedMobile = sanitizePhoneNumber(mobile);
  const otp = generateOTP();

  db.query('INSERT INTO admins (username, mobile, otp) VALUES (?, ?, ?)', [username, sanitizedMobile, otp], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    const payload = {
      to: formatWhatsAppNumber(sanitizedMobile),
      type: 'template',
      // text: `Your OTP for registration is ${otp}`,
      template: {
                  language: { policy: 'deterministic', code: 'en' },
                  name: 'otp_copy',
                  components: [
                    { type: 'body', parameters: [{ type: 'text', text: otp }] },
                    { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: otp }] },
                  ],
                },
    };

    sendWithRetry(whatsappUrl, payload, { 'Content-Type': 'application/json' })
      .then((result) => {
        if (result.success) {
          return res.status(200).json({ message: 'Admin registered successfully', otp });
        } else {
          console.error('WhatsApp API error:', result.error);
          return res.status(500).json({ error: 'Failed to send OTP via WhatsApp' });
        }
      })
      .catch((error) => {
        console.error('Error sending WhatsApp message:', error);
        return res.status(500).json({ error: 'Failed to send OTP via WhatsApp' });
      });
  });
});


/**
 * @swagger
 * /api/Login:
 *   post:
 *     summary: Login an admin
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


/** Start server */
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});