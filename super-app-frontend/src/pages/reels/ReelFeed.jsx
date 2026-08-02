import React, { useEffect, useState, useRef } from 'react';
import { useReelStore } from '../../store/reelStore';
import Loader from '../../components/common/Loader';
import { Heart, MessageSquare, ShieldAlert, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReelFeed = () => {
  const { reels, fetchReels, likeReel, addComment } = useReelStore();
  const [commentingReelId, setCommentingReelId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Handle active video autoplay on scroll snap
  useEffect(() => {
    reels.forEach((reel, idx) => {
      const vid = videoRefs.current[reel.id];
      if (vid) {
        if (idx === activeReelIdx) {
          vid.play().catch(e => console.log('Autoplay blocked. User action needed.'));
        } else {
          vid.pause();
        }
      }
    });
  }, [activeReelIdx, reels]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPos = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      const index = Math.round(scrollPos / height);
      if (index !== activeReelIdx) {
        setActiveReelIdx(index);
      }
    }
  };

  const handleCommentSubmit = (e, reelId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(reelId, commentText, 'me');
    setCommentText('');
  };

  if (reels.length === 0) {
    return <Loader message="Accessing active vertical video cache..." size="large" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      {/* Feed sub navigation links */}
      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 700 }}>
        <button
          onClick={() => navigate('/reels/trending')}
          style={{ background: 'none', border: 'none', color: 'hsl(var(--accent-cyan))', cursor: 'pointer' }}
        >
          Trending
        </button>
        <button
          onClick={() => navigate('/reels/upload')}
          style={{
            background: 'none',
            border: 'none',
            color: 'hsl(var(--text-secondary))',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Plus size={14} /> Upload
        </button>
      </div>

      {/* Vertical Snap viewport simulating mobile feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '620px',
          backgroundColor: '#000',
          borderRadius: 'var(--border-radius-lg)',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          position: 'relative',
          boxShadow: 'var(--glass-shadow)',
          border: '1px solid rgba(255,255,255,0.08)',
          scrollbarWidth: 'none', // FireFox
        }}
      >
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            style={{
              width: '100%',
              height: '100%',
              scrollSnapAlign: 'start',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* HTML5 video loop stream */}
            <video
              ref={(el) => (videoRefs.current[reel.id] = el)}
              src={reel.videoUrl}
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onClick={(e) => {
                // Pause/play on click
                if (e.currentTarget.paused) e.currentTarget.play();
                else e.currentTarget.pause();
              }}
            />

            {/* Side Action overlay */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                bottom: '80px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                zIndex: 20,
              }}
            >
              {/* Creator details avatar */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid hsl(var(--accent-cyan))',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/reels/profile')}
              >
                {reel.creatorAvatar}
              </div>

              {/* Likes */}
              <button
                onClick={() => likeReel(reel.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: reel.isLiked ? 'hsl(var(--accent-red))' : '#fff',
                }}
              >
                <Heart size={24} fill={reel.isLiked ? 'currentColor' : 'none'} style={{ filter: reel.isLiked ? 'drop-shadow(0 0 8px rgba(255,0,85,0.4))' : 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px', color: '#fff' }}>{reel.likes}</span>
              </button>

              {/* Comments trigger */}
              <button
                onClick={() => setCommentingReelId(commentingReelId === reel.id ? null : reel.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#fff',
                }}
              >
                <MessageSquare size={24} />
                <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px', color: '#fff' }}>{reel.comments.length}</span>
              </button>
            </div>

            {/* Bottom Content overlay */}
            <div
              style={{
                position: 'absolute',
                left: '16px',
                bottom: '20px',
                right: '70px',
                color: '#fff',
                zIndex: 20,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/reels/profile')}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>@{reel.creator}</span>
                <span className="badge badge-info" style={{ fontSize: '8px', padding: '2px 6px' }}>Sentinel Verified</span>
              </div>
              <p style={{ fontSize: '12px', marginTop: '6px', lineHeight: 1.4, margin: '6px 0 0 0', opacity: 0.9 }}>
                {reel.description}
              </p>
            </div>

            {/* Shadow gradients overlays (aesthetic visual polish) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '120px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '180px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Comments Overlay Panel */}
            {commentingReelId === reel.id && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'rgba(10, 15, 25, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px 16px 0 0',
                  zIndex: 30,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: 'slideUp var(--transition-fast) forwards'
                }}
              >
                <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Comments ({reel.comments.length})</span>
                  <button
                    onClick={() => setCommentingReelId(null)}
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Close
                  </button>
                </div>

                {/* Comments List */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reel.comments.map((comment, cIdx) => (
                    <div key={cIdx} style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 700, color: 'hsl(var(--accent-cyan))' }}>@{comment.user}</span>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{comment.text}</span>
                    </div>
                  ))}
                </div>

                {/* Comment input form */}
                <form onSubmit={(e) => handleCommentSubmit(e, reel.id)} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="glass-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add comment..."
                    style={{ height: '36px', padding: '0 12px', fontSize: '12px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', height: '36px', fontSize: '12px' }}>
                    Post
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelFeed;
