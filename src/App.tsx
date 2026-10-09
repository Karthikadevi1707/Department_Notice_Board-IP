import { FormEvent, useCallback, useEffect, useState } from 'react';
import './App.css';
import NoticeCard, { Notice } from './components/NoticeCard';

const API_URL = 'http://localhost:5000/api/notices';

interface GetNoticesResponse {
  success: boolean;
  notices: Notice[];
  message?: string;
}

interface CreateNoticeResponse {
  success: boolean;
  message: string;
  notice: Notice;
}

function App() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchNotices = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const result = (await response.json()) as GetNoticesResponse;

      if (!response.ok || !result.success || !Array.isArray(result.notices)) {
        throw new Error(result.message || 'Unable to load notices');
      }

      setNotices(result.notices);
      setLoadError('');
      return result.notices;
    } catch {
      setLoadError('Unable to load notices. Please make sure the server is running.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const addNotice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      setFormError('Please enter a notice title.');
      return;
    }

    if (!trimmedMessage) {
      setFormError('Please enter a notice message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: trimmedTitle, message: trimmedMessage }),
      });
      const result = (await response.json()) as CreateNoticeResponse;

      if (!response.ok || !result.success || !result.notice) {
        throw new Error(result.message || 'Failed to add notice');
      }

      setTitle('');
      setMessage('');
      setSuccessMessage('Notice added successfully!');

      const refreshedNotices = await fetchNotices();
      if (refreshedNotices === null) {
        setNotices((currentNotices) => [result.notice, ...currentNotices]);
      }
    } catch {
      setFormError('Failed to add notice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Department Notice Board home">
            <span className="brand-mark" aria-hidden="true">D</span>
            <span className="brand-name">Department Notice Board</span>
          </a>
          <span className="header-tag">Department Updates</span>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome-panel">
          <p className="welcome-eyebrow">CAMPUS COMMUNICATION</p>
          <h1>Department Notice Board</h1>
          <p className="welcome-subtitle">
            Stay informed with the latest announcements and updates from your department.
          </p>
        </section>

        <section className="form-panel" aria-labelledby="add-notice-heading">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">+</span>
            <div>
              <h2 id="add-notice-heading">Add New Notice</h2>
              <p>Share an important update with the department.</p>
            </div>
          </div>

          <form className="notice-form" onSubmit={addNotice} noValidate>
            <div className="form-field">
              <label htmlFor="notice-title">Notice Title</label>
              <input
                id="notice-title"
                type="text"
                placeholder="e.g. Exam Announcement"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
              />
            </div>

            <div className="form-field">
              <label htmlFor="notice-message">Notice Message</label>
              <textarea
                id="notice-message"
                placeholder="Write the details of your announcement..."
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={2000}
              />
            </div>

            {formError && <p className="feedback error-message" role="alert">{formError}</p>}
            {successMessage && <p className="feedback success-message" role="status">{successMessage}</p>}

            <div className="form-actions">
              <p>Notices are visible to everyone using this board.</p>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding notice...' : 'Add Notice'}
              </button>
            </div>
          </form>
        </section>

        <section className="notices-section" aria-labelledby="all-notices-heading">
          <div className="notices-heading">
            <div>
              <p className="section-eyebrow">LATEST UPDATES</p>
              <h2 id="all-notices-heading">All Notices</h2>
            </div>
            <span className="notice-count">
              {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
            </span>
          </div>

          {isLoading ? (
            <div className="state-card" role="status">Loading notices...</div>
          ) : loadError && notices.length === 0 ? (
            <div className="state-card error-message" role="alert">{loadError}</div>
          ) : notices.length === 0 ? (
            <div className="state-card empty-state">
              <span className="empty-icon" aria-hidden="true">&#128227;</span>
              <h3>No notices available</h3>
              <p>New department announcements will appear here.</p>
            </div>
          ) : (
            <>
              {loadError && <p className="refresh-warning" role="alert">{loadError}</p>}
              <div className="notice-list">
                {notices.map((notice) => (
                  <NoticeCard
                    key={notice._id}
                    title={notice.title}
                    message={notice.message}
                    createdAt={notice.createdAt}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">Department Notice Board · Campus announcements</footer>
    </div>
  );
}

export default App;
