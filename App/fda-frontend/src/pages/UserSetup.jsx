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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (!session) throw new Error("Not authenticated");
  
      const token = session.access_token;
  
      const res = await fetch("http://localhost:3000/api/users/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // PROFILE
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          contact_number: `${areaCode}${contactNumber.trim()}`,
          role: "customer",
  
          // ADDRESS
          house_no: houseNo.trim(),
          street: street.trim(),
          barangay: barangay.trim(),
          city: city.trim(),
          province: province.trim(),
          postal_code: postcode.trim(),
          country: "Philippines",
          is_default: true,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data?.error || "Setup failed");
      }
  
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

        {/* LEFT */}
        <div className="relative z-10 p-8 flex flex-col gap-4 justify-center bg-white">
          <h2 className="text-3xl font-bold text-gray-800">
            Complete your profile
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Fill in your details to continue
          </p>

          <form onSubmit={handleSetup} className="space-y-6">

            {/* PERSONAL */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  required
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <div className="flex mt-2 gap-3">
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

                <input
                  required
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="border rounded-xl px-4 py-3 w-full"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="House No." value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="border rounded-xl px-4 py-3" />

                <input placeholder="Street" value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="border rounded-xl px-4 py-3" />

                <input placeholder="Barangay" value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="border rounded-xl px-4 py-3" />

                <input placeholder="City" value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border rounded-xl px-4 py-3" />

                <input placeholder="Province" value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="border rounded-xl px-4 py-3" />

                <input placeholder="Postal Code" value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="border rounded-xl px-4 py-3" />
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl"
            >
              {isLoading ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="relative overflow-hidden bg-gray-200">
          <div
            className="absolute top-0 left-0 h-full w-full flex transition-transform duration-700"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((s, i) => (
              <img key={i} src={s} className="w-full h-full object-cover" />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

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