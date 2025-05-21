import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { UserCircleIcon, KeyIcon, TrashIcon, CameraIcon, LinkIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5001';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => Promise<void>;
  currentUser: {
    username: string;
    email: string;
    profile?: {
      avatarUrl?: string;
      bio?: string;
      location?: string;
      instagramUrl?: string;
      facebookUrl?: string;
      youtubeUrl?: string;
    };
  };
}

const ProfileManagementModal = ({ isOpen, onClose, onProfileUpdate, currentUser }: ProfileManagementModalProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState(currentUser.profile?.bio || '');
  const [location, setLocation] = useState(currentUser.profile?.location || '');
  const [instagramUrl, setInstagramUrl] = useState(currentUser.profile?.instagramUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(currentUser.profile?.facebookUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(currentUser.profile?.youtubeUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser.profile?.avatarUrl || '');

  useEffect(() => {
    setBio(currentUser.profile?.bio || '');
    setLocation(currentUser.profile?.location || '');
    setInstagramUrl(currentUser.profile?.instagramUrl || '');
    setFacebookUrl(currentUser.profile?.facebookUrl || '');
    setYoutubeUrl(currentUser.profile?.youtubeUrl || '');
    setAvatarPreview(currentUser.profile?.avatarUrl || '');
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email update
    console.log('Update email:', email);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // TODO: Implement password update
    console.log('Update password');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let avatarUrl = currentUser.profile?.avatarUrl;

      if (avatarFile) {
        // Create a FormData object for the file upload
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        // Upload the avatar file
        const uploadResponse = await fetch(`${API_URL}/api/upload/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData,
        });

        let uploadData;
        const contentType = uploadResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          uploadData = await uploadResponse.json();
        } else {
          const text = await uploadResponse.text();
          throw new Error(text || 'Failed to upload avatar');
        }

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload avatar');
        }

        avatarUrl = uploadData.url;
      }

      // Update profile data
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bio,
          location,
          instagramUrl,
          facebookUrl,
          youtubeUrl,
          avatarUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      if (onProfileUpdate) {
        await onProfileUpdate();
      }
      onClose();
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeactivation = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      // TODO: Implement account deactivation
      console.log('Deactivate account');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Profile Management
                </Dialog.Title>

                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-xl bg-indigo-100 p-1 mb-6">
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                        ${selected 
                          ? 'bg-white text-indigo-700 shadow'
                          : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                        }`
                      }
                    >
                      Profile
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                        ${selected 
                          ? 'bg-white text-indigo-700 shadow'
                          : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                        }`
                      }
                    >
                      Email & Password
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                        ${selected 
                          ? 'bg-white text-indigo-700 shadow'
                          : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                        }`
                      }
                    >
                      Account
                    </Tab>
                  </Tab.List>

                  <Tab.Panels>
                    {/* Profile Tab */}
                    <Tab.Panel>
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img
                                className="h-24 w-24 rounded-full object-cover"
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${currentUser.username}`}
                                alt={currentUser.username}
                              />
                              <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 cursor-pointer hover:bg-indigo-700"
                              >
                                <CameraIcon className="h-4 w-4 text-white" />
                                <input
                                  type="file"
                                  id="avatar-upload"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleAvatarChange}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex-grow">
                            <div>
                              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                Bio
                              </label>
                              <textarea
                                id="bio"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">
                            Instagram
                          </label>
                          <input
                            type="url"
                            id="instagramUrl"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">
                            Facebook
                          </label>
                          <input
                            type="url"
                            id="facebookUrl"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                            YouTube
                          </label>
                          <input
                            type="url"
                            id="youtubeUrl"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </Tab.Panel>

                    {/* Email & Password Tab */}
                    <Tab.Panel>
                      <div className="space-y-8">
                        <form onSubmit={handleEmailUpdate} className="space-y-6">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              disabled={isLoading}
                            >
                              Update Email
                            </button>
                          </div>
                        </form>

                        <div className="border-t border-gray-200 pt-6">
                          <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div>
                              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                                Current Password
                              </label>
                              <input
                                type="password"
                                id="current-password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                New Password
                              </label>
                              <input
                                type="password"
                                id="new-password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                id="confirm-password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                disabled={isLoading}
                              >
                                Update Password
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Account Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <TrashIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Deactivate Account</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>
                                  Once you deactivate your account, there is no going back. Please be certain.
                                </p>
                              </div>
                              <div className="mt-4">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                                  onClick={handleAccountDeactivation}
                                >
                                  Deactivate Account
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>

                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileManagementModal; 