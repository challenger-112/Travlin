import React, { useCallback, useEffect, useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaRegComment } from "react-icons/fa";

import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const MAX_PROFILE_PICTURE_SIZE = 1024 * 1024;
const DEFAULT_PROFILE_PICTURE = "https://placehold.co/160x160?text=Profile";
const EMPTY_PROFILE = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  bio: "",
  places_traveled: "",
  profile_picture: "",
};

function Profile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [editing, setEditing] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError("");
    try {
      const { data } = await API.get("profile/");
      setProfile({ ...EMPTY_PROFILE, ...data });
      setDraft({ ...EMPTY_PROFILE, ...data });
      setPicturePreview(data.profile_picture || "");
    } catch (requestError) {
      console.error("Unable to load profile:", requestError);
      setError(
        requestError.response?.data?.detail ||
        "Unable to load your profile. Please try again."
      );
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    setError("");
    try {
      const { data } = await API.get("posts/mine/");
      setPosts(data);
    } catch (requestError) {
      console.error("Unable to load posts:", requestError);
      setError(
        requestError.response?.data?.detail ||
        "Unable to load your posts. Please try again."
      );
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => () => {
      if (picturePreview.startsWith("blob:")) {
        URL.revokeObjectURL(picturePreview);
      }
  }, [picturePreview]);

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts();
    }
  }, [activeTab, loadPosts]);

  const handleFieldChange = (event) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      setPictureError("Profile pictures must be 1 MB or smaller.");
      event.target.value = "";
      return;
    }

    setPictureError("");
    setSelectedPicture(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setEditing(false);
    setSelectedPicture(null);
    setPicturePreview(profile.profile_picture || "");
    setPictureError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    ["first_name", "last_name", "date_of_birth", "bio", "places_traveled"].forEach((field) => {
      formData.append(field, draft[field] || "");
    });
    if (selectedPicture) {
      formData.append("profile_picture", selectedPicture);
    }

    try {
      const { data } = await API.patch("profile/", formData);
      setProfile({ ...EMPTY_PROFILE, ...data });
      setDraft({ ...EMPTY_PROFILE, ...data });
      setPicturePreview(data.profile_picture || "");
      setSelectedPicture(null);
      setEditing(false);
    } catch (requestError) {
      console.error("Unable to save profile:", requestError);
      setError(
        requestError.response?.data?.profile_picture?.[0] ||
        requestError.response?.data?.detail ||
        "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    setLoggingOut(true);
    setError("");

    try {
      if (refresh) {
        await API.post("logout/", { refresh });
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      window.location.assign("/");
      window.dispatchEvent(new Event("auth-session-updated"));
      // navigate("/", { replace: true });
    } catch (requestError) {
      console.error("Unable to log out:", requestError);
      if (requestError.response?.status === 400 || requestError.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.assign("/");
        window.dispatchEvent(new Event("auth-session-updated"));
        // navigate("/", { replace: true });
      } else {
        setError("Unable to log out right now. Please try again.");
      }
    } finally {
      setLoggingOut(false);
    }
  };

  const handleAddPost = () => {
    navigate("/posts");
  }

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <header className="profile-header">
          <img
            src={picturePreview || DEFAULT_PROFILE_PICTURE}
            alt={`${profile.username || "User"} profile`}
            className="profile-avatar"
          />
          <div className="profile-heading">
            <h1>{profile.username || "My Profile"}</h1>
            <p className="profile-email">{profile.email}</p>
          </div>
          <button
            type="button"
            className="profile-button profile-button-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </header>

        <section className="profile-content">
          <div className="profile-tabs" role="tablist" aria-label="Profile sections">
            <button
              id="profile-details-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === "details"}
              className={activeTab === "details" ? "profile-tab active" : "profile-tab"}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              id="profile-posts-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === "posts"}
              className={activeTab === "posts" ? "profile-tab active" : "profile-tab"}
              onClick={() => setActiveTab("posts")}
            >
              Posts <span className="profile-post-count">{posts.length}</span>
            </button>
          </div>

          {error && <p className="profile-message error" role="alert">{error}</p>}

          {activeTab === "details" && (
            <section
              className="profile-panel"
              role="tabpanel"
              aria-labelledby="profile-details-tab"
            >
              <div className="profile-panel-heading">
                <div>
                  <h2>Personal details</h2>
                  <p>Your account information and travel profile.</p>
                </div>
                {!editing && (
                  <button
                    type="button"
                    className="profile-button profile-button-save"
                    onClick={() => setEditing(true)}
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {loadingProfile ? (
                <p className="profile-message">Loading your details…</p>
              ) : (
                <form className="profile-details-form" onSubmit={handleSave}>
                  {editing && (
                    <div className="profile-picture-field">
                      <label htmlFor="profile-picture">Profile picture (max 1 MB)</label>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                        aria-describedby={pictureError ? "profile-picture-error" : undefined}
                        className="profile-input"
                      />
                      {pictureError && (
                        <p id="profile-picture-error" className="profile-message error" role="alert">
                          {pictureError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="profile-details-grid">
                    <label>
                      Username
                      <input className="profile-input" value={profile.username} disabled />
                    </label>
                    <label>
                      Email
                      <input className="profile-input" value={profile.email} disabled />
                    </label>
                    <label>
                      First name
                      <input
                        name="first_name"
                        className="profile-input"
                        value={draft.first_name}
                        onChange={handleFieldChange}
                        disabled={!editing}
                      />
                    </label>
                    <label>
                      Last name
                      <input
                        name="last_name"
                        className="profile-input"
                        value={draft.last_name}
                        onChange={handleFieldChange}
                        disabled={!editing}
                      />
                    </label>
                    <label>
                      Date of birth
                      <input
                        name="date_of_birth"
                        type="date"
                        className="profile-input"
                        value={draft.date_of_birth || ""}
                        onChange={handleFieldChange}
                        disabled={!editing}
                      />
                    </label>
                    <label className="profile-full-width">
                      Places traveled
                      <textarea
                        name="places_traveled"
                        className="profile-input"
                        value={draft.places_traveled}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        rows="3"
                      />
                    </label>
                    <label className="profile-full-width">
                      Bio
                      <textarea
                        name="bio"
                        className="profile-input"
                        value={draft.bio}
                        onChange={handleFieldChange}
                        disabled={!editing}
                        rows="4"
                      />
                    </label>
                  </div>

                  {editing && (
                    <div className="profile-actions">
                      <button
                        type="button"
                        className="profile-button profile-button-cancel"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="profile-button profile-button-save"
                        disabled={saving || Boolean(pictureError)}
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </section>
          )}

          {activeTab === "posts" && (
            <section
              className="profile-panel"
              role="tabpanel"
              aria-labelledby="profile-posts-tab"
            >
              <div className="profile-panel-heading">
                <div>
                  <h2>Your posts</h2>
                  <p>Travel moments you have shared.</p>
                </div>
                <div>
                    <button
                        type="button"
                        className="add-post-button"
                        onClick={handleAddPost}
                    >
                        Add Post
                    </button>
                </div>
              </div>
              {loadingPosts ? (
                <p className="profile-message">Loading your posts…</p>
              ) : posts.length === 0 ? (
                <p className="profile-empty">You have not shared any posts yet.</p>
              ) : (
                <div className="profile-post-grid">
                  {posts.map((post) => (
                    <article className="profile-post-card" key={post.id}>
                      {post.media_items?.[0]?.url ? (
                        post.media_items[0].type === "video" ? (
                          <video
                            className="profile-post-image"
                            src={post.media_items[0].url}
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <img
                            className="profile-post-image"
                            src={post.media_items[0].url}
                            alt={`Post from ${post.place}`}
                          />
                        )
                      ) : post.upload_content ? (
                        <img
                          className="profile-post-image"
                          src={post.upload_content}
                          alt={`Post from ${post.place}`}
                        />
                      ) : (
                        <div className="profile-post-image-placeholder">
                          <FaMapMarkerAlt aria-hidden="true" />
                        </div>
                      )}
                      <div className="profile-post-body">
                        <h3>{post.place}</h3>
                        <p>{post.caption}</p>
                        <div className="profile-post-meta">
                          <span>
                            <FaCalendarAlt aria-hidden="true" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          <span>
                            <FaRegComment aria-hidden="true" />
                            {post.comments_count}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Profile;
