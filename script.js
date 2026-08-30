// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL = "https://rwervygorcsmztbwfeqq.supabase.co";
const SUPABASE_KEY = "sb_publishable_cRA3wSzbzBnH6bSOuu1xLw_rr0Bal6h";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================================
// PAGE / NAVIGATION
// ============================================================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {

    const windowHeight = window.innerHeight;

    reveals.forEach(item => {

        const revealTop = item.getBoundingClientRect().top;

        if (revealTop < windowHeight - 120) {
            item.classList.add("active");
        }

    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


function updateActiveNav() {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });
}

window.addEventListener("scroll", updateActiveNav);


// ============================================================
// SINGLE ITEM ORDER
// ============================================================

let selectedItem = "";
let selectedPrice = 0;


function openOrderForm(item, price) {

    selectedItem = item;
    selectedPrice = Number(price);

    const popup = document.getElementById("orderPopup");
    const itemField = document.getElementById("orderItem");
    const priceField = document.getElementById("orderPrice");

    if (!popup) return;

    if (itemField) {
        itemField.value = item;
    }

    if (priceField) {
        priceField.value = "₹" + price;
    }

    popup.style.display = "flex";
}


function closePopup() {

    const popup = document.getElementById("orderPopup");

    if (popup) {
        popup.style.display = "none";
    }
}


async function placeOrder() {

    const name = document.getElementById("customerName")?.value.trim();
    const phone = document.getElementById("customerPhone")?.value.trim();
    const qty = Number(document.getElementById("orderQty")?.value || 1);
    const note = document.getElementById("orderNote")?.value.trim();

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter a valid 10 digit phone number.");
        return;
    }

    if (qty < 1) {
        alert("Please select a valid quantity.");
        return;
    }

    if (!selectedItem || selectedPrice <= 0) {
        alert("Please select an item first.");
        return;
    }

    const orderItems = [{
        item: selectedItem,
        price: selectedPrice,
        qty: qty,
        note: note
    }];

    const total = selectedPrice * qty;

    const { error } = await supabaseClient
        .from("Orders")
        .insert([{
            customer_name: name,
            phone: phone,
            items: orderItems,
            total_amount: total,
            status: "Pending"
        }]);

    if (error) {

        console.error("Supabase error:", error);

        alert(
            "Order could not be placed.\n\n" +
            error.message
        );

        return;
    }

    alert("Order Placed Successfully!");

    // Reset form
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("orderQty").value = 1;
    document.getElementById("orderNote").value = "";

    selectedItem = "";
    selectedPrice = 0;

    closePopup();
}


// ============================================================
// CART
// ============================================================

let cart = [];


function updateCartCount() {

    const countElement = document.getElementById("cart-count");

    if (!countElement) return;

    const totalItems = cart.reduce(
        (total, item) => total + item.qty,
        0
    );

    countElement.textContent = totalItems;
}


function addToCart(item, price) {

    price = Number(price);

    const existingItem = cart.find(
        product => product.item === item
    );

    if (existingItem) {

        existingItem.qty++;

    } else {

        cart.push({
            item: item,
            price: price,
            qty: 1
        });
    }

    updateCartCount();

    // Small visual feedback
    const cartButton = document.querySelector(".cart-btn");

    if (cartButton) {

        cartButton.classList.add("cart-bounce");

        setTimeout(() => {
            cartButton.classList.remove("cart-bounce");
        }, 300);
    }

    // Open cart after adding
    openCart();
}


// ============================================================
// OPEN CART
// ============================================================

function openCart() {

    const cartModal = document.getElementById("cart-modal");
    const cartItems = document.getElementById("cart-items");

    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartTotal = document.getElementById("cart-total");
    const cartItemsCount = document.getElementById("cart-items-count");

    if (!cartModal || !cartItems) {

        console.error(
            "Cart elements not found. Check your HTML IDs."
        );

        return;
    }

    cartItems.innerHTML = "";


    // --------------------------------------------------------
    // EMPTY CART
    // --------------------------------------------------------

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>

                <strong>Your cart is empty</strong>

                <span>
                    Add something delicious from our menu!
                </span>
            </div>
        `;

        if (cartItemsCount) {
            cartItemsCount.textContent = "0 items";
        }

        if (cartSubtotal) {
            cartSubtotal.textContent = "₹0";
        }

        if (cartTotal) {
            cartTotal.textContent = "₹0";
        }

        cartModal.style.display = "flex";

        return;
    }


    // --------------------------------------------------------
    // CART WITH ITEMS
    // --------------------------------------------------------

    let subtotal = 0;
    let totalQuantity = 0;

    cart.forEach((item, index) => {

        const itemTotal = item.price * item.qty;

        subtotal += itemTotal;
        totalQuantity += item.qty;

        cartItems.innerHTML += `
            <div class="cart-item">

                <div class="cart-item-info">

                    <strong>
                        ${item.item}
                    </strong>

                    <p>
                        ₹${item.price} each
                    </p>

                </div>


                <div class="cart-quantity">

                    <button
                        type="button"
                        onclick="decreaseCartItem(${index})"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <span>
                        ${item.qty}
                    </span>

                    <button
                        type="button"
                        onclick="increaseCartItem(${index})"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                </div>


                <strong class="cart-item-total">
                    ₹${itemTotal}
                </strong>


                <button
                    type="button"
                    class="cart-remove"
                    onclick="removeCartItem(${index})"
                >
                    Remove
                </button>

            </div>
        `;
    });


    // --------------------------------------------------------
    // CART SUMMARY
    // --------------------------------------------------------

    if (cartItemsCount) {

        cartItemsCount.textContent =
            `${totalQuantity} ${
                totalQuantity === 1 ? "item" : "items"
            }`;
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = `₹${subtotal}`;
    }


    // Delivery charge
    const delivery = 20;

    const finalTotal = subtotal + delivery;

    if (cartTotal) {
        cartTotal.textContent = `₹${finalTotal}`;
    }


    // --------------------------------------------------------
    // SHOW CART
    // --------------------------------------------------------

    cartModal.style.display = "flex";
}


// ============================================================
// CART QUANTITY CONTROLS
// ============================================================

function increaseCartItem(index) {

    if (!cart[index]) return;

    cart[index].qty++;

    updateCartCount();
    openCart();
}


function decreaseCartItem(index) {

    if (!cart[index]) return;

    if (cart[index].qty > 1) {

        cart[index].qty--;

    } else {

        cart.splice(index, 1);
    }

    updateCartCount();
    openCart();
}


function removeCartItem(index) {

    if (!cart[index]) return;

    cart.splice(index, 1);

    updateCartCount();
    openCart();
}


function closeCart() {

    const cartModal = document.getElementById("cart-modal");

    if (cartModal) {
        cartModal.style.display = "none";
    }
}


// ============================================================
// CHECKOUT
// ============================================================

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty.");
        return;
    }

    const summary = document.getElementById("checkoutSummary");
    const totalElement = document.getElementById("checkoutTotal");

    const cartModal = document.getElementById("cart-modal");
    const cartPopup = document.getElementById("cartPopup");
    const checkoutPopup = document.getElementById("checkoutPopup");

    if (!summary || !checkoutPopup) {

        console.error(
            "Checkout elements not found. Check your HTML IDs."
        );

        return;
    }

    summary.innerHTML = "";

    let subtotal = 0;

    cart.forEach(item => {

        const itemTotal = item.price * item.qty;

        subtotal += itemTotal;

        summary.innerHTML += `
            <div class="checkout-summary-item">

                <div class="checkout-summary-left">

                    <span class="checkout-item-name">
                        ${item.item}
                    </span>

                    <span class="checkout-item-qty">
                        × ${item.qty}
                    </span>

                </div>

                <span class="checkout-item-price">
                    ₹${itemTotal}
                </span>

            </div>
        `;
    });


    // Same ₹20 delivery charge used in cart
    const delivery = 20;
    const finalTotal = subtotal + delivery;


    if (totalElement) {
        totalElement.textContent = `₹${finalTotal}`;
    }


    // Close cart
    if (cartModal) {
        cartModal.style.display = "none";
    }

    if (cartPopup) {
        cartPopup.style.display = "none";
    }


    // Open checkout
    checkoutPopup.style.display = "flex";
}


function closeCheckout() {

    const checkoutPopup =
        document.getElementById("checkoutPopup");

    const cartPopup =
        document.getElementById("cartPopup");

    if (checkoutPopup) {
        checkoutPopup.style.display = "none";
    }

    if (cartPopup && cart.length > 0) {
        cartPopup.style.display = "flex";
    }
}


// ============================================================
// PLACE CART ORDER
// ============================================================

async function placeCartOrder() {

    const name =
        document.getElementById("checkoutName")?.value.trim();

    const phone =
        document.getElementById("checkoutPhone")?.value.trim();

    const note =
        document.getElementById("checkoutNote")?.value.trim();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

        alert("Please enter your name.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {

        alert("Enter a valid 10 digit phone number.");
        return;
    }

    if (cart.length === 0) {

        alert("Your cart is empty.");
        return;
    }


    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------

    const address = getDeliveryAddress();

    if (address === null) {
        return;
    }


    // --------------------------------------------------------
    // TOTAL + ITEMS
    // --------------------------------------------------------

    let subtotal = 0;

    const orderItems = cart.map(item => {

        subtotal += item.price * item.qty;

        return {
            item: item.item,
            price: item.price,
            qty: item.qty
        };
    });


    // Delivery charge
    const delivery = 20;

    const total = subtotal + delivery;


    // Add note if provided
    if (note !== "") {

        orderItems.push({
            note: note
        });
    }


    // --------------------------------------------------------
    // SUPABASE
    // --------------------------------------------------------

    const { error } = await supabaseClient
        .from("Orders")
        .insert([{

            customer_name: name,
            phone: phone,
            items: orderItems,
            total_amount: total,

            status: "Pending",

            address: address,

            latitude: userLatitude,
            longitude: userLongitude,

            payment_status: "Pending",

            payment_id: null
        }]);


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    if (error) {

        console.error("Supabase error:", error);

        alert(
            "Order could not be placed.\n\n" +
            error.message
        );

        return;
    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    alert("🎉 Order Placed Successfully!");


    // Empty cart
    cart = [];

    updateCartCount();


    // Reset checkout form
    const checkoutFields = [
        "checkoutName",
        "checkoutPhone",
        "checkoutHouse",
        "checkoutArea",
        "checkoutLandmark",
        "checkoutCity",
        "checkoutPincode",
        "checkoutNote"
    ];

    checkoutFields.forEach(id => {

        const field = document.getElementById(id);

        if (field) {
            field.value = "";
        }

    });


    // Reset location
    userLatitude = null;
    userLongitude = null;


    // Close checkout
    const checkoutPopup =
        document.getElementById("checkoutPopup");

    if (checkoutPopup) {
        checkoutPopup.style.display = "none";
    }
}


// ============================================================
// LOCATION
// ============================================================

let userLatitude = null;
let userLongitude = null;


function detectLocation() {

    const status =
        document.getElementById("locationStatus");


    if (!status) {
        return;
    }


    if (!navigator.geolocation) {

        status.textContent =
            "Location detection is not supported by your browser.";

        return;
    }


    status.textContent =
        "📍 Detecting your location...";


    navigator.geolocation.getCurrentPosition(

        function(position) {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;


            status.textContent =
                "✅ Location detected successfully.";
        },


        function(error) {

            console.error(
                "Location error:",
                error
            );

            status.textContent =
                "❌ Location could not be detected. Please enter your address manually.";
        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );
}


// ============================================================
// DELIVERY ADDRESS VALIDATION
// ============================================================

function getDeliveryAddress() {

    const house =
        document.getElementById("checkoutHouse")
            ?.value.trim();

    const area =
        document.getElementById("checkoutArea")
            ?.value.trim();

    const landmark =
        document.getElementById("checkoutLandmark")
            ?.value.trim();

    const city =
        document.getElementById("checkoutCity")
            ?.value.trim();

    const pincode =
        document.getElementById("checkoutPincode")
            ?.value.trim();


    if (!house) {

        alert(
            "Please enter your house / flat / building."
        );

        return null;
    }


    if (!area) {

        alert(
            "Please enter your street / area."
        );

        return null;
    }


    if (!city) {

        alert(
            "Please enter your city."
        );

        return null;
    }


    if (!/^[0-9]{6}$/.test(pincode)) {

        alert(
            "Please enter a valid 6 digit PIN code."
        );

        return null;
    }


    let address =
        house + ", " + area;


    if (landmark) {

        address +=
            ", " + landmark;
    }


    address +=
        ", " + city +
        " - " + pincode;


    return address;
}


// ============================================================
// INITIAL CART STATE
// ============================================================

updateCartCount();