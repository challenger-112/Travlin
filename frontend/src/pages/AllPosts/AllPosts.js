import React, { useEffect, useState } from "react";
import "./AllPosts.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import API from "../../services/api";
import { Link } from "react-router-dom";

const isLoggedIn = Boolean(
  localStorage.getItem("access_token") &&
  localStorage.getItem("refresh_token")
);

const DEFAULT_PROFILE_PICTURE = "https://placehold.co/160x160?text=Profile";
const EMPTY_PROFILE = {
  username: "",
  email: "",
  profile_picture: "",
};

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [picturePreview, setPicturePreview] = useState("");

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
        const { data } = await API.get("posts/");
        if (isMounted) {
          setPosts(data.map((post) => ({
            id: post.id,
            username: post.author || "Anonymous",
            profilePic: post.author_profile_picture || "",
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
        {isLoggedIn ? (
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
        ) : (
          <header className="posts-header-anonymous-header">
            <div className="posts-heading">
              <h1>Share your journey memories with us</h1>
              <p>Create an account to share your own travel moments.</p>
              < button className="signup-cta" onClick={() => (window.location.href = "/signup")}>
                Sign up
              </button>
            </div>
          </header>
        )}

        <div className="posts-grid">
            {posts.map((post) => {
                const isLiked = likedPosts.includes(post.id);

                return (
                <article className="post-card" key={post.id}>
                    <div className="post-card-header">
                    <img
                        src={post.profilePic || DEFAULT_PROFILE_PICTURE}
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
    </div>
    <Footer />
    </>
  );
}