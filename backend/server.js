const express = require("express");
const cors = require("cors");
const db = require("./database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

// =========================
// ADMIN AUTH MIDDLEWARE
// =========================

function requireAdmin(req, res, next) {

    const authHeader = req.headers.authorization;


    if (!authHeader) {

        return res.status(401).json({
            message: "Admin login diperlukan"
        });

    }


    const token = authHeader.split(" ")[1];


    if (!token) {

        return res.status(401).json({
            message: "Token tidak dijumpai"
        });

    }


    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        if (decoded.role !== "admin") {

            return res.status(403).json({
                message: "Akses ditolak"
            });

        }


        req.admin = decoded;

        next();


    }

    catch(error) {

        console.log("AUTH ERROR:", error);


        return res.status(401).json({
            message: "Token tidak sah atau telah tamat"
        });

    }

}


// =========================
// HOME
// =========================

app.get("/", function(req, res){

    res.send("NadiGo Backend Running");

});

// =========================
// ADMIN LOGIN
// =========================

app.post("/admin/login", async function(req, res){

    const email = req.body.email;
    const password = req.body.password;


    try {

        // Check email

        if(email !== process.env.ADMIN_EMAIL){

            return res.status(401).json({

                message: "Email atau password salah"

            });

        }


        // Check password

        const passwordMatch =
            password === process.env.ADMIN_PASSWORD;


        if(!passwordMatch){

            return res.status(401).json({

                message: "Email atau password salah"

            });

        }


        // Create token

        const token = jwt.sign(

            {
                role: "admin",
                email: email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        console.log("ADMIN LOGIN BERJAYA");


        res.json({

            message: "Login berjaya",

            token: token

        });


    }

    catch(error){

        console.log("LOGIN ERROR:");
        console.log(error);


        res.status(500).json({

            message: "Login gagal"

        });

    }

});
// =========================
// CREATE BOOKING
// =========================

app.post("/booking", async function(req, res) {

    const booking = req.body;

    try {

        const result = await db.query(`
            INSERT INTO orders (
                "orderID",
                name,
                phone,
                address,
                service,
                weight,
                price,
                "pickupDate",
                status
            )

            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )

            RETURNING *
        `, [

            booking.orderID,
            booking.name,
            booking.phone,
            booking.address,
            booking.service,
            booking.weight,
            booking.price,
            booking.pickupDate,
            booking.status

        ]);

        console.log("Booking baru:");
        console.log(result.rows[0]);

        res.json({

            message: "Booking berjaya diterima",

            data: result.rows[0]

        });

    }

    catch(error) {

        console.error(
            "DATABASE ERROR:",
            error
        );

        res.status(500).json({

            message: "Booking gagal disimpan"

        });

    }

});


// =========================
// GET ALL ORDERS
// =========================

app.get("/orders", requireAdmin, async function(req, res) {

    try {

        const result = await db.query(`
            SELECT *
            FROM orders
            ORDER BY id DESC
        `);

        res.json(result.rows);

    }

    catch(error) {

        console.error(
            "GET ORDERS ERROR:",
            error
        );

        res.status(500).json({

            message: "Gagal ambil orders"

        });

    }

});

// =========================
// CUSTOMER TRACKING
// =========================

app.get("/tracking/:orderID", async function(req, res) {

    const orderID = req.params.orderID;

    try {

        const result = await db.query(`
            SELECT
                "orderID",
                name,
                phone,
                address,
                service,
                weight,
                "pickupDate",
                price,
                "actualWeight",
                "actualPrice",
                status
            FROM orders
            WHERE "orderID" = $1
        `, [orderID]);

        if (result.rows.length === 0) {

            return res.status(404).json({

                message: "Order tidak jumpa"

            });

        }

        res.json(result.rows[0]);

    }

    catch(error) {

        console.error(
            "TRACKING ERROR:",
            error
        );

        res.status(500).json({

            message: "Gagal ambil tracking"

        });

    }

});


// =========================
// UPDATE ORDER STATUS
// =========================

app.put("/orders/:id", requireAdmin, async function(req, res) {

    console.log("PUT MASUK");
    console.log("ORDER ID:", req.params.id);
    console.log("BODY:", req.body);

    const id = req.params.id;
    const newStatus = req.body.status;

    try {

        const result = await db.query(`
            UPDATE orders

            SET status = $1

            WHERE "orderID" = $2

            RETURNING *
        `, [
            newStatus,
            id
        ]);

        if (result.rows.length > 0) {

            console.log("Status updated:");
            console.log(result.rows[0]);

            return res.json({

                message: "Status berjaya update",

                data: result.rows[0]

            });

        }

        return res.status(404).json({

            message: "Order tidak jumpa"

        });

    }

    catch(error) {

        console.error(
            "UPDATE STATUS ERROR:",
            error
        );

        res.status(500).json({

            message: "Gagal update status"

        });

    }

});

// =========================
// UPDATE ACTUAL WEIGHT & PRICE
// =========================

app.put(
    "/orders/:id/actual",
    requireAdmin,
    async function(req, res) {

    const id = req.params.id;

    const actualWeight =
        req.body.actualWeight;

    const actualPrice =
        req.body.actualPrice;


    console.log("ACTUAL ORDER UPDATE");

    console.log("Order ID:", id);
    console.log("Actual Weight:", actualWeight);
    console.log("Actual Price:", actualPrice);


    try {

        const result = await db.query(`
            UPDATE orders

            SET
                "actualWeight" = $1,
                "actualPrice" = $2

            WHERE "orderID" = $3

            RETURNING *
        `, [

            actualWeight,
            actualPrice,
            id

        ]);


        if (result.rows.length > 0) {

            return res.json({

                message:
                    "Actual price berjaya disimpan",

                data:
                    result.rows[0]

            });

        }


        return res.status(404).json({

            message:
                "Order tidak jumpa"

        });

    }

    catch(error) {

        console.error(
            "ACTUAL UPDATE ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Gagal update actual price"

        });

    }

});
// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){

    console.log(
        "Server NadiGo jalan di port " + PORT
    );

});