"use client";

import { useState, useEffect, useCallback } from "react";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400";

  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border ${bgColor} shadow-lg max-w-sm`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">&times;</button>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-pulse">
      <div className="h-4 bg-[var(--border)] rounded w-20" />
      <div className="h-4 bg-[var(--border)] rounded flex-1" />
      <div className="flex gap-3">
        <div className="h-4 bg-[var(--border)] rounded w-12" />
        <div className="h-4 bg-[var(--border)] rounded w-16" />
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchUrls = useCallback(async () => {
    try {
      const res = await fetch("/api/shorten");
      const data = await res.json();
      setUrls(Array.isArray(data) ? data : []);
    } catch {
      setUrls([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Something went wrong", "error");
      } else {
        setUrl("");
        fetchUrls();
        showToast(res.status === 200 ? "Link already exists!" : "Short link created!");
      }
    } catch {
      showToast("Failed to shorten URL", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    const shortUrl = `${window.location.origin}/api/${code}`;
    navigator.clipboard.writeText(shortUrl);
    showToast("Copied to clipboard!");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/shorten", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setUrls((prev) => prev.filter((u) => u._id !== id));
        showToast("Link deleted!");
      } else {
        showToast("Failed to delete link", "error");
      }
    } catch {
      showToast("Failed to delete link", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">URL Shortener</h1>
        <p className="text-[var(--muted)]">Paste a long URL and get a short, shareable link</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 mb-8 bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]"
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very-long-url..."
          required
          maxLength={2048}
          className="flex-1 bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-lg px-4 py-3 outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Shortening...
            </span>
          ) : (
            "Shorten"
          )}
        </button>
      </form>

      {/* URL List */}
      {fetching ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : urls.length === 0 ? (
        <div className="text-center text-[var(--muted)] py-16">
          <p className="text-lg">No shortened URLs yet</p>
          <p className="text-sm mt-1">Create your first short link above</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-3">Your Links ({urls.length})</h2>
          {urls.map((item) => (
            <div
              key={item._id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              {/* Short URL */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[var(--accent)] font-mono font-semibold text-sm">
                  /{item.code}
                </span>
                <button
                  onClick={() => copyToClipboard(item.code)}
                  className="text-xs bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>

              {/* Original URL */}
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted)] text-sm truncate hover:text-[var(--text)] transition-colors flex-1"
                title={item.originalUrl}
              >
                {item.originalUrl}
              </a>

              {/* Stats & Actions */}
              <div className="flex items-center gap-3 text-xs shrink-0">
                <span className="text-[var(--muted)]">
                  {item.clicks} click{item.clicks !== 1 ? "s" : ""}
                </span>
                <span className="text-[var(--muted)]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>

                {/* Delete */}
                {deleteConfirm === item._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-xs bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item._id)}
                    className="text-[var(--muted)] hover:text-red-400 transition-colors cursor-pointer p-1"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
