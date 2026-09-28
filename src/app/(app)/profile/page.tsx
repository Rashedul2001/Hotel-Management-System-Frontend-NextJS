import ProfilePage from "@/components/profile/ProfilePage";
import { ProtectedContent } from "@/providers/protected-content";
import { GuestProfile } from "@/types/profile";

const demoProfile: GuestProfile = {
    id: "guest-id",
    name: "Guest Name",
    username: "guest",
    email: "guest@example.com",
    emailVerified: true,
    phoneNumber: "+880 1XXXXXXXXX",
    phoneVerified: false,
    nationalId: "",
    dateOfBirth: "",
    address: "",
    city: "",
    country: "Bangladesh",
    postalCode: "",
    about: "",
    memberSince: "2026-01-15",
    twoFactorEnabled: false,
    lastPasswordChange: "2026-08-20",
    lastLoginAt: "2026-09-17T16:30:00+06:00",

    preferredRoomType: "Deluxe",
    preferredBedType: "King",
    preferredFloor: "High",
    smokingPreference: "Non-smoking",
    accessibilityNeeds: "",

    loyaltyTier: "Guest",
    loyaltyPoints: 0,

    notificationPreferences: {
        bookingUpdates: true,
        promotionalOffers: false,
        reviewReminders: true,
        securityAlerts: true,
    },

    connectedAccounts: {
        google: false,
        facebook: false,
        apple: false,
    },

    bookings: [],
    activities: [],
    reviewCount: 0,
    accountCount: 1,
};

export default function ProfileRoute() {
    return (
        <ProtectedContent>
            <ProfilePage
                profile={demoProfile}
                /*
                 * Connect these callbacks to your ASP.NET Core API.
                 * No API URLs are invented here because the supplied Profile.cshtml
                 * contains MVC form actions rather than the new API contract.
                 */
                // onProfileSave={async (profile) => {
                //     console.log("TODO: PUT/PATCH profile", profile);
                // }}
                // onPasswordChange={async (currentPassword, newPassword) => {
                //     console.log("TODO: POST change-password", { currentPassword, newPassword });
                // }}
                // onPasswordReset={async () => {
                //     console.log("TODO: POST reset-password");
                // }}
                // onTwoFactorToggle={async (enabled) => {
                //     console.log("TODO: POST toggle-two-factor", enabled);
                // }}
                // onNotificationPreferencesChange={async (preferences) => {
                //     console.log("TODO: PUT notification-preferences", preferences);
                // }}
            />
        </ProtectedContent>
    );
}
