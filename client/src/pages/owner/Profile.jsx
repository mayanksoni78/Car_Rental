import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import PageHeader from '../../components/owner/PageHeader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, axios, fetchUser } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone_no || '');
      setImagePreview(user.image || '');
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    if (user) {
      setName(user.name || '');
      setPhone(user.phone_no || '');
      setImagePreview(user.image || '');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upload photo if changed
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const imgRes = await axios.post('/owner/update-image', formData);
        if (!imgRes.data.success) {
          toast.error(imgRes.data.message || 'Failed to upload photo');
        }
      }

      // 2. Update profile name and phone
      const { data } = await axios.post('/owner/update-profile', {
        name: name.trim(),
        phone_no: phone.trim()
      });

      if (data.success) {
        toast.success(data.message || 'Profile updated successfully.');
        await fetchUser();
        setSelectedImage(null);
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        showBack={true}
        backFallback="/owner"
        category="Account Management"
        title="Owner Profile"
        description="Manage your profile, contact details, and account preferences."
      />

      <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl p-6 sm:p-10 shadow-xs">
        
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div className="space-y-8">
            
            {/* Top Avatar & Overview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-[#E4D9C7]">
              <div className="relative w-24 h-24 rounded-2xl bg-[#05091B] border-2 border-[#E4D9C7] p-1 flex-shrink-0 shadow-sm">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Owner"}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#3D4C27] text-[#FAF7F0] font-black text-3xl flex items-center justify-center uppercase">
                    {user?.name ? user.name.charAt(0) : 'O'}
                  </div>
                )}
                <span className="w-4 h-4 rounded-full bg-[#8EA860] border-2 border-[#FAF7F0] absolute -bottom-1 -right-1"></span>
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#05091B]">
                    {user?.name || "Owner"}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/20 shadow-2xs">
                    Car Owner
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    Verified Host
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  Active member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024'}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="bg-[#F5F0E7] border border-[#E4D9C7] rounded-2xl p-5 hover:border-[#3D4C27]/40 transition-colors">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 block mb-1">
                  Full Name
                </span>
                <p className="text-sm sm:text-base font-bold text-[#05091B]">
                  {user?.name || "Not provided"}
                </p>
              </div>

              <div className="bg-[#F5F0E7] border border-[#E4D9C7] rounded-2xl p-5 hover:border-[#3D4C27]/40 transition-colors">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 block mb-1">
                  Phone Number
                </span>
                <p className="text-sm sm:text-base font-bold text-[#05091B]">
                  {user?.phone_no || "Not provided"}
                </p>
              </div>

              <div className="sm:col-span-2 bg-[#F5F0E7] border border-[#E4D9C7] rounded-2xl p-5 hover:border-[#3D4C27]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 block">
                    Email Address
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">
                    Verified Authentication Email
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#05091B] mt-1">
                  {user?.email || "No email available"}
                </p>
              </div>

            </div>

          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Picker */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#E4D9C7]">
              <div className="w-20 h-20 rounded-2xl bg-[#05091B] border-2 border-[#E4D9C7] p-1 flex-shrink-0 relative overflow-hidden shadow-sm">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#3D4C27] text-[#FAF7F0] font-black text-2xl flex items-center justify-center uppercase">
                    {name ? name.charAt(0) : 'O'}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <label
                  htmlFor="profile-image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-[#8EA860]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Change Photo
                </label>
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-[11px] text-stone-500">
                  Recommended: Square JPG or PNG, max 5MB.
                </p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-2">
                  Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-4 py-3 bg-[#EAE3D2]/50 border border-[#E4D9C7] rounded-xl text-sm font-semibold text-stone-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-stone-500 mt-1.5 italic">
                  Email is locked for account security and cannot be changed here.
                </p>
              </div>

            </div>

            {/* Edit Action Buttons */}
            <div className="pt-6 border-t border-[#E4D9C7] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-5 py-2.5 bg-transparent hover:bg-[#EAE3D2] border border-[#E4D9C7] text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default Profile;
