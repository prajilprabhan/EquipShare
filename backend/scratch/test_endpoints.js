const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper delay function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("==========================================");
  console.log("🚀 Starting EquipShare Backend Integration Tests");
  console.log(`📡 Targeting API at ${BASE_URL}`);
  console.log("==========================================\n");

  const timestamp = Date.now();
  const testStudentEmail = `student_${timestamp}@college.edu`;
  const testAdminEmail = `admin_${timestamp}@college.edu`;
  const testHodEmail = `hod_${timestamp}@college.edu`;
  const testLabasistEmail = `labasist_${timestamp}@college.edu`;
  const password = "password123";

  let studentToken, adminToken, hodToken, labasistToken;
  let studentId, adminId, hodId, labasistId;
  let equipmentId, bookingId;

  try {
    // ----------------------------------------------------
    // 1. Sign Up test users with different roles
    // ----------------------------------------------------
    console.log("⏳ Step 1: Registering users with different roles...");
    
    // Register Student
    const resStudentSignup = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Student",
        studentId: `STU_${timestamp}`,
        email: testStudentEmail,
        phone: "1234567890",
        department: "computer_science",
        semester: "5",
        password,
        role: "student"
      })
    });
    const dataStudentSignup = await resStudentSignup.json();
    if (!dataStudentSignup.success) throw new Error("Student signup failed: " + JSON.stringify(dataStudentSignup));
    studentId = dataStudentSignup.user._id;
    console.log("✅ Student registered (Pending verification).");

    // Register HOD
    const resHodSignup = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test HOD",
        studentId: `HOD_${timestamp}`,
        email: testHodEmail,
        phone: "1234567891",
        department: "computer_science",
        semester: "N/A",
        password,
        role: "hod"
      })
    });
    const dataHodSignup = await resHodSignup.json();
    if (!dataHodSignup.success) throw new Error("HOD signup failed: " + JSON.stringify(dataHodSignup));
    hodId = dataHodSignup.user._id;
    hodToken = dataHodSignup.token;
    console.log("✅ HOD registered.");

    // Register Lab Assistant
    const resLabasistSignup = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Lab Assist",
        studentId: `LAB_${timestamp}`,
        email: testLabasistEmail,
        phone: "1234567892",
        department: "computer_science",
        semester: "N/A",
        password,
        role: "labasist"
      })
    });
    const dataLabasistSignup = await resLabasistSignup.json();
    if (!dataLabasistSignup.success) throw new Error("Lab assistant signup failed: " + JSON.stringify(dataLabasistSignup));
    labasistId = dataLabasistSignup.user._id;
    labasistToken = dataLabasistSignup.token;
    console.log("✅ Lab Assistant registered.");

    // Register Admin
    const resAdminSignup = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Admin",
        studentId: `ADM_${timestamp}`,
        email: testAdminEmail,
        phone: "1234567893",
        department: "admin",
        semester: "N/A",
        password,
        role: "admin"
      })
    });
    const dataAdminSignup = await resAdminSignup.json();
    if (!dataAdminSignup.success) throw new Error("Admin signup failed: " + JSON.stringify(dataAdminSignup));
    adminId = dataAdminSignup.user._id;
    adminToken = dataAdminSignup.token;
    console.log("✅ Admin registered.");

    // ----------------------------------------------------
    // 2. Try logging in as Student (should fail because verificationStatus is pending)
    // ----------------------------------------------------
    console.log("\n⏳ Step 2: Verifying pending student login restriction...");
    const resStudentLoginFail = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testStudentEmail, password })
    });
    const dataStudentLoginFail = await resStudentLoginFail.json();
    if (resStudentLoginFail.status === 403) {
      console.log("✅ Student login correctly forbidden (pending status). Message: " + dataStudentLoginFail.message);
    } else {
      throw new Error("Student login should have been forbidden, but status was: " + resStudentLoginFail.status);
    }

    // ----------------------------------------------------
    // 3. Approve student registration using HOD account
    // ----------------------------------------------------
    console.log("\n⏳ Step 3: HOD approving student registration...");
    const resApprove = await fetch(`${BASE_URL}/api/hod/students/${studentId}/verify`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hodToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    const dataApprove = await resApprove.json();
    if (!dataApprove.success) throw new Error("HOD approval failed: " + JSON.stringify(dataApprove));
    console.log("✅ Student approved by HOD successfully.");

    // ----------------------------------------------------
    // 4. Log in as Student now (should succeed)
    // ----------------------------------------------------
    console.log("\n⏳ Step 4: Logging in as approved Student...");
    const resStudentLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testStudentEmail, password })
    });
    const dataStudentLogin = await resStudentLogin.json();
    if (!dataStudentLogin.success) throw new Error("Student login failed: " + JSON.stringify(dataStudentLogin));
    studentToken = dataStudentLogin.token;
    console.log("✅ Student logged in successfully.");

    // ----------------------------------------------------
    // 5. Test check-user / check-admin endpoints
    // ----------------------------------------------------
    console.log("\n⏳ Step 5: Testing check role verification endpoints...");
    
    // Check-user with Student Token
    const resCheckUser = await fetch(`${BASE_URL}/api/auth/check-user`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const dataCheckUser = await resCheckUser.json();
    if (!dataCheckUser.success || dataCheckUser.user.role !== "student") {
      throw new Error("check-user failed for Student token: " + JSON.stringify(dataCheckUser));
    }
    console.log("✅ check-user endpoint valid for student.");

    // Check-admin with Student Token (should fail)
    const resCheckAdminFail = await fetch(`${BASE_URL}/api/auth/check-admin`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    if (resCheckAdminFail.status === 403) {
      console.log("✅ check-admin correctly rejected Student token.");
    } else {
      throw new Error("check-admin should have failed for Student token but returned: " + resCheckAdminFail.status);
    }

    // Check-admin with Admin Token (should succeed)
    const resCheckAdminSuccess = await fetch(`${BASE_URL}/api/auth/check-admin`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const dataCheckAdminSuccess = await resCheckAdminSuccess.json();
    if (!dataCheckAdminSuccess.success || dataCheckAdminSuccess.user.role !== "admin") {
      throw new Error("check-admin failed for Admin token: " + JSON.stringify(dataCheckAdminSuccess));
    }
    console.log("✅ check-admin endpoint valid for admin.");

    // ----------------------------------------------------
    // 6. Lab Assistant adds Equipment
    // ----------------------------------------------------
    console.log("\n⏳ Step 6: Lab Assistant adding new equipment...");
    const resAddEquip = await fetch(`${BASE_URL}/api/labasist/equipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${labasistToken}`
      },
      body: JSON.stringify({
        name: `Oscilloscope Model X-${timestamp}`,
        description: "100MHz Digital Oscilloscope for signals testing",
        category: "electronics",
        department: "computer_science",
        modelNumber: "OSC-100X",
        serialNumber: `SN-${timestamp}`,
        totalQuantity: 5,
        location: "Lab Room 402"
      })
    });
    const dataAddEquip = await resAddEquip.json();
    if (!dataAddEquip.success) throw new Error("Equipment creation failed: " + JSON.stringify(dataAddEquip));
    equipmentId = dataAddEquip.equipment._id;
    console.log("✅ Equipment added successfully. ID: " + equipmentId);

    // ----------------------------------------------------
    // 7. Student browses Equipment
    // ----------------------------------------------------
    console.log("\n⏳ Step 7: Student browsing available equipment...");
    const resBrowse = await fetch(`${BASE_URL}/api/user/equipments?department=computer_science`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const dataBrowse = await resBrowse.json();
    if (!dataBrowse.success || dataBrowse.equipments.length === 0) {
      throw new Error("Student browsing failed: " + JSON.stringify(dataBrowse));
    }
    console.log(`✅ Student saw ${dataBrowse.count} equipment(s).`);

    // ----------------------------------------------------
    // 8. Student creates Booking Request
    // ----------------------------------------------------
    console.log("\n⏳ Step 8: Student creating booking request...");
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 3 days from now

    const resBook = await fetch(`${BASE_URL}/api/user/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        equipmentId,
        quantity: 2,
        purpose: "Semester project circuit evaluation",
        startDate,
        endDate
      })
    });
    const dataBook = await resBook.json();
    if (!dataBook.success) throw new Error("Booking creation failed: " + JSON.stringify(dataBook));
    bookingId = dataBook.booking._id;
    console.log("✅ Booking request submitted successfully. ID: " + bookingId);

    // ----------------------------------------------------
    // 9. Lab Assistant approves Booking
    // ----------------------------------------------------
    console.log("\n⏳ Step 9: Lab Assistant approving booking request...");
    const resApproveBooking = await fetch(`${BASE_URL}/api/labasist/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${labasistToken}`
      },
      body: JSON.stringify({ status: "approved" })
    });
    const dataApproveBooking = await resApproveBooking.json();
    if (!dataApproveBooking.success) throw new Error("Booking approval failed: " + JSON.stringify(dataApproveBooking));
    console.log("✅ Booking approved by Lab Assistant. Equipment quantity updated.");

    // ----------------------------------------------------
    // 10. Verify equipment available quantity is decremented
    // ----------------------------------------------------
    console.log("\n⏳ Step 10: Verifying available equipment quantity has decremented...");
    const resBrowseAfter = await fetch(`${BASE_URL}/api/user/equipments?department=computer_science`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const dataBrowseAfter = await resBrowseAfter.json();
    const updatedEquip = dataBrowseAfter.equipments.find(e => e._id === equipmentId);
    if (updatedEquip && updatedEquip.availableQuantity === 3) {
      console.log("✅ Equipment available quantity correctly decremented to 3 (5 total - 2 booked).");
    } else {
      throw new Error(`Inventory verification failed. Expected available quantity 3, got: ${updatedEquip ? updatedEquip.availableQuantity : "not found"}`);
    }

    // ----------------------------------------------------
    // 11. Profile retrieval and update
    // ----------------------------------------------------
    console.log("\n⏳ Step 11: Retrieving and updating profile...");
    const resProfile = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentToken}` }
    });
    const dataProfile = await resProfile.json();
    if (!dataProfile.success || dataProfile.user.name !== "Test Student") {
      throw new Error("Profile retrieval failed: " + JSON.stringify(dataProfile));
    }
    console.log("✅ Profile retrieved correctly.");

    const resProfileUpdate = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
      body: JSON.stringify({ name: "Updated Test Student Name" })
    });
    const dataProfileUpdate = await resProfileUpdate.json();
    if (!dataProfileUpdate.success || dataProfileUpdate.user.name !== "Updated Test Student Name") {
      throw new Error("Profile update failed: " + JSON.stringify(dataProfileUpdate));
    }
    console.log("✅ Profile updated successfully.");

    // ----------------------------------------------------
    // 12. Admin retrieves stats and lists users
    // ----------------------------------------------------
    console.log("\n⏳ Step 12: Admin fetching system stats...");
    const resStats = await fetch(`${BASE_URL}/api/admin/stats`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const dataStats = await resStats.json();
    if (!dataStats.success || dataStats.stats.totalUsers === 0) {
      throw new Error("Stats retrieval failed: " + JSON.stringify(dataStats));
    }
    console.log(`✅ Admin retrieved stats. Total system users logged: ${dataStats.stats.totalUsers}`);

    // ----------------------------------------------------
    // 13. Logout endpoint
    // ----------------------------------------------------
    console.log("\n⏳ Step 13: Testing logout endpoint...");
    const resLogout = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST"
    });
    const dataLogout = await resLogout.json();
    if (!dataLogout.success) {
      throw new Error("Logout failed: " + JSON.stringify(dataLogout));
    }
    console.log("✅ Logout successful.");

    console.log("\n==========================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("==========================================");

  } catch (error) {
    console.error("\n❌ TEST FAILURE:");
    console.error(error.message || error);
    console.log("==========================================");
    process.exit(1);
  }
}

runTests();
