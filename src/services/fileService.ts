import * as XLSX from "xlsx";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import type { Contact } from "../types";

export class FileService {
  static async parseExcelFile(filePath: string): Promise<Contact[]> {
    try {
      console.log(`Parsing file: ${filePath}`);

      if (!existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      // Read file as buffer and use XLSX.read for ESM compatibility
      const fileBuffer = await readFile(filePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error("No sheets found in Excel file");
      }

      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header option
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as any[][];

      if (data.length < 2) {
        throw new Error(
          "Excel file must have at least a header row and one data row"
        );
      }

      // Get headers from first row
      const headers = data[0];
      console.log("Excel headers:", headers);

      // Find Email column (case insensitive)
      const emailColumnIndex = headers.findIndex(
        (header: string) =>
          typeof header === "string" && header.toLowerCase().includes("email")
      );

      if (emailColumnIndex === -1) {
        throw new Error(
          'No Email column found. Please ensure your Excel file has an "Email" column.'
        );
      }

      // Convert data rows to contact objects
      const contacts: Contact[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];

        if (!row || row.length === 0) {
          continue; // Skip empty rows
        }

        const contact: Contact = {
          Email: "",
        };

        // Map each column to contact properties
        headers.forEach((header: string, index: number) => {
          if (typeof header === "string" && header.trim() !== "") {
            const cleanHeader = header.trim();
            const value = row[index] ? String(row[index]).trim() : "";

            // Map common column names
            if (cleanHeader.toLowerCase().includes("email")) {
              contact.Email = value;
            } else if (
              cleanHeader.toLowerCase().includes("firstname") ||
              cleanHeader.toLowerCase().includes("first_name") ||
              cleanHeader.toLowerCase() === "first"
            ) {
              contact.FirstName = value;
            } else if (
              cleanHeader.toLowerCase().includes("lastname") ||
              cleanHeader.toLowerCase().includes("last_name") ||
              cleanHeader.toLowerCase() === "last"
            ) {
              contact.LastName = value;
            } else if (cleanHeader.toLowerCase().includes("company")) {
              contact.Company = value;
            } else if (cleanHeader.toLowerCase().includes("subject")) {
              contact.Subject = value;
            } else {
              // Store any other columns as-is
              contact[cleanHeader] = value;
            }
          }
        });

        // Only include contacts with valid email addresses
        if (contact.Email && this.isValidEmail(contact.Email)) {
          contacts.push(contact);
        } else {
          console.log(
            `Skipping row ${i + 1}: Invalid or missing email (${contact.Email})`
          );
        }
      }

      console.log(`Successfully parsed ${contacts.length} valid contacts`);

      if (contacts.length === 0) {
        throw new Error("No valid email addresses found in the Excel file");
      }

      return contacts;
    } catch (error) {
      console.error("Excel parsing error:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to parse Excel file: ${error.message}`);
      } else {
        throw new Error("Failed to parse Excel file: Unknown error");
      }
    }
  }

  static async saveUploadedFile(
    file: Uint8Array,
    filename: string
  ): Promise<string> {
    try {
      // Ensure uploads directory exists
      const uploadDir = "./uploads";
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const uploadPath = `${uploadDir}/${filename}`;
      await writeFile(uploadPath, file);
      console.log(`File saved: ${uploadPath}`);
      return uploadPath;
    } catch (error) {
      console.error("File save error:", error);
      throw new Error(
        `Failed to save uploaded file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async readHTMLTemplate(filePath: string): Promise<string> {
    try {
      if (!existsSync(filePath)) {
        throw new Error("HTML template file does not exist");
      }

      const content = await readFile(filePath, "utf-8");
      console.log(
        `HTML template loaded: ${filePath} (${content.length} characters)`
      );
      return content;
    } catch (error) {
      console.error("HTML template read error:", error);
      throw new Error(
        `Failed to read HTML template: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email.trim());

    if (!isValid) {
      console.log(`Invalid email format: ${email}`);
    }

    return isValid;
  }

  static replacePlaceholders(template: string, contact: Contact): string {
    if (!template || !contact) {
      return template || "";
    }

    let result = template;

    // Replace common placeholders
    result = result.replace(/\{\{FirstName\}\}/g, contact.FirstName || "");
    result = result.replace(/\{\{LastName\}\}/g, contact.LastName || "");
    result = result.replace(/\{\{Company\}\}/g, contact.Company || "");
    result = result.replace(/\{\{Email\}\}/g, contact.Email || "");
    result = result.replace(/\{\{Subject\}\}/g, contact.Subject || "");

    // Replace any other custom fields from the Excel file
    Object.keys(contact).forEach((key) => {
      if (
        key !== "Email" &&
        key !== "FirstName" &&
        key !== "LastName" &&
        key !== "Company" &&
        key !== "Subject"
      ) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        result = result.replace(placeholder, String(contact[key] || ""));
      }
    });

    return result;
  }
}
