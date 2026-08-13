import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAddress, deleteAddress, selectAddress } from "@/redux";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function AddressManagement() {
  const dispatch = useDispatch();
  const { addresses, selectedAddress, user } = useSelector(state => state.user);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    pinCode: "",
    phone: ""
  });

  const handleAddAddress = async () => {
    if (formData.label && formData.street && formData.city && formData.pinCode && user) {
      const newAddress = {
        id: Date.now(),
        ...formData
      };

      const updatedAddresses = [...addresses, newAddress];

      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          addresses: updatedAddresses
        });

        dispatch(addAddress(newAddress));

        setFormData({ label: "", street: "", city: "", pinCode: "", phone: "" });
        setShowForm(false);
      } catch (error) {
        console.error("Error saving address to Firestore:", error);
      }
    }
  };

  const handleDeleteAddress = async (address) => {
    if (!user) return;
    const updatedAddresses = addresses.filter(addr => addr.id !== address.id);

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        addresses: updatedAddresses
      });

      dispatch(deleteAddress(address.id));
    } catch (error) {
      console.error("Error deleting address from Firestore:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">My Addresses</h3>

      <div className="mb-6">
        {addresses.length > 0 ? (
          addresses.map(address => (
            <div
              key={address.id}
              onClick={() => dispatch(selectAddress(address))}
              className={`p-4 mb-3 border-2 rounded-lg cursor-pointer transition ${
                selectedAddress?.id === address.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{address.label}</p>
                  <p className="text-sm text-gray-600">
                    {address.street}, {address.city} - {address.pinCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address);
                  }}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center py-4">No addresses added yet</p>
        )}
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
        >
          + Add New Address
        </button>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-4 text-gray-800">Add Address</h4>
          <input
            type="text"
            placeholder="Label (e.g., Home, Office)"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Street Address"
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Pin Code"
              value={formData.pinCode}
              onChange={(e) =>
                setFormData({ ...formData, pinCode: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              onClick={handleAddAddress}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
