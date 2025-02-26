import Header, { AccountHeader } from "@components/header.autherized";
import { getProfile, updateProfile, uploadAvatar } from "@utils/profile";
import { Component, For, Show, createSignal, onMount } from "solid-js";

interface AccountPageProps {}


// types/settings.ts
export interface UserPlan {
	type: 'free' | 'paid';
	features: string[];
  }
  
  export interface UserAccount {
	firstName: string;
	lastName: string;
	email: string;
  }

  interface Profile {
    profile_id: number;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
    avatar_url?: string;  // Ajout du champ pour l'URL de l'avatar
}

interface ProfileUpdateData {
	name: string;
	email: string;
	phone: string;
	location: string;
	linkedin: string;
	website: string;
	cvPhotoPath?: string;
  }
  
  export interface SocialConnection {
	platform: 'facebook' | 'linkedin' | 'google';
	connected: boolean;
	email?: string;
  }
  
  export interface NotificationSetting {
	id: string;
	title: string;
	description: string;
	enabled: boolean;
	hasAction?: boolean;
	actionLabel?: string;
  }
  
    
  export const PlanSection: Component<{ plan: UserPlan }> = (props) => {
	return (
	  <section class="bg-white rounded-lg p-6 shadow-sm">
		<header>
		  <h2 class="text-sm text-gray-500 uppercase mb-4">Your Plan</h2>
		</header>
		<article class="flex items-center justify-between">
		  <figure class="flex items-center gap-4">
			<aside class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
			  <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
				<path d="M4 4h16v16H4V4z" stroke="currentColor" stroke-width="2"/>
			  </svg>
			</aside>
			<figcaption>
			  <h3 class="font-medium">Subscription Account</h3>
			  <p class="text-sm text-gray-500">You are on the 3 month plan. You can save your data and search for jobs.</p>
			</figcaption>
		  </figure>
		  <button class="text-blue-500 hover:text-blue-600 font-medium">
			Change Plan
		  </button>
		</article>
	  </section>
	);
  };
  
  export const SocialSection: Component<{
	connections: SocialConnection[];
	onConnect: (platform: string) => void;
	onDisconnect: (platform: string) => void;
  }> = (props) => {
	const getIcon = (platform: string) => {
	  // Retourner l'icône appropriée pour chaque plateforme
	  return <span class="w-6 h-6 text-gray-700" />;
	};
  
	return (
	  <section class="bg-white rounded-lg p-6 shadow-sm">
		<header>
		  <h2 class="text-sm text-gray-500 uppercase mb-4">Social Profile</h2>
		</header>
		<ul class="space-y-4">
		  <For each={props.connections}>
			{(connection) => (
			  <li class="flex items-center justify-between py-2">
				<figure class="flex items-center gap-3">
				  {getIcon(connection.platform)}
				  <figcaption class="flex items-center">
					<span class="capitalize">{connection.platform}</span>
					{connection.email && (
					  <span class="text-sm text-gray-500 ml-1">• {connection.email}</span>
					)}
				  </figcaption>
				</figure>
				<button
				  onClick={() => connection.connected 
					? props.onDisconnect(connection.platform)
					: props.onConnect(connection.platform)
				  }
				  class={`text-sm font-medium ${
					connection.connected ? 'text-red-500' : 'text-blue-500'
				  }`}
				>
				  {connection.connected ? 'Disconnect' : 'Connect'}
				</button>
			  </li>
			)}
		  </For>
		</ul>
	  </section>
	);
  };

  
  export const DangerZone: Component<{
	onDelete: () => void;
  }> = (props) => {
	return (
	  <section class="bg-white rounded-lg p-6 shadow-sm">
		<header>
		  <h2 class="text-sm text-gray-500 uppercase mb-4">Danger Zone</h2>
		</header>
		<article>
		  <p class="text-sm text-gray-600 mb-4">
			Once you delete your account, it cannot be undone. This is permanent.
		  </p>
		  <button
			onClick={props.onDelete}
			class="text-red-500 hover:text-red-600 font-medium"
		  >
			Delete Account
		  </button>
		</article>
	  </section>
	);
  };
  
  export const AvatarSection: Component<{ 
    currentAvatarUrl?: string; 
    onAvatarUpdate: (newAvatarUrl: string) => void;
}> = (props) => {
    // Utiliser une fonction pour construire l'URL complète si elle ne l'est pas déjà
    const getFullAvatarUrl = (avatarPath?: string) => {
        if (!avatarPath) return undefined;
        
        // Vérifier si l'URL est déjà complète
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
            return avatarPath;
        }
        
        // Construire l'URL complète
        return `http://localhost:3000/api/v1${avatarPath}`;
    };

    // Initialiser avec l'URL complète
    const [previewUrl, setPreviewUrl] = createSignal(getFullAvatarUrl(props.currentAvatarUrl));
    
    const [isUploading, setIsUploading] = createSignal(false);
    const [uploadError, setUploadError] = createSignal<string | null>(null);

    // Le reste du code reste identique à l'exemple précédent
    const uploadAvatar = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/account_group/avatar/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            return data.path;
        } catch (error) {
            console.error('Avatar upload error:', error);
            throw error;
        }
    };

    const handleImageUpload = async (e: Event) => {
		const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        
        // Validation du fichier
        if (!file.type.startsWith('image/')) {
            setUploadError('Please upload an image file (JPG, PNG, or GIF)');
            return;
        }

        // Vérifier la taille (max 5 MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File size exceeds 5MB limit');
            return;
        }

        // Réinitialiser l'erreur
        setUploadError(null);

        // Créer une preview locale avant l'upload
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        setIsUploading(true);
        try {
            const avatarUrl = await uploadAvatar(file);
            
            // Construire l'URL complète
            const backendAvatarUrl = `http://localhost:3000/api/v1${avatarUrl}`;
            
            // Notifier le composant parent
            props.onAvatarUpdate(backendAvatarUrl);

            // Mettre à jour la preview
            setPreviewUrl(backendAvatarUrl);
        } catch (error) {
            // ... (gestion des erreurs comme avant)
        }
    };

	return (
        <section class="bg-white rounded-lg p-6 shadow-sm">
            <header>
                <h2 class="text-sm text-gray-500 uppercase mb-4">Profile Picture</h2>
            </header>
            <article class="flex items-center gap-4">
                <figure class="relative group">
                    <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        <Show
                            when={previewUrl()}
                            fallback={
                                <svg class="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            }
                        >
                            <img 
                                src={previewUrl()} 
                                alt="Profile" 
                                class="w-full h-full object-cover" 
                            />
                        </Show>
                        <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="text-white text-sm">Change</span>
                        </div>
                    </div>
                    <input 
                        type="file"
                        accept="image/*"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                        disabled={isUploading()} 
                        aria-label="Upload profile picture"
                    />
                </figure>
                <aside class="flex-1">
                    <p class="text-sm text-gray-600">
                        Upload a profile picture. Max file size 5MB.
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF
                    </p>
                    
                    <Show when={isUploading()}>
                        <p class="text-sm text-blue-500 mt-2">
                            Uploading...
                        </p>
                    </Show>
                    
                    <Show when={uploadError()}>
                        <p class="text-sm text-red-500 mt-2">
                            {uploadError()}
                        </p>
                    </Show>
                </aside>
            </article>
        </section>
    );
};

  export const AccountSection: Component<{
	profile: Profile;
	onSave: (profile: Profile) => void;
  }> = (props) => {
	// Mode édition: false = affichage, true = modification
	const [isEditing, setIsEditing] = createSignal(false);
	
	// Statut de sauvegarde
	const [saveStatus, setSaveStatus] = createSignal<'idle' | 'saving' | 'success' | 'error'>('idle');
	
	// Données du formulaire
	const [formData, setFormData] = createSignal<ProfileUpdateData>({
	  name: props.profile.name || "",
	  email: props.profile.email || "",
	  phone: props.profile.phone || "",
	  location: props.profile.location || "",
	  linkedin: props.profile.linkedin || "",
	  website: props.profile.website || "",
	  cvPhotoPath: props.profile.avatar_url
	});
  
	// Chargement initial des données
	const [isLoading, setIsLoading] = createSignal(false);
	
	const loadProfileData = async () => {
	  setIsLoading(true);
	  
	  try {
		const profileData = await getProfile();
		setFormData({
		  name: profileData.name || "",
		  email: profileData.email || "",
		  phone: profileData.phone || "",
		  location: profileData.location || "",
		  linkedin: profileData.linkedin || "",
		  website: profileData.website || "",
		});
	  } catch (err) {
		console.error("Failed to load profile data:", err);
	  } finally {
		setIsLoading(false);
	  }
	};
	
	// Charger les données au montage du composant
	onMount(() => {
	  loadProfileData();
	});
  
	// Gestionnaire pour les changements d'input
	const handleInputChange = (field: keyof ProfileUpdateData, value: string): void => {
	  setFormData((prev) => ({
		...prev,
		[field]: value
	  }));
	};
  
	// Fonction pour soumettre les modifications
	const handleSubmit = async (e: Event): Promise<void> => {
	  e.preventDefault();
	  
	  setSaveStatus('saving');
	  
	  try {
		const success = await updateProfile({
		  name: formData().name,
		  email: formData().email,
		  phone: formData().phone,
		  location: formData().location,
		  linkedin: formData().linkedin,
		  website: formData().website,
		});
		
		if (success) {
		  try {
			const updatedProfileData = await getProfile();
			props.onSave(updatedProfileData);
			setSaveStatus('success');
			
			// Désactiver le mode édition après sauvegarde réussie
			setIsEditing(false);
			
			// Réinitialiser le statut après 3 secondes
			setTimeout(() => setSaveStatus('idle'), 3000);
		  } catch (fetchError) {
			console.error("Profile updated but failed to fetch updated data:", fetchError);
			
			const updatedProfile: Profile = {
			  ...props.profile,
			  name: formData().name,
			  email: formData().email,
			  phone: formData().phone,
			  location: formData().location,
			  linkedin: formData().linkedin,
			  website: formData().website,
			};
			
			props.onSave(updatedProfile);
			setSaveStatus('success');
			setIsEditing(false);
			setTimeout(() => setSaveStatus('idle'), 3000);
		  }
		}
	  } catch (error) {
		console.error("Failed to update profile:", error);
		setSaveStatus('error');
		setTimeout(() => setSaveStatus('idle'), 3000);
	  }
	};
  
	return (
	  <section class="bg-white rounded-lg p-6 shadow-sm">
		<header class="flex justify-between items-center mb-4">
		  <h2 class="text-sm text-gray-500 uppercase">Account</h2>
		  
		  {/* Bouton d'édition/annulation */}
		  <Show 
			when={isEditing()}
			fallback={
			  <button 
				type="button"
				onClick={() => setIsEditing(true)}
				class="text-blue-500 hover:text-blue-600 text-sm font-medium"
				disabled={isLoading()}
			  >
				Edit
			  </button>
			}
		  >
			<button 
			  type="button"
			  onClick={() => {
				setIsEditing(false);
				// Rétablir les données d'origine
				setFormData({
				  name: props.profile.name || "",
				  email: props.profile.email || "",
				  phone: props.profile.phone || "",
				  location: props.profile.location || "",
				  linkedin: props.profile.linkedin || "",
				  website: props.profile.website || "",
				  cvPhotoPath: props.profile.avatar_url
				});
			  }}
			  class="text-gray-500 hover:text-gray-600 text-sm font-medium"
			>
			  Cancel
			</button>
		  </Show>
		</header>
		
		{/* Indicateur de chargement */}
		<Show when={isLoading()}>
		  <div class="text-center py-4">
			<p class="text-gray-500">Loading profile data...</p>
		  </div>
		</Show>
		
		{/* Formulaire ou affichage */}
		<Show
		  when={isEditing()}
		  fallback={
			<div class="space-y-6">
			  <article class="space-y-1">
				<h3 class="text-sm text-gray-600 font-medium">Full Name</h3>
				<p class="text-gray-800">{formData().name || "Not specified"}</p>
			  </article>
			  
			  <article class="space-y-1">
				<h3 class="text-sm text-gray-600 font-medium">Email</h3>
				<p class="text-gray-800">{formData().email || "Not specified"}</p>
			  </article>
			  
			  <article class="space-y-1">
				<h3 class="text-sm text-gray-600 font-medium">Phone</h3>
				<p class="text-gray-800">{formData().phone || "Not specified"}</p>
			  </article>
			  
			  <article class="space-y-1">
				<h3 class="text-sm text-gray-600 font-medium">Location</h3>
				<p class="text-gray-800">{formData().location || "Not specified"}</p>
			  </article>
			  
			  <article class="space-y-1">
				<h3 class="text-sm text-gray-600 font-medium">LinkedIn Profile</h3>
				<p class="text-gray-800">
				  {formData().linkedin ? (
					<a href={formData().linkedin} target="_blank" rel="noopener" class="text-blue-500 hover:underline">
					  {formData().linkedin}
					</a>
				  ) : (
					"Not specified"
				  )}
				</p>
			  </article>
			  
			  <article class="space-y-1">
				<h3 class="text-sm text-gray-600 font-medium">Personal Website</h3>
				<p class="text-gray-800">
				  {formData().website ? (
					<a href={formData().website} target="_blank" rel="noopener" class="text-blue-500 hover:underline">
					  {formData().website}
					</a>
				  ) : (
					"Not specified"
				  )}
				</p>
			  </article>
			</div>
		  }
		>
		  <form onSubmit={handleSubmit} class="grid grid-cols-1 gap-6">
			<fieldset>
			  <legend class="sr-only">Personal Information</legend>
			  
			  <article class="space-y-2">
				<label for="full-name" class="block text-sm text-gray-600 font-medium">
				  Full Name <span class="text-red-500">*</span>
				</label>
				<input
				  id="full-name"
				  type="text"
				  value={formData().name}
				  onInput={(e: InputEvent) => handleInputChange('name', (e.target as HTMLInputElement).value)}
				  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				  required
				/>
			  </article>
			  
			  <article class="space-y-2">
				<label for="email-address" class="block text-sm text-gray-600 font-medium">
				  Email <span class="text-red-500">*</span>
				</label>
				<input
				  id="email-address"
				  type="email"
				  value={formData().email}
				  onInput={(e: InputEvent) => handleInputChange('email', (e.target as HTMLInputElement).value)}
				  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				  required
				/>
				<p class="text-xs text-gray-500">
				  Use this email to log in to your account and receive notifications.
				</p>
			  </article>
			  
			  <article class="space-y-2">
				<label for="phone-number" class="block text-sm text-gray-600 font-medium">
				  Phone <span class="text-gray-400 text-xs">(optional)</span>
				</label>
				<input
				  id="phone-number"
				  type="tel"
				  value={formData().phone}
				  onInput={(e: InputEvent) => handleInputChange('phone', (e.target as HTMLInputElement).value)}
				  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				  placeholder="+1 (555) 123-4567"
				/>
			  </article>
			  
			  <article class="space-y-2">
				<label for="user-location" class="block text-sm text-gray-600 font-medium">
				  Location <span class="text-gray-400 text-xs">(optional)</span>
				</label>
				<input
				  id="user-location"
				  type="text"
				  value={formData().location}
				  onInput={(e: InputEvent) => handleInputChange('location', (e.target as HTMLInputElement).value)}
				  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				  placeholder="City, Country"
				/>
			  </article>
			  
			  <article class="space-y-2">
				<label for="linkedin-profile" class="block text-sm text-gray-600 font-medium">
				  LinkedIn Profile <span class="text-gray-400 text-xs">(optional)</span>
				</label>
				<input
				  id="linkedin-profile"
				  type="url"
				  value={formData().linkedin}
				  onInput={(e: InputEvent) => handleInputChange('linkedin', (e.target as HTMLInputElement).value)}
				  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				  placeholder="https://linkedin.com/in/..."
				/>
			  </article>
			  
			  <article class="space-y-2">
				<label for="personal-website" class="block text-sm text-gray-600 font-medium">
				  Personal Website <span class="text-gray-400 text-xs">(optional)</span>
				</label>
				<input
				  id="personal-website"
				  type="url"
				  value={formData().website}
				  onInput={(e: InputEvent) => handleInputChange('website', (e.target as HTMLInputElement).value)}
				  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				  placeholder="https://..."
				/>
			  </article>
			</fieldset>
			
			<footer class="mt-6 pt-4 border-t border-gray-100 flex justify-end items-center gap-3">
			  {/* Indicateur de statut */}
			  <Show when={saveStatus() === 'saving'}>
				<span class="text-sm text-gray-500">Saving...</span>
			  </Show>
			  
			  <Show when={saveStatus() === 'success'}>
				<span class="text-sm text-green-500">✓ Saved successfully</span>
			  </Show>
			  
			  <Show when={saveStatus() === 'error'}>
				<span class="text-sm text-red-500">Failed to save</span>
			  </Show>
			  
			  <button 
				type="submit"
				class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
				disabled={saveStatus() === 'saving'}
			  >
				Save
			  </button>
			</footer>
		  </form>
		</Show>
	  </section>
	);
  };
  

  function Account(props: AccountPageProps) {
    const [profile, setProfile] = createSignal<Profile>({
        profile_id: 0,
        name: 'David',
        email: 'dboss105.mdc@gmail.com',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
		avatar_url: ''
    });
  
	return (
	  <main class="md:px-48 px-8 mx-auto flex flex-col gap-4 min-h-screen">
		<Header />
		
		<article class="flex flex-col gap-8 py-8 max-w-3xl mx-auto w-full">
		  <h1 class="sr-only">Account Settings</h1>

			{/* Section Avatar */}
			<section aria-label="Profile Picture">
                <AvatarSection 
                    currentAvatarUrl={profile().avatar_url}
                    onAvatarUpdate={(newAvatarUrl) => {
                        setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
                    }}
                />
            </section>	
		  
		  {/* Plan Section */}
		  <section aria-label="Plan Information">
			<PlanSection plan={{ type: 'paid', features: [] }} />
		  </section>
  
            {/* Account Details Section */}
            <section aria-label="Account Details">
                <AccountSection 
                    profile={profile()} 
                    onSave={(updatedProfile) => {
                        setProfile(updatedProfile);
                    }} 
                />
            </section>
  
		  {/* Danger Zone Section */}
		  <section aria-label="Account Deletion">
			<DangerZone onDelete={() => {}} />
		  </section>
  
		  {/* Support Footer */}
		  <footer class="text-center text-sm text-gray-500 py-4">
			<p>
			  Need help? Have questions or feedback? Our team would love to hear from you —{' '}
			  <a 
				href="#" 
				class="text-blue-500 hover:text-blue-600"
				aria-label="Contact support team"
			  >
				contact our support
			  </a>
			</p>
		  </footer>
		</article>
	  </main>
	);
  }

export default Account;