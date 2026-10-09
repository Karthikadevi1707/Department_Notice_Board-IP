export interface Notice {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface NoticeCardProps {
  title: string;
  message: string;
  createdAt: string;
}

const NoticeCard = ({ title, message, createdAt }: NoticeCardProps) => {
  const postedDate = new Date(createdAt);
  const formattedDate = Number.isNaN(postedDate.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(postedDate);

  return (
    <article className="notice-card">
      <div className="notice-card-heading">
        <span className="notice-icon" aria-hidden="true">
          &#128227;
        </span>
        <h3>{title}</h3>
      </div>
      <p className="notice-message">{message}</p>
      <p className="notice-date">
        <span aria-hidden="true">&#128197;</span> Posted: {formattedDate}
      </p>
    </article>
  );
};

export default NoticeCard;
