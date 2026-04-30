export default function StoreInspectionModal({
    open,
    onClose,
    store,
    onApprove,
    onDeny,
  }) {
    if (!open || !store) return null;
  
    const owner = store.user_profiles || {};
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl overflow-hidden">
  
          {/* HEADER */}
          <div className="p-5 border-b flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {store.name}
              </h2>
              <p className="text-sm text-gray-500">
                Restaurant Application Review
              </p>
            </div>
  
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 text-lg"
            >
              ✕
            </button>
          </div>
  
          {/* BODY */}
          <div className="p-5 space-y-6">
  
            {/* RESTAURANT IMAGES */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Profile Image</p>
                <img
                  src={store.profile_image || "https://via.placeholder.com/300"}
                  className="h-40 w-full object-cover rounded-xl border"
                />
              </div>
  
              <div>
                <p className="text-xs text-gray-500 mb-2">Cover Image</p>
                <img
                  src={store.background_image || "https://via.placeholder.com/600"}
                  className="h-40 w-full object-cover rounded-xl border"
                />
              </div>
            </div>
  
            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-6 text-sm">
  
              {/* RESTAURANT INFO */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  Restaurant Info
                </h3>
  
                <p><span className="text-gray-500">Name:</span> {store.name}</p>
                <p><span className="text-gray-500">Contact:</span> {store.contact_info}</p>
                <p><span className="text-gray-500">Status:</span> {store.status}</p>
                <p>
                  <span className="text-gray-500">Created:</span>{" "}
                  {new Date(store.created_at).toLocaleString()}
                </p>
              </div>
  
              {/* OWNER INFO (UPGRADED) */}
              <div className="space-y-3">
  
                <h3 className="font-semibold text-gray-900">
                  Applicant Profile
                </h3>
  
                <div className="flex items-center gap-3">
  
                  <img
                    src={
                      owner.profile_image ||
                      "https://via.placeholder.com/80"
                    }
                    className="w-12 h-12 rounded-full object-cover border"
                  />
  
                  <div>
                    <p className="font-medium text-gray-900">
                      {owner.first_name} {owner.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {owner.role || "unknown role"}
                    </p>
                  </div>
  
                </div>
  
                <p>
                  <span className="text-gray-500">Contact:</span>{" "}
                  {owner.contact_number || "—"}
                </p>
  
                <p>
                  <span className="text-gray-500">Account Status:</span>{" "}
                  {owner.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-500">Inactive</span>
                  )}
                </p>
  
                <p>
                  <span className="text-gray-500">User ID:</span>{" "}
                  {store.user_id}
                </p>
  
              </div>
  
            </div>
          </div>
  
          {/* ACTIONS */}
          <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
  
            <button
              onClick={() => onDeny(store.restaurant_id)}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Deny
            </button>
  
            <button
              onClick={() => onApprove(store.restaurant_id)}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              Approve
            </button>
  
          </div>
  
        </div>
      </div>
    );
  }