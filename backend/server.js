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

app.get("/orders", requireAdmin, function(req, res){

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

app.post("/booking", function(req, res){

    const booking = req.body;


    try {

        const insert = db.prepare(`
            INSERT INTO orders (
                orderID,
                name,
                phone,
                address,
                service,
                weight,
                price,
                pickupDate,
                status
            )

            VALUES (
                @orderID,
                @name,
                @phone,
                @address,
                @service,
                @weight,
                @price,
                @pickupDate,
                @status
            )
        `);


        insert.run(booking);


        console.log("Booking baru:");
        console.log(booking);


        res.json({

            message: "Booking berjaya diterima",

            data: booking

        });


    }

    catch(error){

        console.log("DATABASE ERROR:");
        console.log(error);


        res.status(500).json({

            message: "Booking gagal disimpan"

        });

    }

});


// =========================
// GET ALL ORDERS
// =========================

app.get("/orders", function(req, res){

    try {

        const orders = db.prepare(`
            SELECT *
            FROM orders
            ORDER BY id DESC
        `).all();


        res.json(orders);


    }

    catch(error){

        console.log(error);


        res.status(500).json({

            message: "Gagal ambil orders"

        });

    }

});


// =========================
// UPDATE ORDER STATUS
// =========================

app.put("/orders/:id", requireAdmin, function(req, res){

    console.log("PUT MASUK");

    console.log(req.params.id);

    console.log(req.body);


    const id = req.params.id;

    const newStatus = req.body.status;


    try {

        const update = db.prepare(`
            UPDATE orders

            SET status = ?

            WHERE orderID = ?
        `);


        const result = update.run(
            newStatus,
            id
        );


        if(result.changes > 0){

            const order = db.prepare(`
                SELECT *
                FROM orders
                WHERE orderID = ?
            `).get(id);


            console.log("Status updated:");

            console.log(order);


            res.json({

                message: "Status berjaya update",

                data: order

            });

        }

        else{

            res.status(404).json({

                message: "Order tidak jumpa"

            });

        }


    }

    catch(error){

        console.log(error);


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
    function(req, res){

    const id = req.params.id;

    const actualWeight = req.body.actualWeight;
    const actualPrice = req.body.actualPrice;


    console.log("ACTUAL ORDER UPDATE");

    console.log("Order ID:", id);
    console.log("Actual Weight:", actualWeight);
    console.log("Actual Price:", actualPrice);


    try {

        const update = db.prepare(`
            UPDATE orders

            SET
                actualWeight = ?,
                actualPrice = ?

            WHERE orderID = ?
        `);


        const result = update.run(
            actualWeight,
            actualPrice,
            id
        );


        if(result.changes > 0){

            const order = db.prepare(`
                SELECT *
                FROM orders
                WHERE orderID = ?
            `).get(id);


            res.json({

                message: "Actual price berjaya disimpan",

                data: order

            });

        }

        else{

            res.status(404).json({

                message: "Order tidak jumpa"

            });

        }

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            message: "Gagal update actual price"

        });

    }

});
// =========================
// START SERVER
// =========================

app.listen(3000, function(){

    console.log(
        "Server NadiGo jalan di port 3000"
    );

});