# DigiVax API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user (parent or doctor). Admin registration is not allowed.
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "parent",
  "phone": "1234567890"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent",
    "phone": "1234567890"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: User already exists with this email
  - `403 Forbidden`: Admins cannot self-register
  - `500 Internal Server Error`: Server error
- **Notes:**
  - Admin users can only be created via the seed script (`seedAdmin.js`)
  - Doctors are created with `isApproved: false` and must be approved by an admin before they can log in
  - Parents are automatically approved (can log in immediately after registration)

### Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Login user and get JWT token. Doctors must be approved by an admin to log in.
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent",
    "phone": "1234567890"
  }
}
```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials (incorrect email or password)
  - `403 Forbidden`: Doctor not approved yet (only for doctors with `isApproved: false`)
  - `500 Internal Server Error`: Server error
- **Notes:**
  - **Admins:** Can log in regardless of `isApproved` field (admin accounts don't require approval)
  - **Doctors:** Must have `isApproved: true` to log in. Unapproved doctors receive a 403 error.
  - **Parents:** Can log in immediately after registration (automatically approved)
  - Default admin credentials (created via seed script):
    - Email: `admin@digivax.com`
    - Password: `Admin@123`

### Get Current User
- **Endpoint:** `GET /api/auth/me`
- **Description:** Get current authenticated user details
- **Headers:** Authorization: Bearer <token>
- **Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "parent",
  "phone": "1234567890",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Parent Endpoints

### Add Child
- **Endpoint:** `POST /api/parents/children`
- **Description:** Add a new child for the authenticated parent
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Body:**
```json
{
  "name": "Baby Doe",
  "dateOfBirth": "2024-01-01",
  "gender": "male"
}
```
- **Response:**
```json
{
  "message": "Child added successfully",
  "child": {
    "_id": "child_id",
    "name": "Baby Doe",
    "dateOfBirth": "2024-01-01T00:00:00.000Z",
    "gender": "male",
    "parentId": "parent_id"
  }
}
```

### Get All Children
- **Endpoint:** `GET /api/parents/children`
- **Description:** Get all children of the authenticated parent
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Response:**
```json
[
  {
    "_id": "child_id",
    "name": "Baby Doe",
    "dateOfBirth": "2024-01-01T00:00:00.000Z",
    "gender": "male",
    "parentId": "parent_id",
    "vaccinationHistory": []
  }
]
```

### Get Single Child
- **Endpoint:** `GET /api/parents/children/:childId`
- **Description:** Get details of a specific child
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **URL Parameters:**
  - `childId`: Child's unique ID
- **Response:**
```json
{
  "_id": "child_id",
  "name": "Baby Doe",
  "dateOfBirth": "2024-01-01T00:00:00.000Z",
  "gender": "male",
  "parentId": "parent_id",
  "vaccinationHistory": []
}
```

### Book Appointment
- **Endpoint:** `POST /api/parents/appointments`
- **Description:** Book a vaccination appointment
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Body:**
```json
{
  "childId": "child_id",
  "doctorId": "doctor_id",
  "hospitalId": "hospital_id",
  "vaccineId": "vaccine_id",
  "appointmentDate": "2025-02-01T10:00:00.000Z"
}
```
- **Response:**
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "appointment_id",
    "childId": "child_id",
    "doctorId": "doctor_id",
    "hospitalId": "hospital_id",
    "vaccineId": "vaccine_id",
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "status": "scheduled"
  }
}
```

### Get Parent Appointments
- **Endpoint:** `GET /api/parents/appointments`
- **Description:** Get all appointments for parent's children
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Response:**
```json
[
  {
    "_id": "appointment_id",
    "childId": { "_id": "child_id", "name": "Baby Doe" },
    "doctorId": { "_id": "doctor_id", "name": "Dr. Smith" },
    "hospitalId": { "_id": "hospital_id", "name": "City Hospital" },
    "vaccineId": { "_id": "vaccine_id", "name": "BCG" },
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "status": "scheduled"
  }
]
```

---

## Doctor Endpoints

### Get Doctor Appointments
- **Endpoint:** `GET /api/doctors/appointments`
- **Description:** Get all appointments for the authenticated doctor
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Response:**
```json
[
  {
    "_id": "appointment_id",
    "childId": { "_id": "child_id", "name": "Baby Doe" },
    "hospitalId": { "_id": "hospital_id", "name": "City Hospital" },
    "vaccineId": { "_id": "vaccine_id", "name": "BCG" },
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "status": "scheduled"
  }
]
```

### Get Appointments by Status
- **Endpoint:** `GET /api/doctors/appointments/status?status=scheduled`
- **Description:** Get appointments filtered by status
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Query Parameters:**
  - `status`: scheduled, completed, cancelled, missed
- **Response:** Same as GET /api/doctors/appointments

### Update Appointment Status
- **Endpoint:** `PUT /api/doctors/appointments/:appointmentId/status`
- **Description:** Update appointment status
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **URL Parameters:**
  - `appointmentId`: Appointment's unique ID
- **Body:**
```json
{
  "status": "completed",
  "notes": "Vaccination administered successfully"
}
```
- **Response:**
```json
{
  "message": "Appointment status updated successfully",
  "appointment": {
    "_id": "appointment_id",
    "status": "completed",
    "notes": "Vaccination administered successfully"
  }
}
```

### Send Reminder Email
- **Endpoint:** `POST /api/doctors/reminders`
- **Description:** Send a notification email reminder to the parent of a specific child for checkups or follow-up visits
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Body:**
```json
{
  "appointmentId": "appointment_id",
  "message": "Reminder: Please bring your child for the follow-up vaccination tomorrow."
}
```
- **Response:**
```json
{
  "message": "Reminder email sent successfully to parent",
  "recipient": {
    "parentName": "John Doe",
    "parentEmail": "john@example.com",
    "childName": "Baby Doe"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing appointmentId or message
  - `403 Forbidden`: Appointment does not belong to the authenticated doctor
  - `404 Not Found`: Appointment, child, or parent not found
  - `500 Internal Server Error`: Failed to send email

### Get Doctor Availability
- **Endpoint:** `GET /api/doctors/availability`
- **Description:** Get doctor's availability schedule. Can filter by hospital.
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Query Parameters:**
  - `hospitalId` (optional): Filter by specific hospital
- **Response:**
```json
[
  {
    "_id": "availability_id",
    "doctorId": "doctor_id",
    "hospitalId": {
      "_id": "hospital_id",
      "name": "City Hospital",
      "address": "123 Main Street"
    },
    "dayOfWeek": "monday",
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Set Doctor Availability
- **Endpoint:** `POST /api/doctors/availability`
- **Description:** Add or update doctor's availability for a specific hospital and day. If availability already exists for the same doctor, hospital, and day, it will be updated.
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Body:**
```json
{
  "hospitalId": "hospital_id",
  "dayOfWeek": "monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}
```
- **Response:**
```json
{
  "message": "Availability set successfully",
  "availability": {
    "_id": "availability_id",
    "doctorId": "doctor_id",
    "hospitalId": {
      "_id": "hospital_id",
      "name": "City Hospital",
      "address": "123 Main Street"
    },
    "dayOfWeek": "monday",
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing required fields, invalid time format, end time before start time, or duplicate availability (same doctor/hospital/day combination)
  - `401 Unauthorized`: doctorId missing from authentication token
  - `404 Not Found`: Hospital not found
  - `500 Internal Server Error`: Server error while setting availability
- **Notes:**
  - The `dayOfWeek` field is automatically converted to lowercase
  - Time format must be 24-hour format (HH:MM), e.g., "09:00", "17:00"
  - End time must be after start time
  - If availability already exists for the same doctor, hospital, and day, it will be updated with new times
  - The response always includes populated hospital details (name and address)

### Delete Doctor Availability
- **Endpoint:** `DELETE /api/doctors/availability/:availabilityId`
- **Description:** Delete a specific availability entry
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **URL Parameters:**
  - `availabilityId`: Availability entry's unique ID
- **Response:**
```json
{
  "message": "Availability deleted successfully"
}
```
- **Error Responses:**
  - `404 Not Found`: Availability not found or doesn't belong to doctor

### Upload Prescription
- **Endpoint:** `POST /api/doctors/prescriptions`
- **Description:** Upload a prescription file for an appointment
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Content-Type:** multipart/form-data
- **Body (form-data):**
  - `file`: Prescription file (PDF, images, or documents - max 10MB)
  - `appointmentId`: Appointment ID (required)
  - `description`: Optional description
- **Response:**
```json
{
  "message": "Prescription uploaded successfully",
  "prescription": {
    "_id": "prescription_id",
    "appointmentId": "appointment_id",
    "fileName": "prescription.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "description": "Follow-up prescription",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing file or appointmentId, invalid file type
  - `403 Forbidden`: Appointment does not belong to the authenticated doctor
  - `404 Not Found`: Appointment or child not found

### Get Prescriptions (Doctor)
- **Endpoint:** `GET /api/doctors/prescriptions`
- **Description:** Get all prescriptions uploaded by the doctor. Can filter by appointment.
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Query Parameters:**
  - `appointmentId` (optional): Filter by specific appointment
- **Response:**
```json
[
  {
    "_id": "prescription_id",
    "appointmentId": {
      "_id": "appointment_id",
      "appointmentDate": "2025-02-01T10:00:00.000Z",
      "status": "completed"
    },
    "childId": {
      "_id": "child_id",
      "name": "Baby Doe"
    },
    "parentId": {
      "_id": "parent_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "fileName": "prescription.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "description": "Follow-up prescription",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Download Prescription (Doctor)
- **Endpoint:** `GET /api/doctors/prescriptions/:prescriptionId/download`
- **Description:** Download a prescription file
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **URL Parameters:**
  - `prescriptionId`: Prescription's unique ID
- **Response:** File download (binary)
- **Error Responses:**
  - `403 Forbidden`: Prescription does not belong to the authenticated doctor
  - `404 Not Found`: Prescription or file not found

### Get Doctor Dashboard
- **Endpoint:** `GET /api/doctors/dashboard`
- **Description:** Get doctor analytics summary including appointment statistics and top vaccines
- **Headers:** Authorization: Bearer <token>
- **Role Required:** doctor
- **Response:**
```json
{
  "totalAppointments": 42,
  "completed": 30,
  "scheduled": 8,
  "missed": 2,
  "cancelled": 2,
  "topVaccines": [
    { "name": "BCG", "count": 12 },
    { "name": "DPT", "count": 10 },
    { "name": "Hepatitis B", "count": 8 }
  ]
}
```

---

## Parent Endpoints

### Add Child
- **Endpoint:** `POST /api/parents/children`
- **Description:** Add a new child for the authenticated parent
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Body:**
```json
{
  "name": "Baby Doe",
  "dateOfBirth": "2024-01-01",
  "gender": "male"
}
```
- **Response:**
```json
{
  "message": "Child added successfully",
  "child": {
    "_id": "child_id",
    "name": "Baby Doe",
    "dateOfBirth": "2024-01-01T00:00:00.000Z",
    "gender": "male",
    "parentId": "parent_id"
  }
}
```

### Get All Children
- **Endpoint:** `GET /api/parents/children`
- **Description:** Get all children of the authenticated parent
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Response:**
```json
[
  {
    "_id": "child_id",
    "name": "Baby Doe",
    "dateOfBirth": "2024-01-01T00:00:00.000Z",
    "gender": "male",
    "parentId": "parent_id",
    "vaccinationHistory": []
  }
]
```

### Get Single Child
- **Endpoint:** `GET /api/parents/children/:childId`
- **Description:** Get details of a specific child
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **URL Parameters:**
  - `childId`: Child's unique ID
- **Response:**
```json
{
  "_id": "child_id",
  "name": "Baby Doe",
  "dateOfBirth": "2024-01-01T00:00:00.000Z",
  "gender": "male",
  "parentId": "parent_id",
  "vaccinationHistory": []
}
```

### Book Appointment
- **Endpoint:** `POST /api/parents/appointments`
- **Description:** Book a vaccination appointment
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Body:**
```json
{
  "childId": "child_id",
  "doctorId": "doctor_id",
  "hospitalId": "hospital_id",
  "vaccineId": "vaccine_id",
  "appointmentDate": "2025-02-01T10:00:00.000Z"
}
```
- **Response:**
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "appointment_id",
    "childId": "child_id",
    "doctorId": "doctor_id",
    "hospitalId": "hospital_id",
    "vaccineId": "vaccine_id",
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "status": "scheduled"
  }
}
```

### Get Parent Appointments
- **Endpoint:** `GET /api/parents/appointments`
- **Description:** Get all appointments for parent's children
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Response:**
```json
[
  {
    "_id": "appointment_id",
    "childId": { "_id": "child_id", "name": "Baby Doe" },
    "doctorId": { "_id": "doctor_id", "name": "Dr. Smith" },
    "hospitalId": { "_id": "hospital_id", "name": "City Hospital" },
    "vaccineId": { "_id": "vaccine_id", "name": "BCG" },
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "status": "scheduled"
  }
]
```

### Get Prescriptions (Parent)
- **Endpoint:** `GET /api/parents/prescriptions`
- **Description:** Get all prescriptions for parent's children. Can filter by child or appointment.
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Query Parameters:**
  - `childId` (optional): Filter by specific child
  - `appointmentId` (optional): Filter by specific appointment
- **Response:**
```json
[
  {
    "_id": "prescription_id",
    "appointmentId": {
      "_id": "appointment_id",
      "appointmentDate": "2025-02-01T10:00:00.000Z",
      "status": "completed"
    },
    "childId": {
      "_id": "child_id",
      "name": "Baby Doe"
    },
    "doctorId": {
      "_id": "doctor_id",
      "name": "Dr. Smith",
      "email": "dr.smith@example.com"
    },
    "fileName": "prescription.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "description": "Follow-up prescription",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Download Prescription (Parent)
- **Endpoint:** `GET /api/parents/prescriptions/:prescriptionId/download`
- **Description:** Download a prescription file for parent's child
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **URL Parameters:**
  - `prescriptionId`: Prescription's unique ID
- **Response:** File download (binary)
- **Error Responses:**
  - `403 Forbidden`: Prescription does not belong to the authenticated parent
  - `404 Not Found`: Prescription or file not found

### Get Vaccine Recommendations
- **Endpoint:** `GET /api/parents/children/:childId/recommendations`
- **Description:** Get vaccine recommendations for a child based on their date of birth and vaccination schedule
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **URL Parameters:**
  - `childId`: Child's unique ID
- **Response:**
```json
{
  "child": "Baby Doe",
  "childId": "child_id",
  "dateOfBirth": "2024-01-01T00:00:00.000Z",
  "recommendations": [
    {
      "vaccineId": "vaccine_id",
      "vaccine": "BCG",
      "description": "Bacille Calmette-Guérin vaccine for tuberculosis",
      "recommendedAge": "At birth",
      "dosesRequired": 1,
      "status": "completed",
      "dueDate": null
    },
    {
      "vaccineId": "vaccine_id_2",
      "vaccine": "DPT",
      "description": "Diphtheria, Pertussis, Tetanus",
      "recommendedAge": "6 weeks",
      "dosesRequired": 3,
      "status": "upcoming",
      "dueDate": "2025-02-20"
    },
    {
      "vaccineId": "vaccine_id_3",
      "vaccine": "Hepatitis B",
      "description": "Hepatitis B vaccine",
      "recommendedAge": "2 months",
      "dosesRequired": 3,
      "status": "missed",
      "dueDate": "2024-03-01"
    }
  ]
}
```
- **Status Values:**
  - `"completed"`: Vaccine already administered
  - `"upcoming"`: Vaccine not yet due
  - `"missed"`: Vaccine past due date
- **Error Responses:**
  - `403 Forbidden`: Child does not belong to the authenticated parent
  - `404 Not Found`: Child not found

### Get Parent Dashboard
- **Endpoint:** `GET /api/parents/dashboard`
- **Description:** Get vaccination analytics summary for parent's children
- **Headers:** Authorization: Bearer <token>
- **Role Required:** parent
- **Response:**
```json
{
  "totalChildren": 2,
  "totalAppointments": 10,
  "completedAppointments": 6,
  "scheduledAppointments": 3,
  "missedAppointments": 1,
  "completedVaccines": 6,
  "upcomingVaccines": 3,
  "missedVaccines": 1
}
```

---

## Admin Endpoints

### Get Analytics
- **Endpoint:** `GET /api/admin/analytics`
- **Description:** Get system-wide analytics including user counts, appointment statistics, and vaccine counts
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Response:**
```json
{
  "totalUsers": 100,
  "totalDoctors": 10,
  "totalParents": 80,
  "totalChildren": 50,
  "totalHospitals": 5,
  "totalAppointments": 200,
  "totalVaccines": 15,
  "appointmentsByStatus": [
    { "_id": "scheduled", "count": 150 },
    { "_id": "completed", "count": 45 },
    { "_id": "cancelled", "count": 5 }
  ],
  "vaccinationStats": [
    { "_id": "completed", "count": 100 },
    { "_id": "pending", "count": 50 }
  ]
}
```
- **Response Fields:**
  - `totalUsers`: Total number of users in the system
  - `totalDoctors`: Total number of doctors
  - `totalParents`: Total number of parents
  - `totalChildren`: Total number of children registered
  - `totalHospitals`: Total number of hospitals
  - `totalAppointments`: Total number of appointments
  - `totalVaccines`: Total number of vaccines in the system (newly added)
  - `appointmentsByStatus`: Array of appointment counts grouped by status
  - `vaccinationStats`: Array of vaccination status counts from children's vaccination history
- **Error Responses:**
  - `500 Internal Server Error`: Server error while fetching analytics

### Get All Doctors
- **Endpoint:** `GET /api/admin/doctors`
- **Description:** Get list of all doctors
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Response:**
```json
[
  {
    "_id": "doctor_id",
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "role": "doctor",
    "phone": "1234567890",
    "isApproved": true
  }
]
```

### Get Pending Doctors
- **Endpoint:** `GET /api/admin/doctors/pending`
- **Description:** Get list of doctors pending approval
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Response:**
```json
[
  {
    "_id": "doctor_id",
    "name": "Dr. New",
    "email": "dr.new@example.com",
    "role": "doctor",
    "phone": "1234567890",
    "isApproved": false
  }
]
```

### Approve Doctor
- **Endpoint:** `PUT /api/admin/doctors/:doctorId/approve`
- **Description:** Approve a doctor registration
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **URL Parameters:**
  - `doctorId`: Doctor's unique ID
- **Response:**
```json
{
  "message": "Doctor approved successfully",
  "doctor": {
    "_id": "doctor_id",
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "isApproved": true
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: User is not a doctor
  - `404 Not Found`: Doctor not found

### Reject Doctor
- **Endpoint:** `PUT /api/admin/doctors/:doctorId/reject`
- **Description:** Reject a doctor registration (sets isApproved to false)
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **URL Parameters:**
  - `doctorId`: Doctor's unique ID
- **Response:**
```json
{
  "message": "Doctor rejected successfully",
  "doctor": {
    "_id": "doctor_id",
    "name": "Dr. Smith",
    "email": "dr.smith@example.com",
    "isApproved": false
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: User is not a doctor
  - `404 Not Found`: Doctor not found

### Create Hospital
- **Endpoint:** `POST /api/admin/hospitals`
- **Description:** Create a new hospital. The `contactInfo` field is optional.
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Body:**
```json
{
  "name": "City Hospital",
  "address": "123 Main Street, City",
  "contactInfo": "123-456-7890"
}
```
- **Response:**
```json
{
  "message": "Hospital created successfully",
  "hospital": {
    "_id": "hospital_id",
    "name": "City Hospital",
    "address": "123 Main Street, City",
    "contactInfo": "123-456-7890",
    "doctorIds": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Missing required fields (name or address) or hospital with the same name already exists
  - `500 Internal Server Error`: Server error while creating hospital
- **Notes:**
  - `name` and `address` are required fields
  - `contactInfo` is optional (defaults to empty string if not provided)
  - Hospital names must be unique (duplicate names are not allowed)
  - Example request without contactInfo:
    ```json
    {
      "name": "Apollo Hospital",
      "address": "MG Road, Delhi"
    }
    ```

### Get All Hospitals
- **Endpoint:** `GET /api/admin/hospitals`
- **Description:** Get list of all hospitals
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Response:**
```json
[
  {
    "_id": "hospital_id",
    "name": "City Hospital",
    "address": "123 Main Street, City",
    "contactInfo": "123-456-7890",
    "doctorIds": []
  }
]
```

### Create Vaccine
- **Endpoint:** `POST /api/admin/vaccines`
- **Description:** Create a new vaccine
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Body:**
```json
{
  "name": "BCG",
  "description": "Bacille Calmette-Guérin vaccine for tuberculosis",
  "recommendedAge": "At birth",
  "dosesRequired": 1
}
```
- **Response:**
```json
{
  "message": "Vaccine created successfully",
  "vaccine": {
    "_id": "vaccine_id",
    "name": "BCG",
    "description": "Bacille Calmette-Guérin vaccine for tuberculosis",
    "recommendedAge": "At birth",
    "dosesRequired": 1
  }
}
```

### Get All Vaccines
- **Endpoint:** `GET /api/admin/vaccines`
- **Description:** Get list of all vaccines
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Response:**
```json
[
  {
    "_id": "vaccine_id",
    "name": "BCG",
    "description": "Bacille Calmette-Guérin vaccine for tuberculosis",
    "recommendedAge": "At birth",
    "dosesRequired": 1
  }
]
```

### Get All Appointments
- **Endpoint:** `GET /api/admin/appointments`
- **Description:** Get all appointments in the system
- **Headers:** Authorization: Bearer <token>
- **Role Required:** admin
- **Response:**
```json
[
  {
    "_id": "appointment_id",
    "childId": { "_id": "child_id", "name": "Baby Doe" },
    "doctorId": { "_id": "doctor_id", "name": "Dr. Smith" },
    "hospitalId": { "_id": "hospital_id", "name": "City Hospital" },
    "vaccineId": { "_id": "vaccine_id", "name": "BCG" },
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "status": "scheduled"
  }
]
```

---

## Certificate Endpoints

### Verify Certificate
- **Endpoint:** `GET /api/certificates/verify/:appointmentId`
- **Description:** Verify a vaccination certificate via QR code scan. This is a public endpoint (no authentication required).
- **URL Parameters:**
  - `appointmentId`: Appointment's unique ID (from QR code)
- **Response:**
```json
{
  "verified": true,
  "message": "Certificate verified successfully",
  "appointment": {
    "_id": "appointment_id",
    "child": {
      "name": "Baby Doe",
      "dateOfBirth": "2024-01-01T00:00:00.000Z",
      "gender": "male"
    },
    "vaccine": {
      "name": "BCG",
      "description": "Bacille Calmette-Guérin vaccine for tuberculosis"
    },
    "doctor": {
      "name": "Dr. Smith",
      "email": "dr.smith@example.com"
    },
    "hospital": {
      "name": "City Hospital",
      "address": "123 Main Street, City"
    },
    "appointmentDate": "2025-02-01T10:00:00.000Z",
    "completedAt": "2025-02-01T10:30:00.000Z",
    "certificateUrl": "/uploads/certificates/BCG_BabyDoe_20250201.pdf"
  }
}
```
- **Error Responses:**
  - `400 Bad Request`: Appointment has not been completed yet
  - `404 Not Found`: Certificate not found or invalid

**Note:** When a doctor marks an appointment as "completed", a PDF certificate is automatically generated with a QR code. The QR code links to this verification endpoint.

---

## Background Jobs

### Automated Reminder Scheduler
- **Description:** Automatically sends email reminders to parents 24 hours before scheduled appointments
- **Schedule:** Runs every 15 minutes
- **Logic:**
  - Finds all appointments with:
    - `status: "scheduled"`
    - `reminderSent: false`
    - `appointmentDate` within 24 hours (± 15 minutes)
  - Sends reminder email via Nodemailer
  - Marks `reminderSent: true` in appointment record
- **Email Content:** Includes child name, vaccine, appointment date/time, hospital, and doctor details
- **Initialization:** Automatically started when server starts (imported in `server.js`)

---

## Model Changes

### Appointment Model
The Appointment model has been extended with the following fields:
- **reminderSent** (Boolean, default: false): Tracks whether a reminder email has been sent for this appointment
- **certificateUrl** (String, default: null): URL path to the generated PDF certificate (automatically set when appointment is marked as "completed")

---

## Status Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

---

## Role-Based Access

- **Parent:** Can manage their children, appointments, and view/download prescriptions
- **Doctor:** Can view and update appointments, manage availability, send reminders, and upload/download prescriptions
- **Admin:** Can access all endpoints, manage system entities, and approve/reject doctor registrations

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- Gender values: "male", "female", "other"
- Appointment status: "scheduled", "completed", "cancelled", "missed"
- Vaccination status: "pending", "completed", "missed"
- User roles: "parent", "doctor", "admin"
- **Doctor Approval:** New doctors are created with `isApproved: false` by default. Only admins can approve/reject doctors. Unapproved doctors cannot log in and will receive a 403 error.
- **Admin Login:** Admin users can log in regardless of the `isApproved` field. Admin accounts are created via the seed script and don't require approval.
- **Hospital Creation:** The `contactInfo` field is optional when creating hospitals. If not provided, it defaults to an empty string. Hospital names must be unique.
- **Doctor Availability:** When setting availability, if an entry already exists for the same doctor, hospital, and day combination, it will be updated instead of creating a duplicate. The system uses a unique compound index to prevent duplicates.
- **Availability Days:** Use lowercase day names: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
- **Time Format:** Use 24-hour format (HH:MM) for availability times (e.g., "09:00", "17:00")
- **File Uploads:** Prescription files must be PDF, images (JPEG, PNG, GIF), or documents (DOC, DOCX). Maximum file size is 10MB.
- **Prescription Access:** Doctors can upload and view all their prescriptions. Parents can view and download prescriptions for their children only.
- **Vaccine Recommendations:** The recommendation engine calculates vaccine status based on child's date of birth and vaccine's `recommendedAge` field. Supports formats like "At birth", "6 weeks", "2 months", "1 year", etc.
- **Certificates:** PDF certificates are automatically generated when a doctor marks an appointment as "completed". Certificates include QR codes for verification and are stored in `/uploads/certificates/`.
- **Reminder System:** Automated reminders are sent 24 hours before appointments. The system runs every 15 minutes and marks reminders as sent to prevent duplicates.
- **Dashboard Analytics:** Dashboards provide aggregated statistics for doctors (appointment counts, top vaccines) and parents (children stats, vaccine completion status).
