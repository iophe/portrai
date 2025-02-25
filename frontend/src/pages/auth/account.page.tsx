import Header, { AccountHeader } from "@components/header.autherized";
import { Component, For, Show, createSignal } from "solid-js";

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
  
  export const NotificationsSection: Component<{
	settings: NotificationSetting[];
	onToggle: (id: string) => void;
	onAction?: (id: string) => void;
  }> = (props) => {
	return (
	  <section class="bg-white rounded-lg p-6 shadow-sm">
		<header>
		  <h2 class="text-sm text-gray-500 uppercase mb-4">Email Notifications</h2>
		</header>
		<ul class="space-y-6">
		  <For each={props.settings}>
			{(setting) => (
			  <li class="flex items-center justify-between">
				<article>
				  <h3 class="font-medium">{setting.title}</h3>
				  <p class="text-sm text-gray-500">{setting.description}</p>
				</article>
				<aside class="flex items-center gap-4">
				  {setting.hasAction && (
					<button
					  onClick={() => props.onAction?.(setting.id)}
					  class="text-blue-500 text-sm font-medium"
					>
					  {setting.actionLabel}
					</button>
				  )}
				  <label class="relative inline-flex items-center cursor-pointer">
					<input
					  type="checkbox"
					  checked={setting.enabled}
					  class="sr-only peer"
					  onChange={() => props.onToggle(setting.id)}
					/>
					<span class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></span>
				  </label>
				</aside>
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
	profileId: number;
	currentAvatarUrl?: string;
	onAvatarUpdate: (newAvatarUrl: string) => void;
  }> = (props) => {
	const [isUploading, setIsUploading] = createSignal(false);
	const [previewUrl, setPreviewUrl] = createSignal(props.currentAvatarUrl);
  
	const handleImageUpload = async (e: Event) => {
	  const input = e.target as HTMLInputElement;
	  if (!input.files?.length) return;
  
	  const file = input.files[0];
	  if (!file.type.startsWith('image/')) {
		alert('Please upload an image file');
		return;
	  }
  
	  const objectUrl = URL.createObjectURL(file);
	  setPreviewUrl(objectUrl);
  
	  const formData = new FormData();
	  formData.append('avatar', file);
	  formData.append('profile_id', props.profileId.toString());
  
	  setIsUploading(true);
	  try {
		/*  const response = await api.post('/resume/profile/upload-avatar', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}); */
		/*  props.onAvatarUpdate(response.data.avatar_url); */
	  } catch (error) {
		console.error('Failed to upload avatar:', error);
		setPreviewUrl(props.currentAvatarUrl);
	  } finally {
		setIsUploading(false);
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
		  </aside>
		</article>
	  </section>
	);
  };

  export const AccountSection: Component<{
	profile: Profile;
	onSave: (profile: Profile) => void;
  }> = (props) => {
	return (
	  <section class="bg-white rounded-lg p-6 shadow-sm">
		<header>
		  <h2 class="text-sm text-gray-500 uppercase mb-4">Account</h2>
		</header>
		
		<form class="grid grid-cols-1 gap-6">
		  <fieldset>
			<legend class="sr-only">Personal Information</legend>
			
			<article class="space-y-2">
			  <label for="full-name" class="block text-sm text-gray-600 font-medium">
				Full Name <span class="text-red-500">*</span>
			  </label>
			  <input
				id="full-name"
				type="text"
				value={props.profile.name}
				class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			  />
			</article>
			
			<article class="space-y-2">
			  <label for="email-address" class="block text-sm text-gray-600 font-medium">
				Email <span class="text-red-500">*</span>
			  </label>
			  <input
				id="email-address"
				type="email"
				value={props.profile.email}
				class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			  />
			  <p class="text-xs text-gray-500">
				Use this email to log in to your PORTRAI account and receive notifications.
			  </p>
			</article>
			
			<article class="space-y-2">
			  <label for="phone-number" class="block text-sm text-gray-600 font-medium">
				Phone <span class="text-gray-400 text-xs">(optional)</span>
			  </label>
			  <input
				id="phone-number"
				type="tel"
				value={props.profile.phone}
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
				value={props.profile.location}
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
				value={props.profile.linkedin}
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
				value={props.profile.website}
				class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="https://..."
			  />
			</article>
		  </fieldset>
		</form>
		
		<footer class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
		  <button 
			onClick={() => props.onSave(props.profile)}
			class="text-blue-500 hover:text-blue-600 font-medium"
		  >
			Save
		  </button>
		</footer>
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
                    profileId={profile().profile_id}
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
                        // Ici vous pouvez ajouter la logique pour sauvegarder vers l'API
                      /*   api.post("/resume/profile/update", {
                            ...updatedProfile,
                            profile_id: updatedProfile.profile_id
                        }).catch(error => {
                            console.error("Failed to update profile:", error);
                        }); */
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