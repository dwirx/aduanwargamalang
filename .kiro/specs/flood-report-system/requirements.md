# Requirements Document

## Introduction

Sistem Pelaporan Banjir Real-time untuk Kota Malang adalah aplikasi web yang memungkinkan warga melaporkan kondisi banjir secara langsung dengan validasi bukti digital. Sistem ini fokus pada verifikasi real-time untuk menghindari hoax dan informasi kadaluwarsa. Fitur utama meliputi peta interaktif dengan color-coding berdasarkan ketinggian air, agregasi bukti dari media sosial, dan sistem "kedaluwarsa" laporan untuk menjaga akurasi informasi.

## Glossary

- **Flood Report System**: Sistem pelaporan banjir berbasis web untuk warga Kota Malang
- **Report**: Laporan banjir yang dibuat oleh user berisi lokasi, tingkat ketinggian air, dan bukti digital
- **Water Level**: Tingkat ketinggian air banjir (Siaga/Kuning, Bahaya/Oranye, Evakuasi/Merah)
- **Social Proof**: Bukti digital berupa link media sosial (Instagram, Twitter/X, TikTok)
- **Upvote/Confirmation**: Aksi user untuk mengkonfirmasi bahwa laporan masih valid
- **Dry Route**: Jalur alternatif yang dilaporkan kering/aman oleh user
- **Report Expiry**: Masa berlaku laporan (default 3 jam) sebelum memudar di peta
- **Clerk**: Layanan autentikasi pihak ketiga untuk login user
- **Supabase**: Backend-as-a-Service untuk database real-time

## Requirements

### Requirement 1: User Authentication

**User Story:** As a warga Malang, I want to login dengan mudah, so that I can submit flood reports dengan identitas terverifikasi.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the Flood Report System SHALL display sign-in and sign-up options using Clerk authentication
2. WHEN a user successfully authenticates THEN the Flood Report System SHALL redirect the user to the main dashboard with access to reporting features
3. WHEN a user is not authenticated THEN the Flood Report System SHALL allow viewing the map but restrict report submission
4. WHEN a user clicks sign out THEN the Flood Report System SHALL terminate the session and return to guest view

### Requirement 2: Interactive Map Display

**User Story:** As a warga Malang, I want to see an interactive map with flood reports, so that I can understand current flood conditions in my area.

#### Acceptance Criteria

1. WHEN the map loads THEN the Flood Report System SHALL display all active flood reports as markers with color-coding based on water level
2. WHEN displaying water level indicators THEN the Flood Report System SHALL use yellow (Siaga: ankle-level), orange (Bahaya: knee/waist-level), and red (Evakuasi: chest/roof-level)
3. WHEN a user clicks on a flood marker THEN the Flood Report System SHALL display a popup with report details including photo, social media embed, timestamp, and confirmation count
4. WHEN a report exceeds 3 hours without confirmation THEN the Flood Report System SHALL fade the marker opacity to indicate staleness
5. WHEN the map initializes THEN the Flood Report System SHALL center on Malang city coordinates with appropriate zoom level

### Requirement 3: Flood Report Submission

**User Story:** As a warga Malang, I want to submit flood reports quickly, so that I can help others know about flooding in my area.

#### Acceptance Criteria

1. WHEN an authenticated user clicks the "LAPOR" button THEN the Flood Report System SHALL open a report submission form
2. WHEN submitting a report THEN the Flood Report System SHALL require the user to drop a pin on the map for exact location
3. WHEN submitting a report THEN the Flood Report System SHALL require the user to select water level (Siaga, Bahaya, or Evakuasi)
4. WHEN submitting a report THEN the Flood Report System SHALL allow the user to upload a photo OR paste a social media link as proof
5. WHEN a valid report is submitted THEN the Flood Report System SHALL persist the report to Supabase database immediately
6. WHEN a report is successfully saved THEN the Flood Report System SHALL display the new marker on the map in real-time for all users
7. WHEN serializing report data for storage THEN the Flood Report System SHALL encode reports using JSON format
8. WHEN deserializing report data from storage THEN the Flood Report System SHALL parse JSON and reconstruct the report object

### Requirement 4: Social Media Integration

**User Story:** As a warga Malang, I want to paste social media links as proof, so that I can report quickly without uploading large video files.

#### Acceptance Criteria

1. WHEN a user pastes an Instagram link THEN the Flood Report System SHALL validate the URL format and display an embedded preview
2. WHEN a user pastes a Twitter/X link THEN the Flood Report System SHALL validate the URL format and display an embedded preview
3. WHEN a user pastes a TikTok link THEN the Flood Report System SHALL validate the URL format and display an embedded preview
4. WHEN an invalid social media URL is provided THEN the Flood Report System SHALL display an error message and prevent submission
5. WHEN parsing social media URLs THEN the Flood Report System SHALL extract platform type and content ID from the URL

### Requirement 5: Report Confirmation System

**User Story:** As a warga Malang, I want to confirm existing reports, so that accurate information stays visible on the map.

#### Acceptance Criteria

1. WHEN an authenticated user views a report popup THEN the Flood Report System SHALL display a "Masih Banjir" confirmation button
2. WHEN a user clicks the confirmation button THEN the Flood Report System SHALL increment the confirmation count and reset the expiry timer
3. WHEN a report receives confirmation THEN the Flood Report System SHALL restore full marker opacity
4. WHEN a user has already confirmed a report THEN the Flood Report System SHALL prevent duplicate confirmations from the same user within 1 hour

### Requirement 6: Dry Route Reporting

**User Story:** As a warga Malang, I want to report dry/safe routes, so that others can find alternative paths during flooding.

#### Acceptance Criteria

1. WHEN an authenticated user clicks "Lapor Jalan Kering" THEN the Flood Report System SHALL allow marking a route segment as passable
2. WHEN displaying dry routes THEN the Flood Report System SHALL show green markers or lines on the map
3. WHEN a dry route report is submitted THEN the Flood Report System SHALL apply the same 3-hour expiry rule as flood reports

### Requirement 7: Quick Filters

**User Story:** As a warga Malang, I want to filter map markers, so that I can quickly find relevant information for my situation.

#### Acceptance Criteria

1. WHEN a user selects "Bisa Lewat Mobil" filter THEN the Flood Report System SHALL display only reports with Siaga (yellow) water level
2. WHEN a user selects "Lumpuh Total" filter THEN the Flood Report System SHALL display only reports with Evakuasi (red) water level
3. WHEN a user selects "Jalan Kering" filter THEN the Flood Report System SHALL display only dry route reports
4. WHEN no filter is selected THEN the Flood Report System SHALL display all active reports

### Requirement 8: Real-time Updates

**User Story:** As a warga Malang, I want to see new reports instantly, so that I have the most current flood information.

#### Acceptance Criteria

1. WHEN a new report is submitted by any user THEN the Flood Report System SHALL display the marker on all connected clients within 5 seconds
2. WHEN a report is confirmed by any user THEN the Flood Report System SHALL update the marker appearance on all connected clients
3. WHEN a report expires THEN the Flood Report System SHALL update the marker opacity on all connected clients

### Requirement 9: Mobile-First Dark Mode UI

**User Story:** As a warga Malang using my phone during emergency, I want a simple dark interface, so that I can use the app easily and save battery.

#### Acceptance Criteria

1. WHEN the application loads THEN the Flood Report System SHALL display in dark mode by default
2. WHEN displaying the "LAPOR" button THEN the Flood Report System SHALL render it as a large, thumb-friendly button at the bottom of the screen
3. WHEN displaying UI elements THEN the Flood Report System SHALL use high contrast neobrutalist design for visibility
4. WHEN the viewport is mobile-sized THEN the Flood Report System SHALL prioritize map visibility with minimal UI overlay
