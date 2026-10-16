import React, { useEffect, useRef, useState } from "react";
import "./Posts.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import API from "../../services/api";

const DEFAULT_PROFILE_PICTURE = "https://placehold.co/160x160?text=Profile";
const EMPTY_PROFILE = {
  username: "",
  email: "",
  profile_picture: "",
};

export default function Post() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [place, setPlace] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);


  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [picturePreview, setPicturePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");



  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const { data } = await API.get("profile/");
        if (isMounted) {
          const userProfile = { ...EMPTY_PROFILE, ...data };
          setProfile(userProfile);
          setPicturePreview(userProfile.profile_picture || "");
        }
      } catch (requestError) {
        console.error("Unable to load profile:", requestError);
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ||
            "Unable to load your profile. Please try again."
          );
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        const { data } = await API.get("posts/mine/");
        if (isMounted) {
          setPosts(data.map((post) => ({
            id: post.id,
            username: post.author || "Anonymous",
            profilePic: "",
            place: post.place,
            caption: post.caption,
            media: (post.media_items || []).map((item) => ({
              url: item.url,
              type: item.type,
            })),
            date: new Date(post.created_at).toLocaleDateString(),
            likes: 0,
          })));
        }
      } catch (requestError) {
        console.error("Unable to load posts:", requestError);
        if (isMounted) {
          setError(
            requestError.response?.data?.detail ||
            "Unable to load your posts. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    };

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);


  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    setFiles(selectedFiles);
    setPreviewUrls(
      selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
        name: file.name,
      }))
    );
  };

  const resetForm = () => {
    previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    setPlace("");
    setCaption("");
    setFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!place.trim() || !caption.trim()) {
      setError("Please enter a place and caption.");
      return;
    }

    if (files.length === 0) {
      setError("Please upload at least one photo or video.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("place", place.trim());
    formData.append("caption", caption.trim());
    files.forEach((file) => formData.append("media", file));

    try {
      const { data } = await API.post("posts/add/", formData);
      const newPost = {
        id: data.id,
        username: data.author || profile.username || "Anonymous",
        profilePic: profile.profile_picture || DEFAULT_PROFILE_PICTURE,
        place: data.place,
        caption: data.caption,
        media: (data.media_items || []).map((item) => ({
          url: item.url,
          type: item.type,
        })),
        date: new Date(data.created_at).toLocaleDateString(),
        likes: 0,
      };

      setPosts((previousPosts) => [newPost, ...previousPosts]);
      resetForm();
      setShowModal(false);
    } catch (requestError) {
      console.error("Unable to save post:", requestError);
      const responseData = requestError.response?.data;
      setError(
        responseData?.media?.[0] ||
        responseData?.upload_content?.[0] ||
        responseData?.place?.[0] ||
        responseData?.caption?.[0] ||
        responseData?.detail ||
        "Unable to save your post. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleLike = (postId) => {
    setLikedPosts((previous) =>
      previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [...previous, postId]
    );

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: Math.max(
                0,
                post.likes +
                  (likedPosts.includes(postId) ? -1 : 1)
              ),
            }
          : post
      )
    );
  };

  return (
    <>
        < Navbar />
        <div className="posts-page">
        {/* Top profile header */}
        <header className="posts-header">
          <img
            src={picturePreview || DEFAULT_PROFILE_PICTURE}
            alt={`${profile.username || "User"} profile`}
            className="profile-avatar"
          />
          <div className="posts-heading">
            <h1>{profile.username || "My Profile"}</h1>
            <p className="posts-email">{profile.email}</p>
            <span className="header-subtitle">Your space, your story</span>
          </div>

          <div className="brand">
            <span className="brand-icon">✦</span>
            <span>Journeys To Be Remembered</span>
            </div>
        </header>

        {error && <p className="profile-message error" role="alert">{error}</p>}

        <main className="posts-main">
            {/* Welcome section */}
            <section className="welcome-section">
            <span className="eyebrow">YOUR PERSONAL JOURNAL</span>
            <h1>Capture your <span>moments.</span></h1>
            <p>
                Share the places you visit and the memories you make.
            </p>

            <button
                className="create-post-btn"
                onClick={() => setShowModal(true)}
            >
                <span className="plus-icon">＋</span>
                Create a post
            </button>
            </section>

            {/* Posts feed */}
            <section className="feed-section">
            <div className="feed-heading">
                <div>
                <h2>Your posts</h2>
                <p>Your memories, all in one place.</p>
                </div>
                <span className="post-count">{posts.length} posts</span>
            </div>

            {loadingPosts ? (
                <p className="profile-message">Loading your posts…</p>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                <div className="empty-icon">✧</div>
                <h3>Your story starts here</h3>
                <p>
                    You haven't shared anything yet. Add your first
                    photo or video and make this space yours.
                </p>
                <button
                    className="empty-create-btn"
                    onClick={() => setShowModal(true)}
                >
                    Create your first post
                </button>
                </div>
            ) : (
                <div className="posts-grid">
                {posts.map((post) => {
                    const isLiked = likedPosts.includes(post.id);

                    return (
                    <article className="post-card" key={post.id}>
                        <div className="post-card-header">
                        <img
                            src={post.profilePic || profile.profile_picture || DEFAULT_PROFILE_PICTURE}
                            alt={post.username}
                            className="post-avatar"
                        />
                        <div className="post-author">
                            <strong>{post.username}</strong>
                            <span>📍 {post.place}</span>
                        </div>
                        <span className="post-date">{post.date}</span>
                        </div>

                        <div className="post-media">
                        {post.media.map((media, index) => (
                            <div
                            className="media-item"
                            key={`${post.id}-${index}`}
                            >
                            {media.type === "video" ? (
                                <video
                                src={media.url}
                                controls
                                preload="metadata"
                                className="post-content"
                                />
                            ) : (
                                <img
                                src={media.url}
                                alt={`Post ${index + 1}`}
                                className="post-content"
                                />
                            )}
                            </div>
                        ))}
                        </div>

                        <div className="post-details">
                        <p className="post-caption">{post.caption}</p>
                        <div className="post-actions">
                            <button
                            className={`like-btn ${isLiked ? "liked" : ""}`}
                            onClick={() => toggleLike(post.id)}
                            aria-label={isLiked ? "Unlike post" : "Like post"}
                            >
                            {isLiked ? "♥" : "♡"} {post.likes}
                            </button>
                            <span className="memory-label">
                            ✦ A little moment
                            </span>
                        </div>
                        </div>
                    </article>
                    );
                })}
                </div>
            )}
            </section>
        </main>

        {/* Create post popup */}
        {showModal && (
            <div
            className="modal-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                resetForm();
                setShowModal(false);
                }
            }}
            >
            <div
                className="post-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="modal-header">
                <div>
                    <span className="eyebrow">MAKE A MEMORY</span>
                    <h2 id="modal-title">Create a post</h2>
                </div>
                <button
                    type="button"
                    className="close-modal"
                    aria-label="Close"
                    onClick={() => {
                    resetForm();
                    setShowModal(false);
                    }}
                >
                    ×
                </button>
                </div>

                <div className="modal-user">
                <img src={profile.profile_picture || DEFAULT_PROFILE_PICTURE} alt="" className="post-avatar" />
                <div>
                    <strong>{profile.username || "Anonymous"}</strong>
                    <span>Share something beautiful</span>
                </div>
                </div>

                <form onSubmit={handleSubmit}>
                {error && <p className="profile-message error" role="alert">{error}</p>}
                <label htmlFor="post-place">Where was this?</label>
                <div className="input-with-icon">
                    <span>📍</span>
                    <input
                    id="post-place"
                    type="text"
                    placeholder="Enter a place or location"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    required
                    />
                </div>

                <label htmlFor="post-caption">Your caption</label>
                <textarea
                    id="post-caption"
                    placeholder="Write a little something about this moment..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    required
                />

                <label>Photos & videos</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    className="file-input"
                    id="post-upload"
                    required
                />

                <label htmlFor="post-upload" className="upload-area">
                    <span className="upload-icon">↥</span>
                    <strong>Click to upload</strong>
                    <span>Choose photos or videos from your device</span>
                </label>

                {previewUrls.length > 0 && (
                    <div className="preview-grid">
                    {previewUrls.map((media, index) => (
                        <div className="preview-item" key={media.url}>
                        {media.type === "video" ? (
                            <video src={media.url} muted />
                        ) : (
                            <img src={media.url} alt={media.name} />
                        )}
                        <button
                            type="button"
                            className="remove-preview"
                            aria-label={`Remove ${media.name}`}
                            onClick={() => {
                            URL.revokeObjectURL(media.url);
                            setFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                            );
                            setPreviewUrls((prev) =>
                                prev.filter((_, i) => i !== index)
                            );
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                            }}
                        >
                            ×
                        </button>
                        </div>
                    ))}
                    </div>
                )}

                <button type="submit" className="publish-btn" disabled={saving}>
                    {saving ? "Publishing…" : <>Publish post <span>↗</span></>}
                </button>
                </form>
            </div>
            </div>
      )}
    </div>
    <Footer />
    </>
  );
}