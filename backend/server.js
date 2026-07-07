require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const db = require("./database");
const s3 = require("./s3");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage()
});

/* ============================================
   HEALTH API
============================================ */

app.get("/health", (req, res) => {

    res.json({

        success: true,

        message: "CloudVault Backend Running"

    });

});


/* ============================================
   REGISTER
============================================ */

app.post("/register", async (req, res) => {

    try {

        const {

            username,

            email,

            password

        } = req.body;

        // Save User into PostgreSQL

        const query = `
        INSERT INTO users(username,email,password)
        VALUES($1,$2,$3)
        RETURNING *`;

        const values = [

            username,

            email,

            password

        ];

        await db.query(query, values);

        /*
            Create S3 Folder

            Example

            cloudvault-storage/

                ashvanthan/

        */

        // TODO
        // await s3.createFolder(username);

        res.json({

            success: true,

            message: "User Registered Successfully"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Registration Failed"

        });

    }

});


/* ============================================
   LOGIN
============================================ */

app.post("/login", async (req, res) => {

    try {

        const {

            username,

            password

        } = req.body;

        const query = `

        SELECT *

        FROM users

        WHERE username=$1

        AND password=$2

        `;

        const values = [

            username,

            password

        ];

        const result = await db.query(

            query,

            values

        );

        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid Username or Password"

            });

        }

        res.json({

            success: true,

            message: "Login Successful",

            username: username

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Login Failed"

        });

    }

});


/* ============================================
   FILE UPLOAD
============================================ */

app.post(

    "/upload",

    upload.single("file"),

    async (req, res) => {

        try {

            const username = req.body.username;

            const file = req.file;

            // TODO

            // await s3.uploadFile(

            // username,

            // file.originalname,

            // file.buffer

            // );

            res.json({

                success: true,

                message: "File Uploaded Successfully"

            });

        }

        catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message: "Upload Failed"

            });

        }

    }

);


/* ============================================
   VIEW FILES
============================================ */

app.get("/files/:username", async (req, res) => {

    try {

        const username = req.params.username;

        // TODO

        // const files = await s3.listFiles(username);

        const files = [];

        res.json(files);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Unable To Retrieve Files"

        });

    }

});


/* ============================================
   SERVER
============================================ */

app.listen(PORT, () => {

    console.log("=================================");

    console.log("CloudVault Backend Started");

    console.log("http://localhost:5000");

    console.log("=================================");

});