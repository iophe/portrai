import { api } from "./api";

// Interface pour les données de profil
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

// Interface pour la réponse du profil
interface ProfileResponse {
  profile_id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

/**
 * Récupère les informations du profil depuis l'API
 * @returns Les données du profil
 */
export async function getProfile(): Promise<ProfileResponse> {
  try {
    const response = await api.get("/account/profile");
    return response.data.profile;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
}

export async function updateProfile(profileData: ProfileData): Promise<boolean> {
    try {
        const data = {
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            location: profileData.location || "",
            linkedin: profileData.linkedin || "", 
            website: profileData.website || "",
          };
      const response = await api.post("/account/profile/update", data);
      console.log("Profile update response:", response.data);
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }