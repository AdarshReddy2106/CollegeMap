import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "../../supabaseClient";
import "./Blog.scss";

/** Send a GA4 custom event (safe no-op if gtag isn't loaded) */
const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
};

const sendPageView = (pagePath, pageTitle) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
      page_title: pageTitle,
      page_referrer: document.referrer || undefined,
    });
  }
};

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const pageViewSentRef = useRef(false);

  // Scroll-depth tracking refs
  const scrollMilestonesRef = useRef(new Set());
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    async function fetchBlogAndRelated() {
      setLoading(true);
      setNotFound(false);
      try {
        // Fetch current article
        const { data: currentBlog, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (error || !currentBlog) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setBlog(currentBlog);

        // Fetch related & sidebar posts (excluding current post)
        const { data: related } = await supabase
          .from("blogs")
          .select("slug, title, image_url, created_at, read_time, meta_description")
          .eq("published", true)
          .neq("slug", slug)
          .order("created_at", { ascending: false })
          .limit(3);

        setRelatedPosts(related || []);

        // Fetch all published posts to determine Previous & Next links
        const { data: allPosts } = await supabase
          .from("blogs")
          .select("slug, title, created_at")
          .eq("published", true)
          .order("created_at", { ascending: true });

        if (allPosts && allPosts.length > 0) {
          const currentIndex = allPosts.findIndex((p) => p.slug === slug);
          if (currentIndex !== -1) {
            setPrevPost(currentIndex > 0 ? allPosts[currentIndex - 1] : null);
            setNextPost(
              currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
            );
          }
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogAndRelated();
    window.scrollTo(0, 0);
  }, [slug]);

  /* ── GA: blog_post_view ── */
  useEffect(() => {
    if (!loading && !pageViewSentRef.current) {
      pageViewSentRef.current = true;
      sendPageView(
        `/blog/${slug}`,
        blog ? `${blog.title} | CollegeMap Blog` : "Post not found | CollegeMap Blog"
      );
    }

    if (blog) {
      trackEvent("blog_post_view", {
        blog_slug: blog.slug,
        blog_title: blog.title,
        content_length: blog.content ? blog.content.length : 0,
      });
    }
  }, [blog, loading, slug]);

  /* ── GA: scroll-depth milestones (25 / 50 / 75 / 100 %) ── */
  useEffect(() => {
    if (!blog) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);
      const milestones = [25, 50, 75, 100];

      milestones.forEach((m) => {
        if (pct >= m && !scrollMilestonesRef.current.has(m)) {
          scrollMilestonesRef.current.add(m);
          trackEvent("blog_post_scroll", {
            blog_slug: blog.slug,
            blog_title: blog.title,
            scroll_depth: m,
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [blog]);

  /* ── GA: estimated read time on unmount ── */
  useEffect(() => {
    if (!blog) return;

    const postSlug = blog.slug;
    const postTitle = blog.title;
    const entryTime = startTimeRef.current;

    return () => {
      const seconds = Math.round((Date.now() - entryTime) / 1000);
      trackEvent("blog_post_read_time", {
        blog_slug: postSlug,
        blog_title: postTitle,
        read_time_seconds: seconds,
      });
    };
  }, [blog]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getReadTime = (article) => {
    if (article.read_time) return article.read_time;
    if (!article.content) return "3 min read";
    const wordCount = article.content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-post-loading">
          <div className="blog-spinner" />
          <p>Loading article…</p>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="blog-page">
        <div className="blog-not-found">
          <span className="blog-not-found__icon">📄</span>
          <h2>Post not found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="blog-back-link">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const currentUrl = encodeURIComponent(window.location.href);
  const currentTitle = encodeURIComponent(blog.title);

  return (
    <div className="blog-page blog-page--details">
      <Helmet>
        <title>{blog.title} | CollegeMap Blog</title>
        {blog.meta_description && (
          <meta name="description" content={blog.meta_description} />
        )}
        {/* Open Graph */}
        <meta property="og:title" content={`${blog.title} | CollegeMap`} />
        {blog.meta_description && (
          <meta property="og:description" content={blog.meta_description} />
        )}
        {blog.image_url && (
          <meta property="og:image" content={blog.image_url} />
        )}
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Top Breadcrumb Bar */}
      <div className="blog-breadcrumb-wrapper">
        <div className="blog-breadcrumb">
          <Link to="/">Home</Link>
          <span className="blog-breadcrumb__sep">/</span>
          <Link to="/blog">Blog</Link>
          <span className="blog-breadcrumb__sep">/</span>
          <span className="blog-breadcrumb__current">{blog.title}</span>
        </div>
      </div>

      <div className="blog-layout-container">
        <motion.main
          className="blog-main-content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <article className="blog-post">
            {/* Header Meta Line */}
            <div className="blog-post__meta-bar">
              <span className="blog-post__date">
                {formatDate(blog.created_at)}
              </span>
              <span className="blog-post__dot">•</span>
              <span className="blog-post__read-time">{getReadTime(blog)}</span>
            </div>

            {/* Title */}
            <h1 className="blog-post__title">{blog.title}</h1>

            {/* Subtitle / Excerpt */}
            {blog.meta_description && (
              <p className="blog-post__excerpt">{blog.meta_description}</p>
            )}

            {/* Author & Share Bar */}
            <div className="blog-post__author-share">
              <div className="blog-post__author">
                <div className="blog-post__author-avatar">
                  <img
                    src={blog.author_avatar || "/karthik_bansal.jpg"}
                    alt={blog.author_name || "Karthik Bansal"}
                  />
                </div>
                <div className="blog-post__author-info">
                  <span className="blog-post__author-name">
                    {blog.author_name || "Karthik Bansal"}
                  </span>
                  <span className="blog-post__author-role">
                    {blog.author_role || "Editor, NIT Delhi"}
                  </span>
                </div>
              </div>

              <div className="blog-post__share">
                <span className="blog-post__share-label">SHARE</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${currentTitle}&url=${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn"
                  title="Share on X (Twitter)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn"
                  title="Share on LinkedIn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="share-btn share-btn--copy"
                  title="Copy link"
                >
                  {copiedLink ? (
                    <span className="copied-text">✓</span>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Cover image */}
            {blog.image_url && (
              <div className="blog-post__cover">
                <img src={blog.image_url} alt={blog.title} />
              </div>
            )}

            {/* Markdown content (Supports 3-paragraph split: content_start, content_body, content_end) */}
            <div className="blog-post__content">
              {blog.content_start || blog.content_body || blog.content_end ? (
                <>
                  {blog.content_start && (
                    <div className="blog-post__para blog-post__para--start">
                      <ReactMarkdown>{blog.content_start}</ReactMarkdown>
                    </div>
                  )}
                  {blog.content_body && (
                    <div className="blog-post__para blog-post__para--body">
                      <ReactMarkdown>{blog.content_body}</ReactMarkdown>
                    </div>
                  )}
                  {blog.content_end && (
                    <div className="blog-post__para blog-post__para--end">
                      <ReactMarkdown>{blog.content_end}</ReactMarkdown>
                    </div>
                  )}
                </>
              ) : (
                <ReactMarkdown>
                  {blog.content ? blog.content.replace(/(?<!\n)\n(?!\n)/g, "\n\n") : ""}
                </ReactMarkdown>
              )}
            </div>

            {/* Bottom Navigation (Previous / Next Post) */}
            <div className="blog-post__nav">
              {prevPost ? (
                <Link to={`/blog/${prevPost.slug}`} className="blog-nav-item blog-nav-item--prev">
                  <span className="blog-nav-item__label">← PREVIOUS</span>
                  <span className="blog-nav-item__title">{prevPost.title}</span>
                </Link>
              ) : (
                <div className="blog-nav-item blog-nav-item--disabled" />
              )}

              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`} className="blog-nav-item blog-nav-item--next">
                  <span className="blog-nav-item__label">NEXT →</span>
                  <span className="blog-nav-item__title">{nextPost.title}</span>
                </Link>
              ) : (
                <div className="blog-nav-item blog-nav-item--disabled" />
              )}
            </div>
          </article>
        </motion.main>

        {/* Right Sidebar */}
        <aside className="blog-sidebar">
          {/* Widget 1: Explore Our Tools */}
          <div className="sidebar-widget sidebar-widget--tools">
            <h3 className="sidebar-widget__title">EXPLORE OUR TOOLS</h3>
            <ul className="sidebar-tools-list">
              <li>
                <Link to="/CollegePredictor" className="sidebar-tool-item">
                  <div className="sidebar-tool-item__info">
                    <strong>College Predictor</strong>
                    <span>See colleges within your rank range</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="/BranchComparision" className="sidebar-tool-item">
                  <div className="sidebar-tool-item__info">
                    <strong>Branch Comparison</strong>
                    <span>Compare branches side by side</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="/TalkToIITians" className="sidebar-tool-item">
                  <div className="sidebar-tool-item__info">
                    <strong>Talk to IITians</strong>
                    <span>1:1 mentorship from IITians</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link to="/Mentorship" className="sidebar-tool-item">
                  <div className="sidebar-tool-item__info">
                    <strong>Mentorship</strong>
                    <span>Structured, mentor-led prep</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* Widget 2: Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="sidebar-widget sidebar-widget--related">
              <h3 className="sidebar-widget__title">RELATED POSTS</h3>
              <div className="sidebar-related-list">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="sidebar-related-item"
                  >
                    {post.image_url && (
                      <div className="sidebar-related-item__thumb">
                        <img src={post.image_url} alt={post.title} />
                      </div>
                    )}
                    <div className="sidebar-related-item__details">
                      <h4 className="sidebar-related-item__title">{post.title}</h4>
                      <span className="sidebar-related-item__meta">
                        {getReadTime(post)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/blog" className="sidebar-related__view-all">
                View all posts →
              </Link>
            </div>
          )}

          {/* Widget 3: CollegeMap Banner */}
          <div className="sidebar-widget sidebar-widget--banner">
            <span className="sidebar-banner__tag">COLLEGEMAP</span>
            <p className="sidebar-banner__desc">
              Get personalised college predictions, branch comparisons, and mentorship from IITians — all in one place.
            </p>
            <Link to="/" className="sidebar-banner__btn">
              Visit CollegeMap →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

