import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "../../supabaseClient";
import "./Blog.scss";

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setBlog(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (notFound) {
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

  return (
    <div className="blog-page">
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

      <motion.article
        className="blog-post"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back link */}
        <Link to="/blog" className="blog-post__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 8H3M7 4L3 8l4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All Posts
        </Link>

        {/* Header */}
        <header className="blog-post__header">
          <span className="blog-post__date">{formatDate(blog.created_at)}</span>
          <h1 className="blog-post__title">{blog.title}</h1>
          {blog.meta_description && (
            <p className="blog-post__excerpt">{blog.meta_description}</p>
          )}
        </header>

        {/* Cover image */}
        {blog.image_url && (
          <div className="blog-post__cover">
            <img src={blog.image_url} alt={blog.title} />
          </div>
        )}

        {/* Markdown content */}
        <div className="blog-post__content">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        {/* Footer */}
        <footer className="blog-post__footer">
          <Link to="/blog" className="blog-back-link">
            ← Back to Blog
          </Link>
        </footer>
      </motion.article>
    </div>
  );
}
