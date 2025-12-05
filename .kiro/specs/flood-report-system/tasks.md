# Implementation Plan

## 1. Project Setup and Dependencies

- [ ] 1.1 Install required dependencies
  - Install @clerk/nextjs for authentication
  - Install @supabase/supabase-js for database
  - Install leaflet and react-leaflet for maps
  - Install fast-check for property-based testing
  - Install @testing-library/react for component tests
  - _Requirements: 1.1, 2.1, 8.1_

- [ ] 1.2 Configure environment variables
  - Create .env.local with Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
  - Add Supabase keys (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - _Requirements: 1.1, 3.5_

- [ ] 1.3 Set up Clerk middleware
  - Create middleware.ts with clerkMiddleware()
  - Configure route matchers for protected routes
  - _Requirements: 1.1, 1.2, 1.3_

## 2. Core Types and Utilities

- [ ] 2.1 Create TypeScript types
  - Define WaterLevel, ReportType, SocialPlatform types
  - Define FloodReport, ReportConfirmation, ReportFormData interfaces
  - Define SocialUrlParseResult, FilterType types
  - Create lib/types.ts
  - _Requirements: 2.2, 3.2, 3.3, 4.5_

- [ ] 2.2 Implement utility functions
  - Implement getMarkerColor(waterLevel) - returns yellow/orange/red
  - Implement getMarkerOpacity(report) - returns 1.0 or 0.5 based on expiry
  - Implement isReportExpired(report) - checks expires_at vs current time
  - Implement filterReports(reports, filter) - filters by type/level
  - Implement serializeReport/deserializeReport for JSON round-trip
  - Create lib/utils.ts
  - _Requirements: 2.2, 2.4, 3.7, 3.8, 7.1, 7.2, 7.3, 7.4_

- [ ]* 2.3 Write property test for serialization round-trip
  - **Property 1: Report Serialization Round-Trip**
  - **Validates: Requirements 3.7, 3.8**

- [ ]* 2.4 Write property test for water level color mapping
  - **Property 2: Water Level Color Mapping**
  - **Validates: Requirements 2.2**

- [ ]* 2.5 Write property test for report expiry detection
  - **Property 3: Report Expiry Detection**
  - **Validates: Requirements 2.4**

- [ ]* 2.6 Write property test for filter correctness
  - **Property 6: Filter Correctness**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [ ]* 2.7 Write property test for marker opacity
  - **Property 9: Marker Opacity Based on Freshness**
  - **Validates: Requirements 2.4, 5.3**

## 3. Validation Functions

- [ ] 3.1 Implement social URL validators
  - Implement isInstagramUrl(url) - regex for instagram.com/p/, /reel/, /stories/
  - Implement isTwitterUrl(url) - regex for twitter.com/x.com status URLs
  - Implement isTikTokUrl(url) - regex for tiktok.com/@user/video/
  - Implement extractSocialContentId(url, platform)
  - Implement validateSocialUrl(url) - returns SocialUrlParseResult or null
  - Create lib/validators.ts
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.2 Implement report form validation
  - Implement validateReportForm(data) - checks location, water_level, proof
  - Return ValidationResult with errors array
  - _Requirements: 3.2, 3.3, 3.4_

- [ ]* 3.3 Write property test for social URL validation
  - **Property 4: Social URL Validation**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ]* 3.4 Write property test for report form validation
  - **Property 5: Report Form Validation**
  - **Validates: Requirements 3.2, 3.3, 3.4**

## 4. Checkpoint - Core Logic Tests

- [ ] 4. Ensure all tests pass, ask the user if questions arise.

## 5. Supabase Database Setup

- [ ] 5.1 Create Supabase client
  - Create lib/supabase.ts with createClient
  - Configure for browser and server usage
  - _Requirements: 3.5, 8.1_

- [ ] 5.2 Apply database migrations
  - Create flood_reports table with all columns
  - Create report_confirmations table
  - Add indexes for performance
  - Enable RLS with appropriate policies
  - Enable Realtime for both tables
  - _Requirements: 3.5, 5.2, 8.1, 8.2_

## 6. Authentication Setup

- [ ] 6.1 Configure Clerk in layout
  - Wrap app with ClerkProvider in app/layout.tsx
  - Set up dark mode as default
  - _Requirements: 1.1, 9.1_

- [ ] 6.2 Create AuthHeader component
  - Display SignInButton/SignUpButton when signed out
  - Display UserButton when signed in
  - Style with neobrutalist design
  - Create components/Auth/AuthHeader.tsx
  - _Requirements: 1.1, 1.4, 9.3_

- [ ]* 6.3 Write property test for unauthenticated restrictions
  - **Property 10: Unauthenticated User Restrictions**
  - **Validates: Requirements 1.3**

## 7. Map Components

- [ ] 7.1 Create FloodMap component
  - Initialize Leaflet map centered on Malang (-7.9666, 112.6326)
  - Configure tile layer (OpenStreetMap)
  - Handle dynamic import for SSR compatibility
  - Create components/Map/FloodMap.tsx
  - _Requirements: 2.1, 2.5_

- [ ] 7.2 Create FloodMarker component
  - Render marker with color based on water_level
  - Apply opacity based on expiry status
  - Handle click to show popup
  - Create components/Map/FloodMarker.tsx
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7.3 Create DryRouteMarker component
  - Render green marker for dry routes
  - Apply same expiry opacity logic
  - Create components/Map/DryRouteMarker.tsx
  - _Requirements: 6.2, 6.3_

- [ ] 7.4 Create MarkerPopup component
  - Display report details (timestamp, water level, confirmation count)
  - Embed social media preview if available
  - Show photo if available
  - Include "Masih Banjir" confirmation button
  - Create components/Map/MarkerPopup.tsx
  - _Requirements: 2.3, 5.1_

## 8. Social Media Embed

- [ ] 8.1 Create SocialEmbed component
  - Handle Instagram embed using oEmbed
  - Handle Twitter/X embed
  - Handle TikTok embed
  - Fallback to link if embed fails
  - Create components/Social/SocialEmbed.tsx
  - _Requirements: 4.1, 4.2, 4.3_

## 9. Report Submission

- [ ] 9.1 Create ReportButton component
  - Large "LAPOR BANJIR" button at bottom of screen
  - Secondary "Lapor Jalan Kering" button
  - Thumb-friendly sizing for mobile
  - Only enabled when authenticated
  - Create components/Report/ReportButton.tsx
  - _Requirements: 3.1, 6.1, 9.2_

- [ ] 9.2 Create LocationPicker component
  - Allow user to drop pin on map
  - Show current selection coordinates
  - Integrate with ReportForm
  - Create components/Report/LocationPicker.tsx
  - _Requirements: 3.2_

- [ ] 9.3 Create ProofUpload component
  - Tab interface: "Upload Foto" / "Link Sosmed"
  - Photo upload with preview
  - Social URL input with validation feedback
  - Create components/Report/ProofUpload.tsx
  - _Requirements: 3.4, 4.1, 4.2, 4.3, 4.4_

- [ ] 9.4 Create ReportForm component
  - Water level selector (Siaga/Bahaya/Evakuasi)
  - Integrate LocationPicker and ProofUpload
  - Form validation before submit
  - Submit to Supabase
  - Create components/Report/ReportForm.tsx
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

## 10. Confirmation System

- [ ] 10.1 Create useConfirmation hook
  - Check if user already confirmed within 1 hour
  - Handle confirmation submission
  - Update report confirmation_count and expires_at
  - Create hooks/useConfirmation.ts
  - _Requirements: 5.2, 5.3, 5.4_

- [ ]* 10.2 Write property test for confirmation increment
  - **Property 7: Confirmation Increment**
  - **Validates: Requirements 5.2**

- [ ]* 10.3 Write property test for duplicate confirmation prevention
  - **Property 8: Duplicate Confirmation Prevention**
  - **Validates: Requirements 5.4**

## 11. Real-time Updates

- [ ] 11.1 Create useReports hook
  - Subscribe to flood_reports table changes
  - Subscribe to report_confirmations changes
  - Handle INSERT, UPDATE events
  - Auto-reconnect on connection loss
  - Create hooks/useReports.ts
  - _Requirements: 8.1, 8.2, 8.3_

## 12. Quick Filters

- [ ] 12.1 Create QuickFilters component
  - "Semua" button (default)
  - "Bisa Lewat Mobil" button (siaga only)
  - "Lumpuh Total" button (evakuasi only)
  - "Jalan Kering" button (dry routes)
  - High contrast styling
  - Create components/Filter/QuickFilters.tsx
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

## 13. Main Page Integration

- [ ] 13.1 Integrate all components in page.tsx
  - Layout with FloodMap as main content
  - AuthHeader at top
  - QuickFilters overlay
  - ReportButton at bottom
  - ReportForm modal
  - Wire up useReports for real-time data
  - Apply dark mode styling
  - _Requirements: 2.1, 9.1, 9.4_

## 14. Styling and Polish

- [ ] 14.1 Apply neobrutalist dark mode styling
  - Update globals.css with dark theme
  - High contrast colors
  - Bold borders and shadows
  - Large touch targets
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

## 15. Final Checkpoint

- [ ] 15. Ensure all tests pass, ask the user if questions arise.
