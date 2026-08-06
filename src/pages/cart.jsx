import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "@/redux";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const cartItems = useSelector((state) => state.cart || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function to get correct image URL for cart items
  const getItemImage = (item) => {
    return item.img;
  };

  const increaseQty = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      dispatch(updateQuantity({ id, qty: item.qty + 1 }));
    }
  };

  const decreaseQty = (id) => {
    const item = cartItems.find((item) => item.id === id);
    if (item && item.qty > 1) {
      dispatch(updateQuantity({ id, qty: item.qty - 1 }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const removeItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 to-yellow-50 p-4 md:p-6">
        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-center text-orange-600 mb-6 md:mb-10">
          🛒 Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-12">
            Your cart is empty 😢
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* LEFT: Cart Items */}
          <div className="md:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start gap-3 bg-white p-4 md:p-6 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                {/* Image */}
                <div className="w-full sm:w-28 md:w-32 h-32 sm:h-28 md:h-32 bg-linear-to-br from-orange-100 to-yellow-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={getItemImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-gray-800">{item.name}</h2>

                  {item.restaurantName && (
                    <p className="text-sm text-orange-600 font-semibold mt-1">
                      🏪 From: {item.restaurantName}
                    </p>
                  )}

                  <span
                    className={`text-sm inline-block mt-1 ${
                      item.veg ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.veg ? "Veg 🌱" : "Non-Veg 🍗"}
                  </span>

                  <p className="text-sm text-gray-600 mt-2">
                    ₹{item.price} × {item.qty} = <span className="font-bold text-orange-600">₹{item.price * item.qty}</span>
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => decreaseQty(item.id)}
                      className="bg-orange-100 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-200 font-bold min-w-40px"
                    >
                      −
                    </button>

                    <span className="font-bold px-4 text-lg">{item.qty}</span>

                    <button
                      type="button"
                      onClick={() => increaseQty(item.id)}
                      className="bg-orange-100 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-200 font-bold min-w-10"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="ml-auto bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 font-semibold w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Checkout Box */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg h-fit sticky top-4 md:top-6 order-first md:order-last">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Item List */}
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span className="font-semibold text-orange-600">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <hr className="my-3" />

            {/* Total */}
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Total</span>
              <span className="text-orange-600">₹{totalPrice}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 
              hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl 
              text-lg font-semibold transition-all hover:scale-105"
            >
              Proceed to Checkout 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}