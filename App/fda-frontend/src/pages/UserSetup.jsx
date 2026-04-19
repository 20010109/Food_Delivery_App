import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase.js";

import slide1 from "../assets/slide1.jpg";
import slide2 from "../assets/slide2.jpg";
import slide3 from "../assets/slide3.jpg";

function UserSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [areaCode, setAreaCode] = useState("+63");

  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postcode, setPostcode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3];

  const areaCodes = [
    { code: "+63", label: "PH (+63)" },
    { code: "+1", label: "US/CA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+81", label: "JP (+81)" },
  ];

  // FIXED slideshow (you had useState instead of useEffect)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const buildFullAddress = () => {
    return [
      houseNo,
      street,
      barangay,
      city,
      province,
      "Philippines",
      postcode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");

      const token = session.access_token;

      // PROFILE
      const profileRes = await fetch(
        "http://localhost:3000/api/users/profile",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            contact_number: contactNumber,
            role: "customer",
          }),
        }
      );

      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error);

      // ADDRESS
      const fullAddress = buildFullAddress();

      const addressRes = await fetch(
        "http://localhost:3000/api/addresses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address_line: fullAddress,
            latitude: null,
            longitude: null,
          }),
        }
      );

      const addressData = await addressRes.json();
      if (!addressRes.ok) throw new Error(addressData.error);

      navigate("/home");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

    <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-4xl shadow-lg overflow-hidden w-[90%] max-w-4xl h-[1000px] md:h-[600px]">

        {/* LEFT: FORM */}
        <div className="relative z-10 p-8 flex flex-col gap-4 justify-center bg-white">

          {/* HEADER */}
          <h2 className="text-3xl font-bold text-gray-800">
            Complete your profile
          </h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Fill in your details to continue
          </p>

          <form onSubmit={handleSetup} className="space-y-6">

            {/* PROFILE SECTION */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex mt-2 gap-3">
                {/* AREA CODE */}
                <select
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  className="border rounded-xl px-3 py-3 bg-white"
                >
                  {areaCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {/* NUMBER */}
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="border rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* ADDRESS SECTION */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <input placeholder="House No."
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />

                <input placeholder="Street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />

                <input placeholder="Barangay"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />

                <input placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />

                <input placeholder="Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />

                <input placeholder="Postal Code"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition"
            >
              {isLoading ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>

        {/* RIGHT: SOFT CAROUSEL */}
        <div className="relative overflow-hidden bg-gray-200">

          <div
            className="absolute top-0 left-0 h-full w-full flex transition-transform duration-700"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((s, i) => (
              <img
                key={i}
                src={s}
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </div>

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* branding text */}
          <div className="absolute bottom-8 left-8 text-white">
            <h3 className="text-xl font-bold">Fast. Simple. Reliable.</h3>
            <p className="text-sm text-gray-200">
              Your food delivery experience starts here.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserSetup;