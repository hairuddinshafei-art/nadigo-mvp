// =========================
// NADIGO ADMIN AUTH
// =========================

function checkAdminLogin() {

    const token =
        localStorage.getItem("nadigoAdminToken");


    if (!token) {

        window.location.href =
            "admin-login.html";

    }

}


// =========================
// LOGOUT
// =========================

function adminLogout() {

    localStorage.removeItem(
        "nadigoAdminToken"
    );


    window.location.href =
        "admin-login.html";

}