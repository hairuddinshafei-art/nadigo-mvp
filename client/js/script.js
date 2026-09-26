
const API_URL = "https://nadigo-backend.onrender.com";

console.log("NadiGo JS Connected");


function updateOrder(button) {

    console.log("script masuk");

    const order =
        button.closest(".order-item");

    const status =
        order.querySelector(".status");


    if (status.classList.contains("pending")) {

        status.innerHTML = "Processing";

        status.className =
            "status processing";

        button.innerHTML = "Ready";

    }

    else if (status.classList.contains("processing")) {

        status.innerHTML = "Ready";

        status.className =
            "status ready";

        button.innerHTML = "Delivery";

    }

    else if (status.classList.contains("ready")) {

        status.innerHTML = "Delivered";

        status.className =
            "status delivered";

        button.innerHTML = "Completed";

        button.disabled = true;

    }

}


function acceptOrder() {

    const select =
        document.getElementById("statusSelect");

    select.value =
        "Pickup Scheduled";

    updateStatus();

}


function updateDashboardStatus() {

    const savedStatus =
        localStorage.getItem("NDG-0001-status");

    const status =
        document.getElementById("dashboardStatus");

    const action =
        document.getElementById("orderAction");


    if (savedStatus && status) {

        status.innerHTML =
            savedStatus;

        status.className =
            "status processing";

        action.innerHTML = `
            <button onclick="updateOrder(this)">
                Continue
            </button>
        `;

    }

}


window.addEventListener(
    "load",
    updateDashboardStatus
);


function updateStatus() {

    let status =
        document.getElementById("statusSelect").value;

    let orderID =
        localStorage.getItem("currentOrderID");


    console.log(
        "UPDATE STATUS:",
        status
    );

    console.log(
        "ORDER ID:",
        orderID
    );


    fetch(
        API_URL +
        "/orders/" +
        orderID,
        {

            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    "Bearer " +
                    localStorage.getItem(
                        "nadigoAdminToken"
                    )

            },

            body: JSON.stringify({

                status:
                    status

            })

        }
    )

        .then(
            response =>
                response.json()
        )

        .then(
            data => {

                console.log(
                    "STATUS UPDATED:",
                    data
                );


                if (data.data) {

                    const updatedOrder =
                        data.data;


                    const orderStatus =
                        document.getElementById(
                            "orderStatus"
                        );

                    const statusSelect =
                        document.getElementById(
                            "statusSelect"
                        );


                    if (orderStatus) {

                        orderStatus.innerHTML =
                            updatedOrder.status;

                    }


                    if (statusSelect) {

                        statusSelect.value =
                            updatedOrder.status;

                    }


                    console.log(
                        "Status terus berubah:",
                        updatedOrder.status
                    );

                }

            }
        )

        .catch(
            error => {

                console.log(error);

            }
        );

}


function calculatePrice() {

    let weight =
        Number(
            document.getElementById(
                "weightSlider"
            ).value
        );

    let service =
        document.getElementById(
            "serviceSelect"
        ).value;


    let price = 0;


    if (service === "Wash & Fold") {

        price =
            weight * 9;

    }

    else if (
        service === "Express Laundry"
    ) {

        price =
            weight * 12;

    }


    price =
        Math.max(price, 27);


    const sliderPrice =
        document.getElementById(
            "sliderPrice"
        );

    const weightValue =
        document.getElementById(
            "weightValue"
        );


    if (sliderPrice) {

        sliderPrice.textContent =
            "RM" +
            price.toFixed(2);

    }


    if (weightValue) {

        weightValue.textContent =
            weight.toFixed(1);

    }

}


function saveBooking() {

    console.log(
        "SAVE BOOKING DIPANGGIL"
    );


    const submitButton =
        document.querySelector(
            ".continue-btn"
        );


    if (
        !submitButton ||
        submitButton.disabled ||
        sessionStorage.getItem(
            "nadigoSubmitting"
        ) === "true"
    ) {

        console.log(
            "BOOKING SEDANG DIHANTAR"
        );

        return;

    }


    let name =
        document
            .getElementById("customerName")
            .value
            .trim();

    let phone =
        document
            .getElementById("customerPhone")
            .value
            .trim();

    let address =
        document
            .getElementById("customerAddress")
            .value
            .trim();

            let customerNotes =
    document
        .getElementById("customerNotes")
        .value
        .trim();

    let pickupDate =
        document
            .getElementById("pickupDate")
            .value
            .trim();


    console.log(
        "PICKUP DATE INPUT:",
        pickupDate
    );


    if (name === "") {

        alert(
            "Sila masukkan nama anda."
        );

        document
            .getElementById("customerName")
            .focus();

        return;

    }


    if (phone === "") {

        alert(
            "Sila masukkan nombor telefon."
        );

        document
            .getElementById("customerPhone")
            .focus();

        return;

    }


    if (
        !/^[0-9]{9,10}$/.test(phone)
    ) {

        alert(
            "Sila masukkan nombor telefon yang sah. Contoh: 123456789"
        );

        document
            .getElementById("customerPhone")
            .focus();

        return;

    }


    if (address === "") {

        alert(
            "Sila masukkan alamat pickup."
        );

        document
            .getElementById("customerAddress")
            .focus();

        return;

    }


    if (pickupDate === "") {

        alert(
            "Sila pilih tarikh pickup."
        );

        document
            .getElementById("pickupDate")
            .focus();

        return;

    }


    let bookingData = {

        orderID:
            "NDG-" +
            Date.now(),

        name:
            name,

        phone:
            "+60" +
            phone,

        address:
            address,

            customerNotes:
    customerNotes,

        service:
            document
                .getElementById(
                    "serviceSelect"
                )
                .value,

        weight:
            document
                .getElementById(
                    "weightSlider"
                )
                .value,

        price:
            calculateFinalPrice(),

        pickupDate:
            pickupDate,

        status:
            "Booking Received"

    };


    console.log(
        "BOOKING DATA:",
        bookingData
    );


    sessionStorage.setItem(
        "nadigoSubmitting",
        "true"
    );


    submitButton.disabled =
        true;

    submitButton.innerHTML =
        "⏳ SUBMITTING BOOKING...";


    let sendingMessage =
        document.getElementById(
            "bookingSendingMessage"
        );


    if (!sendingMessage) {

        sendingMessage =
            document.createElement(
                "div"
            );

        sendingMessage.id =
            "bookingSendingMessage";

        sendingMessage.className =
            "booking-sending-message";

        submitButton.parentNode.appendChild(
            sendingMessage
        );

    }


    sendingMessage.innerHTML = `
        <strong>
            Please wait — your booking is being processed.
        </strong>
        Do not refresh this page or press the button again.
    `;


    fetch(
        API_URL +
        "/booking",
        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify(
                    bookingData
                )

        }
    )

        .then(
            function(response) {

                console.log(
                    "RESPONSE STATUS:",
                    response.status
                );


                if (!response.ok) {

                    throw new Error(
                        "Booking gagal dihantar ke server."
                    );

                }


                return response.json();

            }
        )

        .then(
            function(data) {

                console.log(
                    "BACKEND RESPONSE:",
                    data
                );


                localStorage.setItem(

                    "nadigoBooking",

                    JSON.stringify(
                        bookingData
                    )

                );


                console.log(
                    "DATA DISIMPAN:",
                    localStorage.getItem(
                        "nadigoBooking"
                    )
                );


                console.log(
                    "SEBELUM REDIRECT"
                );


                window.location.replace(
                    "confirmation.html"
                );

            }
        )

        .catch(
            function(error) {

                console.error(
                    "BOOKING ERROR:",
                    error
                );


                sessionStorage.removeItem(
                    "nadigoSubmitting"
                );


                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    "Continue Booking →";


                if (sendingMessage) {

                    sendingMessage.remove();

                }


                alert(
                    "Booking gagal dihantar. Sila cuba lagi."
                );

            }
        );

}


function calculateFinalPrice() {

    let weight =
        Number(
            document.getElementById(
                "weightSlider"
            ).value
        );

    let service =
        document.getElementById(
            "serviceSelect"
        ).value;


    let price = 0;


    if (service === "Wash & Fold") {

        price =
            weight * 9;

    }

    else if (
        service === "Express Laundry"
    ) {

        price =
            weight * 12;

    }


    price =
        Math.max(price, 27);


    return (
        "RM" +
        price.toFixed(2)
    );

}


function loadBooking() {

    let data =
        JSON.parse(
            localStorage.getItem(
                "nadigoBooking"
            )
        );


    if (!data) {
        return;
    }


    const fields = {

        confirmOrderID:
            data.orderID,

        confirmName:
            data.name,

        confirmPhone:
            data.phone,

        confirmAddress:
            data.address,

        confirmService:
            data.service,

        confirmWeight:
            data.weight + "kg",

        confirmPrice:
            data.price,

        confirmPickupDate:
            data.pickupDate

    };


    Object.keys(fields).forEach(
        function(id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.innerHTML =
                    fields[id];

            }

        }
    );

}


function loadTracking() {

    console.log(
        "loadTracking jalan"
    );


    let id =
        new URLSearchParams(
            window.location.search
        ).get("id");


    console.log(
        "TRACK ID:",
        id
    );


    fetch(
        API_URL +
        "/tracking/" +
        id
    )

        .then(
            response => {

                if (!response.ok) {

                    throw new Error(
                        "Order tidak dijumpai"
                    );

                }

                return response.json();

            }
        )

        .then(
            order => {

                console.log(
                    "ORDER TRACKING:",
                    order
                );


                if (!order) {
                    return;
                }


                const fields = {

                    trackOrderID:
                        order.orderID,

                    trackName:
                        order.name,

                    trackService:
                        order.service,

                    trackWeight:
                        order.weight + "kg",

                    trackPrice:
                        order.price,

                    trackPickupDate:
                        order.pickupDate,

                    trackStatus:
                        order.status

                };


                Object.keys(fields).forEach(
                    function(id) {

                        const element =
                            document.getElementById(
                                id
                            );

                        if (element) {

                            element.innerHTML =
                                fields[id];

                        }

                    }
                );


                if (order.actualWeight) {

                    const row =
                        document.getElementById(
                            "actualWeightRow"
                        );

                    const value =
                        document.getElementById(
                            "trackActualWeight"
                        );


                    if (row) {
                        row.style.display =
                            "flex";
                    }

                    if (value) {
                        value.innerHTML =
                            order.actualWeight +
                            "kg";
                    }

                }


                if (order.actualPrice) {

                    const row =
                        document.getElementById(
                            "actualPriceRow"
                        );

                    const value =
                        document.getElementById(
                            "trackActualPrice"
                        );


                    if (row) {
                        row.style.display =
                            "flex";
                    }

                    if (value) {
                        value.innerHTML =
                            order.actualPrice;
                    }

                }


                console.log(
                    "STATUS TRACK:",
                    order.status
                );


                updateTimeline(
                    order.status
                );

            }
        )

        .catch(
            error => {

                console.log(
                    "TRACKING ERROR:",
                    error
                );

            }
        );

}


function updateTimeline(status) {

    console.log(
        "UPDATE TIMELINE:",
        status
    );


    let steps = [

        "Booking Received",

        "Pickup Scheduled",

        "Laundry Processing",

        "Ready for Delivery",

        "Delivered"

    ];


    let current =
        steps.indexOf(status);


    console.log(
        "CURRENT STEP:",
        current
    );


    steps.forEach(
        function(step, index) {

            let element =
                document.getElementById(
                    "step" +
                    (index + 1)
                );


            if (!element) {
                return;
            }


            if (index <= current) {

                element.innerHTML =
                    "✓ " +
                    step;

                element.className =
                    "done";

            }

            else {

                element.innerHTML =
                    "○ " +
                    step;

                element.className =
                    "";

            }

        }
    );

}


function acceptBooking() {

    let data =
        JSON.parse(
            localStorage.getItem(
                "nadigoBooking"
            )
        );


    if (!data) {
        return;
    }


    data.status =
        "Pickup Scheduled";


    localStorage.setItem(
        "nadigoBooking",
        JSON.stringify(data)
    );


    alert(
        "Order Accepted"
    );

}


function loadDashboard() {

    let data =
        JSON.parse(
            localStorage.getItem(
                "nadigoBooking"
            )
        );


    if (!data) {
        return;
    }


    const fields = {

        dashboardOrderID:
            data.orderID,

        dashboardName:
            data.name,

        dashboardWeight:
            data.weight + "kg",

        dashboardStatus:
            data.status

    };


    Object.keys(fields).forEach(
        function(id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.innerHTML =
                    fields[id];

            }

        }
    );

}


function loadOrderDetail() {

    let id =
        new URLSearchParams(
            window.location.search
        ).get("id");


    console.log(
        "ID DAPAT:",
        id
    );


    const token =
        localStorage.getItem(
            "nadigoAdminToken"
        );


    fetch(
        API_URL +
        "/orders",
        {

            headers: {

                "Authorization":
                    "Bearer " +
                    token

            }

        }
    )

        .then(
            response =>
                response.json()
        )

        .then(
            data => {

                let order =
                    data.find(
                        function(item) {

                            return (
                                item.orderID == id
                            );

                        }
                    );


                if (!order) {
                    return;
                }


                console.log(
                    "ACTUAL WEIGHT DARI DATABASE:",
                    order.actualWeight
                );

                console.log(
                    "ACTUAL PRICE DARI DATABASE:",
                    order.actualPrice
                );


                localStorage.setItem(
                    "currentOrderID",
                    order.orderID
                );


                console.log(
                    "CURRENT ORDER ID:",
                    order.orderID
                );


                const fields = {

                    detailName:
                        order.name,

                    detailPhone:
                        order.phone,

                    detailAddress:
                        order.address,

                    detailService:
                        order.service,

                    detailWeight:
                        order.weight + "kg",

                    detailPrice:
                        order.price,

                    detailPickupDate:
                        order.pickupDate,

                    orderStatus:
                        order.status ||
                        "Booking Received"

                };


                Object.keys(fields).forEach(
                    function(id) {

                        const element =
                            document.getElementById(
                                id
                            );

                        if (element) {

                            element.innerHTML =
                                fields[id];

                        }

                    }
                );


                const actualWeightInput =
                    document.getElementById(
                        "actualWeight"
                    );

                const actualPriceDisplay =
                    document.getElementById(
                        "actualPrice"
                    );


                if (actualWeightInput) {

                    actualWeightInput.value =
                        order.actualWeight ||
                        "";

                }


                if (actualPriceDisplay) {

                    actualPriceDisplay.textContent =
                        order.actualPrice ||
                        "RM0.00";

                }


                const statusSelect =
                    document.getElementById(
                        "statusSelect"
                    );


                if (statusSelect) {

                    statusSelect.value =
                        order.status ||
                        "Booking Received";

                }

            }
        )

        .catch(
            error => {

                console.log(error);

            }
        );

}


function loadOrders() {

    console.log(
        "LOAD ORDERS JALAN"
    );


    const token =
        localStorage.getItem(
            "nadigoAdminToken"
        );


    fetch(
        API_URL +
        "/orders",
        {

            headers: {

                "Authorization":
                    "Bearer " +
                    token

            }

        }
    )

        .then(
            response =>
                response.json()
        )

        .then(
            data => {

                let container =
                    document.getElementById(
                        "ordersContainer"
                    );


                if (!container) {
                    return;
                }


                container.innerHTML =
                    "";


                data.forEach(
                    function(order) {

                        container.innerHTML += `

                            <div class="order-item">

                                <div>

                                    <h3>
                                        ${order.orderID}
                                    </h3>

                                    <p>
                                        Customer:
                                        ${order.name}
                                    </p>

                                    <p>
                                        Weight:
                                        ${order.weight}kg
                                    </p>

                                </div>

                                <span class="status pending">
                                    ${order.status}
                                </span>

                                <a
                                    href="order-detail.html?id=${order.orderID}"
                                    class="view-btn"
                                >
                                    View
                                </a>

                            </div>

                        `;

                    }
                );

            }
        )

        .catch(
            error => {

                console.log(error);

            }
        );

}


let weightSlider =
    document.getElementById(
        "weightSlider"
    );


if (weightSlider) {

    weightSlider.addEventListener(
        "input",
        function() {

            let kg =
                parseFloat(this.value);


            let percentage =
                (
                    (this.value - this.min) /
                    (this.max - this.min)
                ) * 100;


            this.style.background =
                `linear-gradient(
                    to right,
                    #0066ff 0%,
                    #0066ff ${percentage}%,
                    #ddd ${percentage}%,
                    #ddd 100%
                )`;


            let price;


            if (kg < 3) {

                price = 27;

            }

            else {

                price =
                    kg * 9;

            }


            const weightValue =
                document.getElementById(
                    "weightValue"
                );

            const sliderPrice =
                document.getElementById(
                    "sliderPrice"
                );


            if (weightValue) {

                weightValue.innerHTML =
                    kg.toFixed(1);

            }


            if (sliderPrice) {

                sliderPrice.innerHTML =
                    "RM" +
                    price.toFixed(2);

            }

        }
    );

}


let pickupDateInput =
    document.getElementById(
        "pickupDate"
    );


if (pickupDateInput) {

    let today =
        new Date();


    let year =
        today.getFullYear();


    let month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    let day =
        String(
            today.getDate()
        ).padStart(2, "0");


    let minDate =
        `${year}-${month}-${day}`;


    pickupDateInput.min =
        minDate;

}


console.log(
    "flatpickr check:",
    typeof flatpickr
);


if (
    document.getElementById(
        "pickupDate"
    ) &&
    typeof flatpickr !== "undefined"
) {

    flatpickr(
        "#pickupDate",
        {

            minDate: "today",

            dateFormat: "d-m-Y"

        }
    );

}


console.log(
    "SCRIPT.JS LOADED"
);


if (
    document.getElementById(
        "weightSlider"
    )
) {

    document
        .getElementById(
            "weightSlider"
        )
        .addEventListener(
            "input",
            function() {

                calculatePrice();

            }
        );

}


/* =========================================================
   ACTUAL PRICE CALCULATION
========================================================= */

function calculateActualPrice() {

    const weightInput =
        document.getElementById(
            "actualWeight"
        );

    const priceDisplay =
        document.getElementById(
            "actualPrice"
        );


    if (
        !weightInput ||
        !priceDisplay
    ) {

        return;

    }


    const weight =
        Number(
            weightInput.value
        );


    const serviceElement =
        document.getElementById(
            "detailService"
        );


    if (!serviceElement) {
        return;
    }


    const service =
        serviceElement.textContent.trim();


    if (
        !weight ||
        weight <= 0
    ) {

        priceDisplay.textContent =
            "RM0.00";

        return;

    }


    let price = 0;


    if (
        service === "Wash & Fold"
    ) {

        price =
            weight * 9;

    }

    else if (
        service === "Express Laundry"
    ) {

        price =
            weight * 12;

    }


    price =
        Math.max(price, 27);


    priceDisplay.textContent =
        "RM" +
        price.toFixed(2);

}


/* =========================================================
   SAVE ACTUAL PRICE
========================================================= */

function saveActualPrice() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderID =
        params.get("id");


    const actualWeight =
        Number(
            document.getElementById(
                "actualWeight"
            ).value
        );


    const actualPrice =
        document.getElementById(
            "actualPrice"
        ).textContent;


    if (!orderID) {

        alert(
            "Order ID tidak dijumpai."
        );

        return;

    }


    if (
        !actualWeight ||
        actualWeight <= 0
    ) {

        alert(
            "Sila masukkan actual weight."
        );

        return;

    }


    if (
        actualPrice === "RM0.00"
    ) {

        alert(
            "Harga sebenar tidak dapat dikira."
        );

        return;

    }


    fetch(
        API_URL +
        "/orders/" +
        orderID +
        "/actual",
        {

            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    "Bearer " +
                    localStorage.getItem(
                        "nadigoAdminToken"
                    )

            },

            body: JSON.stringify({

                actualWeight:
                    actualWeight,

                actualPrice:
                    actualPrice

            })

        }
    )

        .then(
            response =>
                response.json()
        )

        .then(
            data => {

                console.log(
                    "ACTUAL PRICE RESPONSE:",
                    data
                );


                if (data.data) {

                    const savedOrder =
                        data.data;


                    const actualWeightInput =
                        document.getElementById(
                            "actualWeight"
                        );

                    const actualPriceDisplay =
                        document.getElementById(
                            "actualPrice"
                        );


                    if (actualWeightInput) {

                        actualWeightInput.value =
                            savedOrder.actualWeight;

                    }


                    if (actualPriceDisplay) {

                        actualPriceDisplay.textContent =
                            savedOrder.actualPrice;

                    }


                    const message =
                        document.getElementById(
                            "actualSaveMessage"
                        );


                    if (message) {

                        message.textContent =
                            "✓ Actual price berjaya disimpan.";

                        message.className =
                            "actual-save-message success";

                    }


                    const button =
                        document.querySelector(
                            ".save-price-btn"
                        );


                    if (button) {

                        button.textContent =
                            "✓ Saved";

                        button.disabled =
                            true;

                    }

                }

                else {

                    alert(
                        "Gagal simpan actual price."
                    );

                }

            }
        )

        .catch(
            error => {

                console.log(error);

                alert(
                    "Backend error."
                );

            }
        );

}


function loadDashboardRecentOrders() {

    console.log(
        "LOAD DASHBOARD RECENT ORDERS"
    );


    const token =
        localStorage.getItem(
            "nadigoAdminToken"
        );


    fetch(
        API_URL +
        "/orders",
        {

            headers: {

                "Authorization":
                    "Bearer " +
                    token

            }

        }
    )

        .then(
            response =>
                response.json()
        )

        .then(
            data => {

                const container =
                    document.getElementById(
                        "ordersContainer"
                    );


                if (!container) {
                    return;
                }


                container.innerHTML =
                    "";


                const newOrders =
                    data.filter(
                        function(order) {

                            return (
                                order.status ===
                                "Booking Received"
                            );

                        }
                    );


                if (
                    newOrders.length === 0
                ) {

                    container.innerHTML = `
                        <p class="no-orders">
                            No new orders
                        </p>
                    `;

                    return;

                }


                newOrders.forEach(
                    function(order) {

                        container.innerHTML += `

                            <div class="order-item">

                                <div>

                                    <h3>
                                        ${order.orderID}
                                    </h3>

                                    <p>
                                        Customer:
                                        ${order.name}
                                    </p>

                                    <p>
                                        Weight:
                                        ${order.weight}kg
                                    </p>

                                </div>

                                <span class="status pending">
                                    ${order.status}
                                </span>

                                <a
                                    href="order-detail.html?id=${order.orderID}"
                                    class="view-btn"
                                >
                                    View
                                </a>

                            </div>

                        `;

                    }
                );

            }
        )

        .catch(
            error => {

                console.log(
                    "Dashboard error:",
                    error
                );

            }
        );

}


function loadDashboardStats() {

    console.log(
        "LOAD DASHBOARD STATS"
    );


    const token =
        localStorage.getItem(
            "nadigoAdminToken"
        );


    fetch(
        API_URL +
        "/orders",
        {

            headers: {

                "Authorization":
                    "Bearer " +
                    token

            }

        }
    )

        .then(
            response =>
                response.json()
        )

        .then(
            data => {

                let newOrders = 0;
                let pending = 0;
                let processing = 0;
                let ready = 0;


                data.forEach(
                    function(order) {

                        if (
                            order.status ===
                            "Booking Received"
                        ) {

                            newOrders++;

                        }

                        else if (
                            order.status ===
                            "Pickup Scheduled"
                        ) {

                            pending++;

                        }

                        else if (
                            order.status ===
                            "Laundry Processing"
                        ) {

                            processing++;

                        }

                        else if (
                            order.status ===
                            "Ready for Delivery"
                        ) {

                            ready++;

                        }

                    }
                );


                const elements = {

                    newOrdersCount:
                        newOrders,

                    pendingCount:
                        pending,

                    processingCount:
                        processing,

                    readyCount:
                        ready

                };


                Object.keys(elements).forEach(
                    function(id) {

                        const element =
                            document.getElementById(
                                id
                            );

                        if (element) {

                            element.innerHTML =
                                elements[id];

                        }

                    }
                );

            }
        )

        .catch(
            error => {

                console.log(
                    "Dashboard stats error:",
                    error
                );

            }
        );

}


function trackOrder() {

    console.log(
        "TRACK ORDER JALAN"
    );


    const input =
        document.getElementById(
            "trackingInput"
        );

    const error =
        document.getElementById(
            "trackingError"
        );

    const result =
        document.getElementById(
            "trackingResult"
        );


    if (
        !input ||
        !error ||
        !result
    ) {

        return;

    }


    const orderID =
        input.value.trim();


    if (orderID === "") {

        error.innerHTML =
            "Sila masukkan Order ID.";

        result.style.display =
            "none";

        return;

    }


    console.log(
        "SEARCH ORDER:",
        orderID
    );


    fetch(
        API_URL +
        "/tracking/" +
        encodeURIComponent(
            orderID
        )
    )

        .then(
            response => {

                if (!response.ok) {

                    throw new Error(
                        "Order tidak dijumpai."
                    );

                }

                return response.json();

            }
        )

        .then(
            order => {

                console.log(
                    "ORDER:",
                    order
                );


                if (!order) {

                    error.innerHTML =
                        "Order ID tidak dijumpai.";

                    result.style.display =
                        "none";

                    return;

                }


                error.innerHTML =
                    "";


                const fields = {

                    resultOrderID:
                        order.orderID,

                    resultName:
                        order.name,

                    resultService:
                        order.service,

                    resultEstimatedWeight:
                        order.weight + "kg",

                    resultActualWeight:
                        order.actualWeight
                            ? order.actualWeight +
                              "kg"
                            : "Pending",

                    resultEstimatedPrice:
                        order.price,

                    resultActualPrice:
                        order.actualPrice
                            ? order.actualPrice
                            : "Pending",

                    resultStatus:
                        order.status ||
                        "Booking Received"

                };


                Object.keys(fields).forEach(
                    function(id) {

                        const element =
                            document.getElementById(
                                id
                            );

                        if (element) {

                            element.innerHTML =
                                fields[id];

                        }

                    }
                );


                result.style.display =
                    "block";

            }
        )

        .catch(
            errorObject => {

                console.log(
                    "TRACKING ERROR:",
                    errorObject
                );


                error.innerHTML =
                    "Order ID tidak dijumpai.";

                result.style.display =
                    "none";

            }
        );

}


/* =========================================================
   NADIGO MOBILE MENU
========================================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navLinks =
    document.querySelector(
        ".nav-links"
    );


if (
    menuToggle &&
    navLinks
) {

    menuToggle.addEventListener(
        "click",
        function() {

            const isOpen =
                navLinks.classList.toggle(
                    "active"
                );


            menuToggle.innerHTML =
                isOpen
                    ? "✕"
                    : "☰";


            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );

        }
    );


    navLinks
        .querySelectorAll("a")
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    function() {

                        navLinks.classList.remove(
                            "active"
                        );

                        menuToggle.innerHTML =
                            "☰";

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}

